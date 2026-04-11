/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics and statistics endpoints
 */

module.exports = app => {
  const analytics = require("../controllers/analytics.controller.js");
  var router = require("express").Router();

  // Get user statistics
  /**
   * @swagger
   * /api/analytics/users/{userId}/stats:
   *   get:
   *     summary: Get comprehensive user statistics
   *     tags: [Analytics]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: User statistics retrieved successfully
   *       404:
   *         description: User not found
   */
  router.get("/users/:userId/stats", analytics.getUserStats);

  // Get cryptocurrency statistics
  /**
   * @swagger
   * /api/analytics/crypto/stats:
   *   get:
   *     summary: Get cryptocurrency market statistics
   *     tags: [Analytics]
   *     responses:
   *       200:
   *         description: Cryptocurrency statistics retrieved successfully
   */
  router.get("/crypto/stats", analytics.getCryptoStats);

  // Get transaction analytics
  /**
   * @swagger
   * /api/analytics/transactions/stats:
   *   get:
   *     summary: Get transaction analytics by type and currency
   *     tags: [Analytics]
   *     responses:
   *       200:
   *         description: Transaction analytics retrieved successfully
   */
  router.get("/transactions/stats", analytics.getTransactionAnalytics);

  // Get popular posts
  /**
   * @swagger
   * /api/analytics/posts/popular:
   *   get:
   *     summary: Get popular posts with engagement metrics
   *     tags: [Analytics]
   *     responses:
   *       200:
   *         description: Popular posts retrieved successfully
   */
  router.get("/posts/popular", analytics.getPopularPosts);

  // Get prediction accuracy
  /**
   * @swagger
   * /api/analytics/predictions/accuracy:
   *   get:
   *     summary: Get prediction accuracy statistics
   *     tags: [Analytics]
   *     responses:
   *       200:
   *         description: Prediction accuracy statistics retrieved successfully
   */
  router.get("/predictions/accuracy", analytics.getPredictionAccuracy);

  // Get wallet summary
  /**
   * @swagger
   * /api/analytics/wallets/{userId}/summary:
   *   get:
   *     summary: Get wallet balance summary by currency
   *     tags: [Analytics]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Wallet summary retrieved successfully
   */
  router.get("/wallets/:userId/summary", analytics.getWalletSummary);

  app.use('/api/analytics', router);
};
