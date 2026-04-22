const db = require("../models");
const Transaction = db.transactions;
const User = db.users;
const CryptoWallet = db.cryptoWallets;
const CryptoCurrency = db.cryptoCurrencies;

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

  // If we want to strictly filter by user even on public route (if token is provided in headers)
  // We need to call verifyToken optionally or manually here.
  // For now, let's just make it return empty if no userId is found, 
  // OR return all if requested by an admin (if we implement admin check).

  const whereClause = userId ? {
    [db.Sequelize.Op.or]: [
      { fromWalletId: userId },
      { toWalletId: userId }
    ]
  } : { id: -1 }; // Return nothing if not logged in

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
      },
      {
        model: CryptoCurrency,
        as: 'currency',
        attributes: ['symbol', 'name', 'currentPrice']
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
      },
      {
        model: CryptoCurrency,
        as: 'currency',
        attributes: ['symbol', 'name', 'currentPrice']
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
      },
      {
        model: CryptoCurrency,
        as: 'currency',
        attributes: ['symbol', 'name', 'currentPrice']
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
  const transaction = await db.sequelize.transaction();
  try {
    const { toUsername, currency, amount } = req.body;
    const fromUserId = req.userId;

    if (!toUsername || !currency || !amount || amount <= 0) {
      throw new Error("Recipient, currency and amount are required");
    }

    const fromUser = await User.findByPk(fromUserId, { transaction });
    const toUser = await User.findOne({ where: { username: toUsername }, transaction });

    if (!toUser) throw new Error("Recipient not found");
    if (fromUser.id === toUser.id) throw new Error("Cannot transfer to yourself");

    const balanceField = currency === 'RUB' ? 'rubBalance' : (currency === 'USD' ? 'usdBalance' : (currency === 'BTC' ? 'btcBalance' : 'coinBalance'));

    if (parseFloat(fromUser[balanceField] || 0) < parseFloat(amount)) {
      throw new Error("Insufficient balance");
    }

    await fromUser.update({ [balanceField]: parseFloat(fromUser[balanceField]) - parseFloat(amount) }, { transaction });
    await toUser.update({ [balanceField]: parseFloat(toUser[balanceField] || 0) + parseFloat(amount) }, { transaction });

    // Синхронизируем кошелек для указанной валюты
    const CryptoWallet = db.cryptoWallets;
    
    // Обновляем кошелек отправителя
    let fromWallet = await CryptoWallet.findOne({
      where: { userId: fromUserId, currencyCode: currency },
      transaction
    });
    if (!fromWallet) {
      // Создаем кошелек если его нет
      fromWallet = await CryptoWallet.create({
        userId: fromUserId,
        walletAddress: `${currency}_${fromUserId}_${Date.now()}`,
        walletType: 'internal',
        balance: parseFloat(fromUser[balanceField]),
        currencyCode: currency
      }, { transaction });
    } else {
      await fromWallet.update({ balance: parseFloat(fromUser[balanceField]) }, { transaction });
    }

    // Обновляем кошелек получателя
    let toWallet = await CryptoWallet.findOne({
      where: { userId: toUser.id, currencyCode: currency },
      transaction
    });
    if (!toWallet) {
      // Создаем кошелек если его нет
      toWallet = await CryptoWallet.create({
        userId: toUser.id,
        walletAddress: `${currency}_${toUser.id}_${Date.now()}`,
        walletType: 'internal',
        balance: parseFloat(toUser[balanceField]),
        currencyCode: currency
      }, { transaction });
    } else {
      await toWallet.update({ balance: parseFloat(toUser[balanceField]) }, { transaction });
    }

    await Transaction.create({
      amount: amount,
      currencyCode: currency,
      transactionType: 'transfer',
      status: 'completed',
      transactionHash: `TRANSFER_${Date.now()}`,
      fromWalletId: fromWallet.id,
      toWalletId: toWallet.id,
      notes: `Transfer from ${fromUser.username} to ${toUser.username}`
    }, { transaction });

    await transaction.commit();
    res.send({ message: "Transfer successful", newBalance: fromUser[balanceField] });
  } catch (err) {
    if (transaction) await transaction.rollback();
    res.status(500).send({ message: err.message || "Error processing transfer" });
  }
};

// Exchange currency with ACID transaction
exports.exchangeCurrency = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { fromCurrency, toCurrency, amount } = req.body;
    const userId = req.userId;

    if (!fromCurrency || !toCurrency || !amount || amount <= 0) {
      throw new Error("From currency, to currency and amount are required");
    }

    const user = await User.findByPk(userId, { transaction });

    const rates = { 'COIN': 1, 'USD': 0.5, 'RUB': 50 };
    const fromField = fromCurrency === 'RUB' ? 'rubBalance' : (fromCurrency === 'USD' ? 'usdBalance' : (fromCurrency === 'BTC' ? 'btcBalance' : 'coinBalance'));
    const toField = toCurrency === 'RUB' ? 'rubBalance' : (toCurrency === 'USD' ? 'usdBalance' : (toCurrency === 'BTC' ? 'btcBalance' : 'coinBalance'));

    if (parseFloat(user[fromField] || 0) < parseFloat(amount)) {
      throw new Error("Insufficient balance");
    }

    const amountInCoin = amount / rates[fromCurrency];
    const targetAmount = amountInCoin * rates[toCurrency];

    await user.update({
      [fromField]: parseFloat(user[fromField]) - parseFloat(amount),
      [toField]: parseFloat(user[toField] || 0) + targetAmount
    }, { transaction });

    // Синхронизируем кошельки для обеих валют
    const CryptoWallet = db.cryptoWallets;
    
    // Обновляем кошелек fromCurrency
    let fromWallet = await CryptoWallet.findOne({
      where: { userId: userId, currencyCode: fromCurrency },
      transaction
    });
    if (!fromWallet) {
      fromWallet = await CryptoWallet.create({
        userId: userId,
        walletAddress: `${fromCurrency}_${userId}_${Date.now()}`,
        walletType: 'internal',
        balance: parseFloat(user[fromField]),
        currencyCode: fromCurrency
      }, { transaction });
    } else {
      await fromWallet.update({ balance: parseFloat(user[fromField]) }, { transaction });
    }

    // Обновляем кошелек toCurrency
    let toWallet = await CryptoWallet.findOne({
      where: { userId: userId, currencyCode: toCurrency },
      transaction
    });
    if (!toWallet) {
      toWallet = await CryptoWallet.create({
        userId: userId,
        walletAddress: `${toCurrency}_${userId}_${Date.now()}`,
        walletType: 'internal',
        balance: parseFloat(user[toField]),
        currencyCode: toCurrency
      }, { transaction });
    } else {
      await toWallet.update({ balance: parseFloat(user[toField]) }, { transaction });
    }

    await Transaction.create({
      amount: amount,
      currencyCode: `${fromCurrency}->${toCurrency}`,
      transactionType: 'exchange',
      status: 'completed',
      transactionHash: `EXCHANGE_${Date.now()}`,
      fromWalletId: fromWallet.id,
      toWalletId: toWallet.id,
      notes: `Exchange ${amount} ${fromCurrency} to ${targetAmount.toFixed(8)} ${toCurrency}`
    }, { transaction });

    await transaction.commit();
    res.send({
      message: "Exchange successful",
      newBalanceFrom: user[fromField],
      newBalanceTo: user[toField],
      exchangedAmount: targetAmount
    });
  } catch (err) {
    if (transaction) await transaction.rollback();
    res.status(500).send({ message: err.message || "Error processing exchange" });
  }
};
