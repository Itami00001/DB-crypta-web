const db = require("../models");
const { Sequelize, Op } = db;

// Get user statistics including wallet count and total balance
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const query = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.is_verified,
        u.created_at,
        COUNT(cw.id) as wallet_count,
        COALESCE(SUM(cw.coin_balance), 0) as total_balance,
        COUNT(DISTINCT t.id) as transaction_count,
        COUNT(DISTINCT np.id) as post_count,
        COUNT(DISTINCT up.id) as prediction_count
      FROM users u
      LEFT JOIN crypto_wallets cw ON u.id = cw.user_id
      LEFT JOIN transactions t ON (cw.id = t.from_wallet_id OR cw.id = t.to_wallet_id)
      LEFT JOIN news_posts np ON u.id = np.author_id
      LEFT JOIN user_predictions up ON u.id = up.user_id
      WHERE u.id = :userId
      GROUP BY u.id, u.username, u.email, u.first_name, u.last_name, u.is_verified, u.created_at
    `;
    
    const results = await db.sequelize.query(query, {
      replacements: { userId },
      type: Sequelize.QueryTypes.SELECT
    });
    
    if (results.length === 0) {
      return res.status(404).send({
        message: `User with id=${userId} not found.`
      });
    }
    
    res.send(results[0]);
  } catch (error) {
    res.status(500).send({
      message: "Error retrieving user statistics: " + error.message
    });
  }
};

// Get cryptocurrency statistics including predictions and market data
exports.getCryptoStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        cc.id,
        cc.symbol,
        cc.name,
        cc.current_price,
        cc.market_cap,
        cc.volume24h,
        COUNT(DISTINCT cw.id) as wallet_count,
        COALESCE(SUM(cw.coin_balance), 0) as total_held,
        COUNT(DISTINCT up.id) as prediction_count,
        COUNT(DISTINCT CASE WHEN up.prediction_type = 'bullish' THEN up.id END) as bullish_predictions,
        COUNT(DISTINCT CASE WHEN up.prediction_type = 'bearish' THEN up.id END) as bearish_predictions,
        COUNT(DISTINCT CASE WHEN up.prediction_type = 'neutral' THEN up.id END) as neutral_predictions,
        COALESCE(AVG(up.predicted_price), 0) as avg_predicted_price,
        COALESCE(AVG(up.target_price), 0) as avg_target_price
      FROM crypto_currencies cc
      LEFT JOIN crypto_wallets cw ON cc.symbol = cw.currency_code
      LEFT JOIN user_predictions up ON cc.id = up.currency_id AND up.is_active = true
      WHERE cc.is_active = true
      GROUP BY cc.id, cc.symbol, cc.name, cc.current_price, cc.market_cap, cc.volume24h
      ORDER BY cc.market_cap DESC
    `;
    
    const results = await db.sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT
    });
    
    res.send(results);
  } catch (error) {
    res.status(500).send({
      message: "Error retrieving cryptocurrency statistics: " + error.message
    });
  }
};

// Get transaction analytics by type and currency
exports.getTransactionAnalytics = async (req, res) => {
  try {
    const query = `
      SELECT 
        cc.symbol as currency_symbol,
        cc.name as currency_name,
        t.transaction_type,
        COUNT(t.id) as transaction_count,
        COALESCE(SUM(t.amount), 0) as total_amount,
        COALESCE(AVG(t.amount), 0) as avg_amount,
        COALESCE(SUM(t.fee), 0) as total_fees,
        COALESCE(AVG(t.fee), 0) as avg_fee,
        MIN(t.amount) as min_amount,
        MAX(t.amount) as max_amount
      FROM transactions t
      JOIN crypto_currencies cc ON t.currency_code = cc.symbol
      WHERE t.status = 'completed'
      GROUP BY cc.symbol, cc.name, t.transaction_type
      ORDER BY total_amount DESC
    `;
    
    const results = await db.sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT
    });
    
    res.send(results);
  } catch (error) {
    res.status(500).send({
      message: "Error retrieving transaction analytics: " + error.message
    });
  }
};

// Get popular posts with engagement metrics
exports.getPopularPosts = async (req, res) => {
  try {
    const query = `
      SELECT 
        np.id,
        np.title,
        np.post_type,
        np.category,
        np.view_count,
        np.created_at,
        u.username as author_username,
        u.first_name as author_first_name,
        u.last_name as author_last_name,
        COUNT(DISTINCT c.id) as comment_count,
        COUNT(DISTINCT l.id) as like_count,
        COUNT(DISTINCT CASE WHEN l.like_type = 'like' THEN l.id END) as likes_count,
        COUNT(DISTINCT CASE WHEN l.like_type = 'dislike' THEN l.id END) as dislikes_count,
        COUNT(DISTINCT CASE WHEN l.like_type = 'love' THEN l.id END) as loves_count,
        (COUNT(DISTINCT l.id) * 1.0) / NULLIF(COUNT(DISTINCT c.id), 0) as engagement_ratio
      FROM news_posts np
      JOIN users u ON np.author_id = u.id
      LEFT JOIN comments c ON np.id = c.post_id AND c.is_deleted = false
      LEFT JOIN likes l ON np.id = l.post_id
      WHERE np.is_published = true
      GROUP BY np.id, np.title, np.post_type, np.category, np.view_count, np.created_at, 
               u.username, u.first_name, u.last_name
      ORDER BY engagement_ratio DESC, np.view_count DESC
      LIMIT 20
    `;
    
    const results = await db.sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT
    });
    
    res.send(results);
  } catch (error) {
    res.status(500).send({
      message: "Error retrieving popular posts: " + error.message
    });
  }
};

// Get prediction accuracy statistics
exports.getPredictionAccuracy = async (req, res) => {
  try {
    const query = `
      SELECT 
        cc.symbol as currency_symbol,
        cc.name as currency_name,
        up.prediction_type,
        COUNT(up.id) as total_predictions,
        COUNT(CASE 
          WHEN up.target_date < CURRENT_DATE 
          THEN 1 
        END) as expired_predictions,
        COUNT(CASE 
          WHEN up.target_date >= CURRENT_DATE 
          THEN 1 
        END) as active_predictions,
        COALESCE(AVG(up.predicted_price), 0) as avg_predicted_price,
        COALESCE(AVG(up.target_price), 0) as avg_target_price,
        COALESCE(cc.current_price, 0) as current_price
      FROM user_predictions up
      JOIN crypto_currencies cc ON up.currency_id = cc.id
      GROUP BY cc.symbol, cc.name, up.prediction_type
      ORDER BY total_predictions DESC
    `;
    
    const results = await db.sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT
    });
    
    res.send(results);
  } catch (error) {
    res.status(500).send({
      message: "Error retrieving prediction accuracy: " + error.message
    });
  }
};

// Get wallet balance summary by currency
exports.getWalletSummary = async (req, res) => {
  try {
    const userId = req.params.userId;

    const query = `
      SELECT
        cw.currency_code,
        cc.symbol,
        cc.name as currency_name,
        cc.current_price,
        COUNT(cw.id) as wallet_count,
        COALESCE(SUM(cw.coin_balance), 0) as total_balance,
        COALESCE(SUM(cw.coin_balance * cc.current_price), 0) as total_value_usd,
        MIN(cw.coin_balance) as min_wallet_balance,
        MAX(cw.coin_balance) as max_wallet_balance
      FROM crypto_wallets cw
      JOIN crypto_currencies cc ON cw.currency_code = cc.symbol
      WHERE cw.user_id = :userId AND cw.is_active = true
      GROUP BY cw.currency_code, cc.symbol, cc.name, cc.current_price
      ORDER BY total_value_usd DESC
    `;

    const results = await db.sequelize.query(query, {
      replacements: { userId },
      type: Sequelize.QueryTypes.SELECT
    });

    // Calculate total portfolio value
    const totalPortfolioValue = results.reduce((sum, item) => sum + parseFloat(item.total_value_usd), 0);

    res.send({
      user_id: userId,
      total_portfolio_value_usd: totalPortfolioValue,
      currency_breakdown: results
    });
  } catch (error) {
    res.status(500).send({
      message: "Error retrieving wallet summary: " + error.message
    });
  }
};

// Get global statistics (public endpoint for dashboard counters)
exports.getGlobalStats = async (req, res) => {
  try {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM crypto_currencies WHERE is_active = true) as total_crypto,
        (SELECT COUNT(*) FROM crypto_wallets WHERE is_active = true) as total_wallets,
        (SELECT COUNT(*) FROM transactions) as total_transactions
    `;

    const results = await db.sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT
    });

    res.send(results[0]);
  } catch (error) {
    res.status(500).send({
      message: "Error retrieving global statistics: " + error.message
    });
  }
};
