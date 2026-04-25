const db = require("../models");
const User = db.users;
const CryptoWallet = db.cryptoWallets;
const bcrypt = require("bcryptjs");

class UserService {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<User>} Created user
   */
  static async createUser(userData) {
    const { username, email, password, firstName, lastName, phone } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [{ username }, { email }]
      }
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new Error("Username already exists");
      }
      if (existingUser.email === email) {
        throw new Error("Email already exists");
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username,
      email,
      passwordHash,
      firstName,
      lastName,
      phone
    });

    // Create default wallet for the user
    await CryptoWallet.create({
      userId: user.id,
      walletAddress: `wallet_${user.id}_${Date.now()}`,
      walletType: 'default'
    });

    return user;
  }

  /**
   * Find user by ID
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<User>} User instance
   */
  static async findUserById(userId, options = {}) {
    const user = await User.findByPk(userId, options);
    
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Find user by username or email
   * @param {string} identifier - Username or email
   * @param {Object} options - Query options
   * @returns {Promise<User>} User instance
   */
  static async findUserByIdentifier(identifier, options = {}) {
    const user = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [{ username: identifier }, { email: identifier }]
      },
      ...options
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @param {Object} options - Query options
   * @returns {Promise<User>} Updated user
   */
  static async updateUser(userId, updateData, options = {}) {
    const user = await this.findUserById(userId, options);

    // Check for username/email conflicts
    if (updateData.username || updateData.email) {
      const existingUser = await User.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            ...(updateData.username ? [{ username: updateData.username }] : []),
            ...(updateData.email ? [{ email: updateData.email }] : [])
          ],
          id: { [db.Sequelize.Op.ne]: userId }
        }
      });

      if (existingUser) {
        if (existingUser.username === updateData.username) {
          throw new Error("Username already exists");
        }
        if (existingUser.email === updateData.email) {
          throw new Error("Email already exists");
        }
      }
    }

    await user.update(updateData, options);
    return user;
  }

  /**
   * Delete user and associated data
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<boolean>} True if deleted
   */
  static async deleteUser(userId, options = {}) {
    const user = await this.findUserById(userId, options);

    // In a real application, you might want to soft delete
    // or handle user data according to GDPR requirements
    await user.destroy(options);
    return true;
  }

  /**
   * Get all users (admin only)
   * @param {Object} options - Query options
   * @returns {Promise<User[]>} List of users
   */
  static async getAllUsers(options = {}) {
    return await User.findAll(options);
  }

  /**
   * Top up user balance (admin only)
   * @param {string} userId - User ID
   * @param {string} currency - Currency code
   * @param {number} amount - Amount to add
   * @param {Object} sequelizeTransaction - Sequelize transaction
   * @returns {Promise<Object>} Top-up result
   */
  static async topUpBalance(userId, currency, amount, sequelizeTransaction) {
    if (!amount || amount <= 0) {
      throw new Error("Amount must be positive");
    }

    const allowedCurrencies = new Set(['COIN', 'USD', 'RUB', 'BTC']);
    if (!allowedCurrencies.has(currency)) {
      throw new Error("Unsupported currency");
    }

    const balanceField = this.getBalanceField(currency);

    // Find user with row lock
    const user = await User.findByPk(userId, { 
      transaction: sequelizeTransaction,
      lock: sequelizeTransaction.LOCK.UPDATE 
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Update balance
    const currentBalance = parseFloat(user[balanceField] || 0);
    const newBalance = currentBalance + parseFloat(amount);

    await user.update({ [balanceField]: newBalance }, { transaction: sequelizeTransaction });

    // Update wallet
    const wallet = await this.findOrCreateWallet(userId, sequelizeTransaction, { [balanceField]: newBalance });

    return {
      message: "Balance topped up successfully",
      newBalance,
      currency
    };
  }

  /**
   * Get user balance for all currencies
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User balances
   */
  static async getUserBalances(userId) {
    const user = await this.findUserById(userId, {
      attributes: ['coinBalance', 'btcBalance', 'usdBalance', 'rubBalance']
    });

    return {
      COIN: parseFloat(user.coinBalance || 0),
      BTC: parseFloat(user.btcBalance || 0),
      USD: parseFloat(user.usdBalance || 0),
      RUB: parseFloat(user.rubBalance || 0)
    };
  }

  /**
   * Verify user password
   * @param {string} password - Plain password
   * @param {string} passwordHash - Hashed password
   * @returns {Promise<boolean>} True if password matches
   */
  static async verifyPassword(password, passwordHash) {
    return await bcrypt.compare(password, passwordHash);
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
      transaction: sequelizeTransaction
    });

    if (!wallet) {
      wallet = await CryptoWallet.create({
        userId,
        walletAddress: `wallet_${userId}_${Date.now()}`,
        walletType: 'default',
        ...balanceUpdates
      }, { transaction: sequelizeTransaction });
    } else if (Object.keys(balanceUpdates).length > 0) {
      await wallet.update(balanceUpdates, { transaction: sequelizeTransaction });
    }

    return wallet;
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} True if password changed
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await this.findUserById(userId);

    // Verify current password
    const isValidPassword = await this.verifyPassword(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await user.update({ passwordHash: newPasswordHash });

    return true;
  }

  /**
   * Toggle user verification status (admin only)
   * @param {string} userId - User ID
   * @param {boolean} isVerified - Verification status
   * @returns {Promise<User>} Updated user
   */
  static async toggleVerification(userId, isVerified) {
    const user = await this.findUserById(userId);
    await user.update({ isVerified });
    return user;
  }

  /**
   * Toggle user admin status (admin only)
   * @param {string} userId - User ID
   * @param {boolean} isAdmin - Admin status
   * @returns {Promise<User>} Updated user
   */
  static async toggleAdminStatus(userId, isAdmin) {
    const user = await this.findUserById(userId);
    await user.update({ isAdmin });
    return user;
  }
}

module.exports = UserService;
