const db = require("../models");
const User = db.users;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Регистрация пользователя
exports.signup = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { username, email, password, firstName, lastName, phone } = req.body;

    // Проверка существования пользователя
    const existingUser = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      await transaction.rollback();
      return res.status(400).send({
        message: "Пользователь с таким именем или email уже существует"
      });
    }

    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создание пользователя с начальным балансом
    const user = await User.create({
      username,
      email,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      phone,
      isVerified: true,
      coinBalance: 1000 // 1000 коинов при регистрации
    }, { transaction });

    // Создание кошелька для внутренней валюты
    const CryptoCurrency = db.cryptoCurrencies;
    const CryptoWallet = db.cryptoWallets;

    // Проверяем существует ли внутренняя валюта
    let internalCurrency = await CryptoCurrency.findOne({
      where: { symbol: "COIN" }
    }, { transaction });

    if (!internalCurrency) {
      internalCurrency = await CryptoCurrency.create({
        symbol: "COIN",
        name: "Internal Coins",
        description: "Внутренняя валюта приложения",
        currentPrice: 0.10, // 10 рублей = 100 коинов
        marketCap: 0,
        volume24h: 0,
        isActive: true
      }, { transaction });
    }

    // Создание кошелька для пользователя
    await CryptoWallet.create({
      userId: user.id,
      walletAddress: `COIN_${user.id}_${Date.now()}`,
      walletType: "internal",
      balance: 1000, // Начальный баланс
      currencyCode: "COIN"
    }, { transaction });

    await transaction.commit();

    res.status(201).send({
      message: "Пользователь успешно зарегистрирован",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        coinBalance: user.coinBalance
      }
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).send({
      message: error.message || "Ошибка при регистрации пользователя"
    });
  }
};

// Вход пользователя
exports.signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Поиск пользователя
    const user = await User.findOne({
      where: { username: username }
    });

    if (!user) {
      return res.status(401).send({
        message: "Неверные учетные данные"
      });
    }

    // Проверка пароля
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).send({
        message: "Неверные учетные данные"
      });
    }

    // Автоматическая установка isAdmin для пользователя admin
    if (username === 'admin' && !user.isAdmin) {
      await user.update({ isAdmin: true });
    }

    // Создание JWT токена
    const token = jwt.sign(
      { id: user.id, username: user.username, isAdmin: user.isAdmin || username === 'admin' },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.status(200).send({
      message: "Вход выполнен успешно",
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        coinBalance: user.coinBalance || 0,
        isAdmin: user.isAdmin || username === 'admin'
      }
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка при входе"
    });
  }
};

// Получение текущего пользователя
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId; // Из middleware

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] }
    });

    if (!user) {
      return res.status(404).send({
        message: "Пользователь не найден"
      });
    }

    // Получение баланса коинов
    const CryptoWallet = db.cryptoWallets;
    const coinWallet = await CryptoWallet.findOne({
      where: {
        userId: userId,
        currencyCode: "COIN"
      }
    });

    res.status(200).send({
      user: {
        ...user.toJSON(),
        coinBalance: coinWallet ? coinWallet.balance : 0,
        isAdmin: user.isAdmin || false
      }
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка получения данных пользователя"
    });
  }
};

// Пополнение баланса
exports.topupBalance = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).send({
        message: "Сумма пополнения должна быть положительной"
      });
    }

    // Конвертация рублей в коины (1 рубль = 10 коинов)
    const coinAmount = amount * 10;

    // Создание транзакции пополнения
    const Transaction = db.transactions;
    const CryptoWallet = db.cryptoWallets;

    // Находим кошелек пользователя
    let coinWallet = await CryptoWallet.findOne({
      where: {
        userId: userId,
        currencyCode: "COIN"
      }
    });

    if (!coinWallet) {
      // Создаем кошелек если его нет
      coinWallet = await CryptoWallet.create({
        userId: userId,
        walletAddress: `COIN_${userId}_${Date.now()}`,
        walletType: "internal",
        balance: 0,
        currencyCode: "COIN"
      });
    }

    // Обновляем баланс
    const newBalance = parseFloat(coinWallet.balance) + coinAmount;
    await coinWallet.update({ balance: newBalance });

    // Создаем запись о транзакции
    await Transaction.create({
      amount: coinAmount,
      currencyCode: "COIN",
      transactionType: "deposit",
      status: "completed",
      fee: 0,
      transactionHash: `DEPOSIT_${Date.now()}`,
      fromWalletId: null,
      toWalletId: coinWallet.id
    });

    res.status(200).send({
      message: "Баланс успешно пополнен",
      amount: coinAmount,
      newBalance: newBalance
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Ошибка пополнения баланса"
    });
  }
};
