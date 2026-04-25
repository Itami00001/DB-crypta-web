const db = require("../models");
const Transaction = db.transactions;
const User = db.users;
const CryptoWallet = db.cryptoWallets;

class TransactionService {
  /**
   * Create a new transaction record
   * @param {Object} transactionData - Transaction data
   * @param {Object} options - Sequelize options (including transaction)
   * @returns {Promise<Transaction>} Created transaction
   */
  static async createTransaction(transactionData, options = {}) {
    return await Transaction.create(transactionData, options);
  }

  /**
   * Transfer funds between users with SERIALIZABLE isolation
   * @param {string} fromUserId - Sender user ID
   * @param {string} toUsername - Recipient username
   * @param {string} currency - Currency code
   * @param {number} amount - Amount to transfer
   * @param {Object} sequelizeTransaction - Sequelize transaction instance
   * @returns {Promise<Object>} Transfer result
   */
  static async transferFunds(fromUserId, toUsername, currency, amount, sequelizeTransaction) {
    // Validate inputs
    if (!toUsername || !currency || amount === undefined || amount === null) {
      throw new Error("Recipient, currency and amount are required");
    }

    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      throw new Error("Amount must be a positive number");
    }

    // Find users with row locks
    const fromUser = await User.findByPk(fromUserId, { 
      transaction: sequelizeTransaction,
      lock: sequelizeTransaction.LOCK.UPDATE 
    });
    const toUser = await User.findOne({ 
      where: { username: toUsername }, 
      transaction: sequelizeTransaction,
      lock: sequelizeTransaction.LOCK.UPDATE 
    });

    if (!toUser) {
      throw new Error("Recipient not found");
    }
    if (fromUser.id === toUser.id) {
      throw new Error("Cannot transfer to yourself");
    }

    // Validate currency
    const allowedCurrencies = new Set(['COIN', 'USD', 'RUB', 'BTC']);
    if (!allowedCurrencies.has(currency)) {
      throw new Error("Unsupported currency");
    }

    const balanceField = this.getBalanceField(currency);
    const fromBalance = parseFloat(fromUser[balanceField] || 0);
    
    if (fromBalance < parsedAmount) {
      throw new Error("Insufficient balance");
    }

    // Update user balances
    await fromUser.update({ [balanceField]: fromBalance - parsedAmount }, { transaction: sequelizeTransaction });
    await toUser.update({ [balanceField]: parseFloat(toUser[balanceField] || 0) + parsedAmount }, { transaction: sequelizeTransaction });

    // Update or create wallets
    const fromWallet = await this.findOrCreateWallet(fromUserId, sequelizeTransaction, { [balanceField]: fromUser[balanceField] });
    const toWallet = await this.findOrCreateWallet(toUser.id, sequelizeTransaction, { [balanceField]: toUser[balanceField] });

    // Create transaction record
    const transaction = await this.createTransaction({
      amount: parsedAmount,
      currencyCode: currency,
      transactionType: 'transfer',
      status: 'completed',
      transactionHash: `TRANSFER_${Date.now()}`,
      fromWalletId: fromWallet.id,
      toWalletId: toWallet.id
    }, { transaction: sequelizeTransaction });

    return {
      message: "Transfer successful",
      newBalance: fromUser[balanceField],
      transaction
    };
  }

  /**
   * Exchange currency with SERIALIZABLE isolation
   * @param {string} userId - User ID
   * @param {string} fromCurrency - Source currency
   * @param {string} toCurrency - Target currency
   * @param {number} amount - Amount to exchange
   * @param {Object} sequelizeTransaction - Sequelize transaction instance
   * @returns {Promise<Object>} Exchange result
   */
  static async exchangeCurrency(userId, fromCurrency, toCurrency, amount, sequelizeTransaction) {
    // Validate inputs
    if (!fromCurrency || !toCurrency || amount === undefined || amount === null) {
      throw new Error("From currency, to currency and amount are required");
    }

    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      throw new Error("Amount must be a positive number");
    }

    if (fromCurrency === toCurrency) {
      throw new Error("From and to currency must be different");
    }

    // Find user with row lock
    const user = await User.findByPk(userId, { 
      transaction: sequelizeTransaction,
      lock: sequelizeTransaction.LOCK.UPDATE 
    });

    // Get exchange rates (in real app, this would come from an external API)
    const rates = { 'COIN': 1, 'USD': 0.5, 'RUB': 50, 'BTC': 0.00001 };
    if (!rates[fromCurrency] || !rates[toCurrency]) {
      throw new Error("Unsupported currency");
    }

    const fromField = this.getBalanceField(fromCurrency);
    const toField = this.getBalanceField(toCurrency);

    if (parseFloat(user[fromField] || 0) < parsedAmount) {
      throw new Error("Insufficient balance");
    }

    // Calculate exchange
    const amountInCoin = parsedAmount / rates[fromCurrency];
    const targetAmount = amountInCoin * rates[toCurrency];

    // Update user balances
    await user.update({
      [fromField]: parseFloat(user[fromField]) - parsedAmount,
      [toField]: parseFloat(user[toField] || 0) + targetAmount
    }, { transaction: sequelizeTransaction });

    // Update or create wallet
    const wallet = await this.findOrCreateWallet(userId, sequelizeTransaction, {
      [fromField]: user[fromField],
      [toField]: user[toField]
    });

    // Create transaction record
    const transaction = await this.createTransaction({
      amount: parsedAmount,
      currencyCode: toCurrency,
      transactionType: 'exchange',
      status: 'completed',
      transactionHash: `EXCHANGE_${Date.now()}`,
      fromWalletId: wallet.id,
      toWalletId: wallet.id
    }, { transaction: sequelizeTransaction });

    return {
      message: "Exchange successful",
      newBalanceFrom: user[fromField],
      newBalanceTo: user[toField],
      exchangedAmount: targetAmount,
      transaction
    };
  }

  /**
   * Get balance field name for currency
   * @param {string} currency - Currency code
   * @returns {string} Balance field name
   */
  static getBalanceField(currency) {
    switch (currency) {
      case 'RUB': return 'rubBalance';
      case 'USD': return 'usdBalance';
      case 'BTC': return 'btcBalance';
      default: return 'coinBalance';
    }
  }

  /**
   * Find or create wallet for user
   * @param {string} userId - User ID
   * @param {Object} sequelizeTransaction - Sequelize transaction
   * @param {Object} balanceUpdates - Balance fields to update
   * @returns {Promise<CryptoWallet>} Wallet instance
   */
  static async findOrCreateWallet(userId, sequelizeTransaction, balanceUpdates = {}) {
    let wallet = await CryptoWallet.findOne({ 
      where: { userId }, 
      transaction: sequelizeTransaction,
      lock: sequelizeTransaction.LOCK.UPDATE 
    });

    if (!wallet) {
      wallet = await CryptoWallet.create({
        userId,
        walletAddress: `wallet_${userId}_${Date.now()}`,
        walletType: 'default',
        ...balanceUpdates
      }, { transaction: sequelizeTransaction });
    } else {
      await wallet.update(balanceUpdates, { transaction: sequelizeTransaction });
    }

    return wallet;
  }

  /**
   * Get all transactions for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Transaction[]>} List of transactions
   */
  static async getUserTransactions(userId, options = {}) {
    const whereClause = {
      [db.Sequelize.Op.or]: [
        { '$fromWallet.user_id$': userId },
        { '$toWallet.user_id$': userId }
      ]
    };

    return await Transaction.findAll({
      where: whereClause,
      include: [
        {
          model: CryptoWallet,
          as: 'fromWallet',
          attributes: ['id', 'walletAddress', 'walletType']
        },
        {
          model: CryptoWallet,
          as: 'toWallet',
          attributes: ['id', 'walletAddress', 'walletType']
        }
      ],
      order: [['createdAt', 'DESC']],
      ...options
    });
  }

  /**
   * Get transaction by ID with user access check
   * @param {string} transactionId - Transaction ID
   * @param {string} userId - User ID (for access control)
   * @returns {Promise<Transaction>} Transaction instance
   */
  static async getTransactionById(transactionId, userId) {
    const transaction = await Transaction.findByPk(transactionId, {
      include: [
        {
          model: CryptoWallet,
          as: 'fromWallet',
          attributes: ['id', 'walletAddress', 'walletType', 'userId']
        },
        {
          model: CryptoWallet,
          as: 'toWallet',
          attributes: ['id', 'walletAddress', 'walletType', 'userId']
        }
      ]
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Check if user has access to this transaction
    if (transaction.fromWallet?.userId !== userId && transaction.toWallet?.userId !== userId) {
      throw new Error("Access denied");
    }

    return transaction;
  }
}

module.exports = TransactionService;
