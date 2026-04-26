const db = require("../models");
const Transaction = db.transactions;
const User = db.users;
const CryptoWallet = db.cryptoWallets;
const CryptoCurrency = db.cryptoCurrencies;
const MAX_SERIALIZATION_RETRIES = 3;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isSerializationFailure = (error) =>
  error?.name === "SequelizeDatabaseError" &&
  (error?.original?.code === "40001" || String(error?.message || "").toLowerCase().includes("could not serialize access"));

const runWithSerializableRetry = async (handler) => {
  let lastError = null;
  for (let attempt = 1; attempt <= MAX_SERIALIZATION_RETRIES; attempt += 1) {
    const transaction = await db.sequelize.transaction({
      isolationLevel: db.Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    });

    try {
      const result = await handler(transaction);
      await transaction.commit();
      return result;
    } catch (err) {
      lastError = err;
      if (transaction) {
        await transaction.rollback();
      }

      if (!isSerializationFailure(err) || attempt === MAX_SERIALIZATION_RETRIES) {
        throw err;
      }
    }
  }
  throw lastError;
};

// Create a new Transaction
exports.create = (req, res) => {
  if (!req.body.amount || !req.body.currencyCode || !req.body.transactionType || !req.body.fromWalletId || !req.body.toWalletId) {
    res.status(400).send({
      message: "Amount, currency code, transaction type, from wallet ID and to wallet ID are required!"
    });
    return;
  }

  const transaction = {
    amount: req.body.amount,
    currencyCode: req.body.currencyCode,
    transactionType: req.body.transactionType,
    status: req.body.status ? req.body.status : 'pending',
    fee: req.body.fee ? req.body.fee : 0,
    transactionHash: req.body.transactionHash,
    fromWalletId: req.body.fromWalletId,
    toWalletId: req.body.toWalletId
  };

  Transaction.create(transaction)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating Transaction."
      });
    });
};

// Retrieve all Transactions from database.
exports.findAll = (req, res) => {
  const userId = req.userId; // Will be set if verifyToken was used, but it's optional now
  const hasValidUuidUserId = typeof userId === "string" && UUID_REGEX.test(userId);

  // If we want to strictly filter by user even on public route (if token is provided in headers)
  // We need to call verifyToken optionally or manually here.
  // For now, let's just make it return empty if no userId is found, 
  // OR return all if requested by an admin (if we implement admin check).

  if (!hasValidUuidUserId) {
    return res.send([]);
  }

  const whereClause = {
    [db.Sequelize.Op.or]: [
      { '$fromWallet.user_id$': userId },
      { '$toWallet.user_id$': userId }
    ]
  };

  Transaction.findAll({
    where: whereClause,
    include: [
      {
        model: CryptoWallet,
        as: 'fromWallet',
        attributes: ['id', 'walletAddress', 'walletType', 'currencyCode']
      },
      {
        model: CryptoWallet,
        as: 'toWallet',
        attributes: ['id', 'walletAddress', 'walletType', 'currencyCode']
      }
    ],
    order: [['createdAt', 'DESC']]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving transactions."
      });
    });
};

// Find a single Transaction with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Transaction.findByPk(id, {
    include: [
      {
        model: CryptoWallet,
        as: 'fromWallet',
        attributes: ['id', 'walletAddress', 'walletType', 'currencyCode']
      },
      {
        model: CryptoWallet,
        as: 'toWallet',
        attributes: ['id', 'walletAddress', 'walletType', 'currencyCode']
      }
    ]
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Transaction with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Transaction with id=" + id
      });
    });
};

// Find transactions by wallet ID
exports.findByWalletId = (req, res) => {
  const walletId = req.params.walletId;

  Transaction.findAll({
    where: {
      [db.Sequelize.Op.or]: [
        { fromWalletId: walletId },
        { toWalletId: walletId }
      ]
    },
    include: [
      {
        model: CryptoWallet,
        as: 'fromWallet',
        attributes: ['id', 'walletAddress', 'walletType', 'currencyCode']
      },
      {
        model: CryptoWallet,
        as: 'toWallet',
        attributes: ['id', 'walletAddress', 'walletType', 'currencyCode']
      }
    ],
    order: [['createdAt', 'DESC']]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving wallet transactions."
      });
    });
};

// Update a Transaction by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Transaction.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Transaction was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Transaction with id=${id}. Maybe Transaction was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Transaction with id=" + id
      });
    });
};

// Delete a Transaction with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Transaction.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Transaction was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Transaction with id=${id}. Maybe Transaction was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Transaction with id=" + id
      });
    });
};

// Delete all Transactions from the database.
exports.deleteAll = (req, res) => {
  Transaction.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Transactions were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all transactions."
      });
    });
};

// Transfer between users with ACID transaction
exports.transferBetweenUsers = async (req, res) => {
  try {
    const { toUsername, currency, amount } = req.body;
    const fromUserId = req.userId;

    if (!toUsername || !currency || amount === undefined || amount === null) {
      return res.status(400).send({ message: "Recipient, currency and amount are required" });
    }

    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).send({ message: "Amount must be a positive number" });
    }
    const result = await runWithSerializableRetry(async (transaction) => {
      const fromUser = await User.findByPk(fromUserId, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      const toUser = await User.findOne({
        where: { username: toUsername },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!fromUser) {
        const err = new Error("Sender not found");
        err.statusCode = 404;
        throw err;
      }
      if (!toUser) {
        const err = new Error("Recipient not found");
        err.statusCode = 400;
        throw err;
      }
      if (fromUser.id === toUser.id) {
        const err = new Error("Cannot transfer to yourself");
        err.statusCode = 400;
        throw err;
      }

      const allowedCurrencies = new Set(['COIN', 'USD', 'RUB', 'BTC']);
      if (!allowedCurrencies.has(currency)) {
        const err = new Error("Unsupported currency");
        err.statusCode = 400;
        throw err;
      }

      const balanceField = currency === 'RUB' ? 'rubBalance' : (currency === 'USD' ? 'usdBalance' : (currency === 'BTC' ? 'btcBalance' : 'coinBalance'));
      const fromBalance = parseFloat(fromUser[balanceField] || 0);
      if (fromBalance < parsedAmount) {
        const err = new Error("Insufficient balance");
        err.statusCode = 400;
        throw err;
      }

      await fromUser.update({ [balanceField]: fromBalance - parsedAmount }, { transaction });
      await toUser.update({ [balanceField]: parseFloat(toUser[balanceField] || 0) + parsedAmount }, { transaction });

      let fromWallet = await CryptoWallet.findOne({
        where: { userId: fromUserId },
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      if (!fromWallet) {
        fromWallet = await CryptoWallet.create({
          userId: fromUserId,
          walletAddress: `wallet_${fromUserId}_${Date.now()}`,
          walletType: 'default',
          [balanceField]: fromUser[balanceField]
        }, { transaction });
      } else {
        await fromWallet.update({ [balanceField]: fromUser[balanceField] }, { transaction });
      }

      let toWallet = await CryptoWallet.findOne({
        where: { userId: toUser.id },
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      if (!toWallet) {
        toWallet = await CryptoWallet.create({
          userId: toUser.id,
          walletAddress: `wallet_${toUser.id}_${Date.now()}`,
          walletType: 'default',
          [balanceField]: toUser[balanceField]
        }, { transaction });
      } else {
        await toWallet.update({ [balanceField]: toUser[balanceField] }, { transaction });
      }

      await Transaction.create({
        amount: parsedAmount,
        currencyCode: currency,
        transactionType: 'transfer',
        status: 'completed',
        transactionHash: `TRANSFER_${Date.now()}`,
        fromWalletId: fromWallet.id,
        toWalletId: toWallet.id,
        notes: `Transfer from ${fromUser.username} to ${toUser.username}`
      }, { transaction });

      return { newBalance: fromUser[balanceField] };
    });

    res.send({ message: "Transfer successful", newBalance: result.newBalance });
  } catch (err) {
    console.error("Transfer error:", err);
    if (isSerializationFailure(err)) {
      return res.status(409).send({ message: "Could not serialize access, please retry request" });
    }
    res.status(err.statusCode || 500).send({ message: err.message || "Error processing transfer" });
  }
};

// Exchange currency with ACID transaction
exports.exchangeCurrency = async (req, res) => {
  try {
    const { fromCurrency, toCurrency, amount } = req.body;
    const userId = req.userId;

    if (!fromCurrency || !toCurrency || amount === undefined || amount === null) {
      return res.status(400).send({ message: "From currency, to currency and amount are required" });
    }

    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).send({ message: "Amount must be a positive number" });
    }

    if (fromCurrency === toCurrency) {
      return res.status(400).send({ message: "From and to currency must be different" });
    }
    const result = await runWithSerializableRetry(async (transaction) => {
      const user = await User.findByPk(userId, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
      }

      const rates = { 'COIN': 1, 'USD': 0.5, 'RUB': 50, 'BTC': 0.00001 };
      if (!rates[fromCurrency] || !rates[toCurrency]) {
        const err = new Error("Unsupported currency");
        err.statusCode = 400;
        throw err;
      }
      const fromField = fromCurrency === 'RUB' ? 'rubBalance' : (fromCurrency === 'USD' ? 'usdBalance' : (fromCurrency === 'BTC' ? 'btcBalance' : 'coinBalance'));
      const toField = toCurrency === 'RUB' ? 'rubBalance' : (toCurrency === 'USD' ? 'usdBalance' : (toCurrency === 'BTC' ? 'btcBalance' : 'coinBalance'));

      if (parseFloat(user[fromField] || 0) < parsedAmount) {
        const err = new Error("Insufficient balance");
        err.statusCode = 400;
        throw err;
      }

      const amountInCoin = parsedAmount / rates[fromCurrency];
      const targetAmount = amountInCoin * rates[toCurrency];

      await user.update({
        [fromField]: parseFloat(user[fromField]) - parsedAmount,
        [toField]: parseFloat(user[toField] || 0) + targetAmount
      }, { transaction });

      let wallet = await CryptoWallet.findOne({
        where: { userId: userId },
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      if (!wallet) {
        wallet = await CryptoWallet.create({
          userId: userId,
          walletAddress: `wallet_${userId}_${Date.now()}`,
          walletType: 'default',
          [fromField]: user[fromField],
          [toField]: user[toField]
        }, { transaction });
      } else {
        await wallet.update({
          [fromField]: user[fromField],
          [toField]: user[toField]
        }, { transaction });
      }

      await Transaction.create({
        amount: parsedAmount,
        currencyCode: toCurrency,
        transactionType: 'exchange',
        status: 'completed',
        transactionHash: `EXCHANGE_${Date.now()}`,
        fromWalletId: wallet.id,
        toWalletId: wallet.id,
        notes: `Exchange ${amount} ${fromCurrency} to ${targetAmount.toFixed(8)} ${toCurrency}`
      }, { transaction });

      return {
        newBalanceFrom: user[fromField],
        newBalanceTo: user[toField],
        exchangedAmount: targetAmount
      };
    });

    res.send({
      message: "Exchange successful",
      newBalanceFrom: result.newBalanceFrom,
      newBalanceTo: result.newBalanceTo,
      exchangedAmount: result.exchangedAmount
    });
  } catch (err) {
    console.error("Exchange error:", err);
    if (isSerializationFailure(err)) {
      return res.status(409).send({ message: "Could not serialize access, please retry request" });
    }
    res.status(err.statusCode || 500).send({ message: err.message || "Error processing exchange" });
  }
};
