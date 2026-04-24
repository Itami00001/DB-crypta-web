const db = require("../models");
const User = db.users;
const CryptoWallet = db.cryptoWallets;
const { validate, createUserSchema, updateUserSchema } = require("../middleware/validation");

// Create a new User
exports.create = async (req, res) => {
  try {
    // Use validated body
    const user = {
      username: req.validatedBody.username,
      email: req.validatedBody.email,
      passwordHash: req.validatedBody.passwordHash,
      firstName: req.validatedBody.firstName,
      lastName: req.validatedBody.lastName,
      phone: req.validatedBody.phone,
      isVerified: req.validatedBody.isVerified ? req.validatedBody.isVerified : false,
      coinBalance: 1000 // Начальный бонус 1000 COIN при регистрации
    };

    // Save User in the database
    const userData = await User.create(user);

    // Создать кошелёк для нового пользователя
    const wallet = {
      userId: userData.id,
      walletAddress: generateWalletAddress(userData.username),
      walletType: 'hot', // Горячий кошелёк по умолчанию
      balance: 0,
      currencyCode: 'BTC', // Основная криптовалюта
      isActive: true
    };

    await CryptoWallet.create(wallet);

    res.send(userData);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the User."
    });
  }
};

// Генерация уникального адреса кошелька
function generateWalletAddress(username) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${username.toLowerCase()}_${random}_${timestamp}`;
}

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
  User.findAll({
    include: [
      {
        model: CryptoWallet,
        as: 'wallets'
      }
    ]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users."
      });
    });
};

// Find a single User with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findByPk(id, {
    include: [
      {
        model: CryptoWallet,
        as: 'wallets'
      }
    ]
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find User with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving User with id=" + id
      });
    });
};

// Update a User by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  User.update(req.validatedBody, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "User was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating User with id=" + id
      });
    });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  User.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "User was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete User with id=${id}. Maybe User was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete User with id=" + id
      });
    });
};

// Delete all Users from the database.
exports.deleteAll = (req, res) => {
  User.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Users were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all users."
      });
    });
};

// Admin: Top up user balance
exports.adminTopup = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const userId = req.params.id;
    const { currency, amount } = req.body;

    if (!currency || !amount || amount <= 0) {
      await transaction.rollback();
      return res.status(400).send({ message: "Currency and amount are required" });
    }

    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).send({ message: "User not found" });
    }

    const CryptoWallet = db.cryptoWallets;

    // Update user balance based on currency
    switch (currency) {
      case 'COIN':
        await user.update({ coinBalance: parseFloat(user.coinBalance || 0) + parseFloat(amount) }, { transaction });
        break;
      case 'BTC':
        await user.update({ btcBalance: parseFloat(user.btcBalance || 0) + parseFloat(amount) }, { transaction });
        break;
      case 'USD':
        await user.update({ usdBalance: parseFloat(user.usdBalance || 0) + parseFloat(amount) }, { transaction });
        break;
      case 'RUB':
        await user.update({ rubBalance: parseFloat(user.rubBalance || 0) + parseFloat(amount) }, { transaction });
        break;
      default:
        await transaction.rollback();
        return res.status(400).send({ message: "Invalid currency" });
    }

    // Sync wallet with new structure
    let wallet = await CryptoWallet.findOne({
      where: { userId: userId },
      transaction
    });
    if (!wallet) {
      wallet = await CryptoWallet.create({
        userId: userId,
        walletAddress: `wallet_${user.username}_${Date.now()}`,
        walletType: 'default',
        coinBalance: user.coinBalance || 0,
        btcBalance: user.btcBalance || 0,
        usdBalance: user.usdBalance || 0,
        rubBalance: user.rubBalance || 0,
        isActive: true
      }, { transaction });
    } else {
      await wallet.update({
        coinBalance: user.coinBalance || 0,
        btcBalance: user.btcBalance || 0,
        usdBalance: user.usdBalance || 0,
        rubBalance: user.rubBalance || 0
      }, { transaction });
    }

    await transaction.commit();

    res.send({
      message: `Balance topped up successfully`,
      user: {
        id: user.id,
        username: user.username,
        coinBalance: user.coinBalance,
        btcBalance: user.btcBalance,
        usdBalance: user.usdBalance,
        rubBalance: user.rubBalance
      }
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).send({
      message: error.message || "Error topping up balance"
    });
  }
};
