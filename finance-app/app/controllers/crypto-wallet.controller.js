const db = require("../models");
const CryptoWallet = db.cryptoWallets;
const User = db.users;
const Transaction = db.transactions;

// Create a new CryptoWallet
exports.create = (req, res) => {
  // Validate request
  if (!req.body.walletAddress || !req.body.walletType || !req.body.userId) {
    res.status(400).send({
      message: "Wallet address, type and user ID are required!"
    });
    return;
  }

  // Create a CryptoWallet with all balance fields
  const cryptoWallet = {
    walletAddress: req.body.walletAddress,
    walletType: req.body.walletType,
    coinBalance: req.body.coinBalance ? req.body.coinBalance : 0,
    btcBalance: req.body.btcBalance ? req.body.btcBalance : 0,
    usdBalance: req.body.usdBalance ? req.body.usdBalance : 0,
    rubBalance: req.body.rubBalance ? req.body.rubBalance : 0,
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
  const currentUserId = req.userId; // From auth middleware

  CryptoWallet.findAll({
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName', 'isAdmin']
      }
    ]
  })
    .then(data => {
      // Hide all balances for wallets that don't belong to the current user (unless admin)
      const wallets = data.map(wallet => {
        const walletData = wallet.toJSON();
        
        // Hide balances if wallet doesn't belong to current user AND current user is not admin
        if (wallet.userId !== currentUserId && !req.isAdmin) {
          walletData.coinBalance = null;
          walletData.btcBalance = null;
          walletData.usdBalance = null;
          walletData.rubBalance = null;
        }
        return walletData;
      });
      res.send(wallets);
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
  const currentUserId = req.userId; // From auth middleware

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
        const walletData = data.toJSON();
        // Hide all balances if wallet doesn't belong to current user
        if (walletData.userId !== currentUserId) {
          walletData.coinBalance = null;
          walletData.btcBalance = null;
          walletData.usdBalance = null;
          walletData.rubBalance = null;
        }
        res.send(walletData);
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

// Find current user's wallets
exports.findMyWallets = (req, res) => {
  try {
    const currentUserId = req.userId; // From auth middleware

    if (!currentUserId) {
      return res.status(401).send({
        message: "Unauthorized: User ID not found"
      });
    }

    CryptoWallet.findAll({
      where: { userId: currentUserId },
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
          message: err.message || "Some error occurred while retrieving your crypto wallets."
        });
      });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Server error while retrieving wallets"
    });
  }
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

// Ensure user has a wallet with balances from user profile
exports.ensureWallet = async (req, res) => {
  try {
    const currentUserId = req.userId; // From auth middleware

    if (!currentUserId) {
      return res.status(401).send({
        message: "Unauthorized: User ID not found"
      });
    }

    // Get user data with balances
    const user = await User.findByPk(currentUserId);
    if (!user) {
      return res.status(404).send({
        message: "User not found"
      });
    }

    // Check if user has a wallet
    let wallet = await CryptoWallet.findOne({
      where: { userId: currentUserId }
    });

    if (!wallet) {
      // Create new wallet with user's balances
      wallet = await CryptoWallet.create({
        walletAddress: `wallet_${user.username}_${Date.now()}`,
        walletType: 'default',
        coinBalance: user.coinBalance || 0,
        btcBalance: user.btcBalance || 0,
        usdBalance: user.usdBalance || 0,
        rubBalance: user.rubBalance || 0,
        isActive: true,
        userId: currentUserId
      });
    } else {
      // Update existing wallet with user's balances if they're different
      const needsUpdate = 
        parseFloat(wallet.coinBalance) !== parseFloat(user.coinBalance) ||
        parseFloat(wallet.btcBalance) !== parseFloat(user.btcBalance) ||
        parseFloat(wallet.usdBalance) !== parseFloat(user.usdBalance) ||
        parseFloat(wallet.rubBalance) !== parseFloat(user.rubBalance);

      if (needsUpdate) {
        await wallet.update({
          coinBalance: user.coinBalance || 0,
          btcBalance: user.btcBalance || 0,
          usdBalance: user.usdBalance || 0,
          rubBalance: user.rubBalance || 0
        });
      }
    }

    res.send({
      message: "Wallet ensured successfully",
      wallet: wallet
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error ensuring wallet"
    });
  }
};
