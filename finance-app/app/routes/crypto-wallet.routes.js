module.exports = app => {
  const cryptoWallets = require("../controllers/crypto-wallet.controller.js");
  var router = require("express").Router();

  // Create a new CryptoWallet
  router.post("/", cryptoWallets.create);

  // Retrieve all CryptoWallets
  router.get("/", cryptoWallets.findAll);

  // Retrieve a single CryptoWallet with id
  router.get("/:id", cryptoWallets.findOne);

  // Retrieve wallets by user ID
  router.get("/user/:userId", cryptoWallets.findByUserId);

  // Update a CryptoWallet with id
  router.put("/:id", cryptoWallets.update);

  // Delete a CryptoWallet with id
  router.delete("/:id", cryptoWallets.delete);

  // Delete all CryptoWallets
  router.delete("/", cryptoWallets.deleteAll);

  app.use('/api/crypto-wallets', router);
};
