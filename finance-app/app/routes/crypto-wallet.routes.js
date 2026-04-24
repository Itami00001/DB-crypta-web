module.exports = app => {
  const cryptoWallets = require("../controllers/crypto-wallet.controller.js");
  const { verifyToken } = require("../middleware/auth.middleware.js");
  var router = require("express").Router();

  // Create a new CryptoWallet
  router.post("/", verifyToken, cryptoWallets.create);

  // Retrieve all CryptoWallets
  router.get("/", verifyToken, cryptoWallets.findAll);

  // Retrieve current user's wallets
  router.get("/my-wallets", verifyToken, cryptoWallets.findMyWallets);

  // Retrieve a single CryptoWallet with id
  router.get("/:id", verifyToken, cryptoWallets.findOne);

  // Retrieve wallets by user ID
  router.get("/user/:userId", verifyToken, cryptoWallets.findByUserId);

  // Update a CryptoWallet with id
  router.put("/:id", verifyToken, cryptoWallets.update);

  // Delete a CryptoWallet with id
  router.delete("/:id", verifyToken, cryptoWallets.delete);

  // Delete all CryptoWallets
  router.delete("/", verifyToken, cryptoWallets.deleteAll);

  // Ensure user has a wallet with balances from user profile
  router.post("/ensure", verifyToken, cryptoWallets.ensureWallet);

  app.use('/api/crypto-wallets', router);
};
