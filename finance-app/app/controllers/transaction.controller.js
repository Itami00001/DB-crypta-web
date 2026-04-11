const db = require("../models");
const Transaction = db.transactions;
const CryptoWallet = db.cryptoWallets;
const CryptoCurrency = db.cryptoCurrencies;

// Create a new Transaction
exports.create = (req, res) => {
  // Validate request
  if (!req.body.amount || !req.body.currencyCode || !req.body.transactionType || !req.body.fromWalletId || !req.body.toWalletId) {
    res.status(400).send({
      message: "Amount, currency code, transaction type, from wallet ID and to wallet ID are required!"
    });
    return;
  }

  // Create a Transaction
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

  // Save Transaction in database
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
  Transaction.findAll({
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
