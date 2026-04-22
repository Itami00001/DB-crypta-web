module.exports = app => {
  const transactions = require("../controllers/transaction.controller.js");
  const { verifyToken, optionalVerifyToken } = require("../middleware/auth.middleware.js");
  var router = require("express").Router();

  // Create a new Transaction (Requires Token)
  router.post("/", verifyToken, transactions.create);

  // User-to-user transfer (Requires Token)
  router.post("/transfer", verifyToken, transactions.transferBetweenUsers);

  // Currency exchange (Requires Token)
  router.post("/exchange", verifyToken, transactions.exchangeCurrency);

  // Retrieve all Transactions (Optional Token)
  router.get("/", optionalVerifyToken, transactions.findAll);

  // Retrieve a single Transaction with id (Requires Token)
  router.get("/:id", verifyToken, transactions.findOne);

  // Retrieve transactions by wallet ID (Requires Token)
  router.get("/wallet/:walletId", verifyToken, transactions.findByWalletId);

  // Update a Transaction with id (Requires Token)
  router.put("/:id", verifyToken, transactions.update);

  // Delete a Transaction with id (Requires Token)
  router.delete("/:id", verifyToken, transactions.delete);

  // Delete all Transactions (Requires Token)
  router.delete("/", verifyToken, transactions.deleteAll);

  app.use('/api/transactions', router);
};
