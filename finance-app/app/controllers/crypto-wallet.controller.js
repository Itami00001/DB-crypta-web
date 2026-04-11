const db = require("../models");
const CryptoWallet = db.cryptoWallets;
const User = db.users;
const Transaction = db.transactions;

// Create a new CryptoWallet
exports.create = (req, res) => {
  // Validate request
  if (!req.body.walletAddress || !req.body.walletType || !req.body.currencyCode || !req.body.userId) {
    res.status(400).send({
      message: "Wallet address, type, currency code and user ID are required!"
    });
    return;
  }

  // Create a CryptoWallet
  const cryptoWallet = {
    walletAddress: req.body.walletAddress,
    walletType: req.body.walletType,
    balance: req.body.balance ? req.body.balance : 0,
    currencyCode: req.body.currencyCode,
    isActive: req.body.isActive ? req.body.isActive : true,
    userId: req.body.userId
  };

  // Save CryptoWallet in database
  CryptoWallet.create(cryptoWallet)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating CryptoWallet."
      });
    });
};

// Retrieve all CryptoWallets from database.
exports.findAll = (req, res) => {
  CryptoWallet.findAll({
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName']
      }
    ]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving crypto wallets."
      });
    });
};

// Find a single CryptoWallet with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  CryptoWallet.findByPk(id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName']
      },
      {
        model: Transaction,
        as: 'outgoingTransactions'
      },
      {
        model: Transaction,
        as: 'incomingTransactions'
      }
    ]
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find CryptoWallet with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving CryptoWallet with id=" + id
      });
    });
};

// Find wallets by user ID
exports.findByUserId = (req, res) => {
  const userId = req.params.userId;

  CryptoWallet.findAll({
    where: { userId: userId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName']
      }
    ]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving user's crypto wallets."
      });
    });
};

// Update a CryptoWallet by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  CryptoWallet.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "CryptoWallet was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update CryptoWallet with id=${id}. Maybe CryptoWallet was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating CryptoWallet with id=" + id
      });
    });
};

// Delete a CryptoWallet with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  CryptoWallet.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "CryptoWallet was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete CryptoWallet with id=${id}. Maybe CryptoWallet was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete CryptoWallet with id=" + id
      });
    });
};

// Delete all CryptoWallets from the database.
exports.deleteAll = (req, res) => {
  CryptoWallet.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} CryptoWallets were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all crypto wallets."
      });
    });
};
