module.exports = app => {
  const cryptoWallets = require("../controllers/crypto-wallet.controller.js");
  const { verifyToken } = require("../middleware/auth.middleware.js");
  var router = require("express").Router();

  /**
   * @swagger
   * tags:
   *   name: CryptoWallets
   *   description: Wallet management API
   */

  // Create a new CryptoWallet
  /**
   * @swagger
   * /api/crypto-wallets:
   *   post:
   *     summary: Create wallet
   *     tags: [CryptoWallets]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Wallet created
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   */
  router.post("/", verifyToken, cryptoWallets.create);

  // Retrieve all CryptoWallets
  /**
   * @swagger
   * /api/crypto-wallets:
   *   get:
   *     summary: Get wallets list
   *     tags: [CryptoWallets]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Wallet list
   *       401:
   *         description: Unauthorized
   */
  router.get("/", verifyToken, cryptoWallets.findAll);

  // Retrieve current user's wallets
  /**
   * @swagger
   * /api/crypto-wallets/my-wallets:
   *   get:
   *     summary: Get current user wallets
   *     tags: [CryptoWallets]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Current user wallets
   *       401:
   *         description: Unauthorized
   */
  router.get("/my-wallets", verifyToken, cryptoWallets.findMyWallets);

  // Retrieve a single CryptoWallet with id
  /**
   * @swagger
   * /api/crypto-wallets/{id}:
   *   get:
   *     summary: Get wallet by id
   *     tags: [CryptoWallets]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Wallet found
   *       404:
   *         description: Not found
   */
  router.get("/:id", verifyToken, cryptoWallets.findOne);

  // Retrieve wallets by user ID
  /**
   * @swagger
   * /api/crypto-wallets/user/{userId}:
   *   get:
   *     summary: Get wallets by user id
   *     tags: [CryptoWallets]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Wallet list
   */
  router.get("/user/:userId", verifyToken, cryptoWallets.findByUserId);

  // Update a CryptoWallet with id
  /**
   * @swagger
   * /api/crypto-wallets/{id}:
   *   put:
   *     summary: Update wallet by id
   *     tags: [CryptoWallets]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Wallet updated
   */
  router.put("/:id", verifyToken, cryptoWallets.update);

  // Delete a CryptoWallet with id
  /**
   * @swagger
   * /api/crypto-wallets/{id}:
   *   delete:
   *     summary: Delete wallet by id
   *     tags: [CryptoWallets]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Wallet deleted
   */
  router.delete("/:id", verifyToken, cryptoWallets.delete);

  // Delete all CryptoWallets
  /**
   * @swagger
   * /api/crypto-wallets:
   *   delete:
   *     summary: Delete all wallets
   *     tags: [CryptoWallets]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Wallets deleted
   */
  router.delete("/", verifyToken, cryptoWallets.deleteAll);

  // Ensure user has a wallet with balances from user profile
  /**
   * @swagger
   * /api/crypto-wallets/ensure:
   *   post:
   *     summary: Ensure current user default wallet exists
   *     tags: [CryptoWallets]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Wallet ensured
   *       401:
   *         description: Unauthorized
   */
  router.post("/ensure", verifyToken, cryptoWallets.ensureWallet);

  app.use('/api/crypto-wallets', router);
};
