module.exports = app => {
  const transactions = require("../controllers/transaction.controller.js");
  const { verifyToken, optionalVerifyToken } = require("../middleware/auth.middleware.js");
  var router = require("express").Router();

  /**
   * @swagger
   * tags:
   *   name: TransactionsRuntime
   *   description: Runtime transaction routes (active in server.js)
   */

  // Create a new Transaction (Requires Token)
  /** @swagger /api/transactions: post: { summary: "Create transaction", tags: [TransactionsRuntime], security: [{ bearerAuth: [] }], responses: { 200: { description: "Created" }, 401: { description: "Unauthorized" } } } */
  router.post("/", verifyToken, transactions.create);

  // User-to-user transfer (Requires Token)
  /** @swagger /api/transactions/transfer: post: { summary: "Transfer between users", tags: [TransactionsRuntime], security: [{ bearerAuth: [] }], responses: { 200: { description: "Success" }, 400: { description: "Business validation error" }, 401: { description: "Unauthorized" }, 409: { description: "Serialization conflict" } } } */
  router.post("/transfer", verifyToken, transactions.transferBetweenUsers);

  // Currency exchange (Requires Token)
  /** @swagger /api/transactions/exchange: post: { summary: "Currency exchange", tags: [TransactionsRuntime], security: [{ bearerAuth: [] }], responses: { 200: { description: "Success" }, 400: { description: "Business validation error" }, 401: { description: "Unauthorized" }, 409: { description: "Serialization conflict" } } } */
  router.post("/exchange", verifyToken, transactions.exchangeCurrency);

  // Retrieve all Transactions (Optional Token)
  /** @swagger /api/transactions: get: { summary: "Get transactions for current user", tags: [TransactionsRuntime], security: [{ bearerAuth: [] }], responses: { 200: { description: "List" } } } */
  router.get("/", optionalVerifyToken, transactions.findAll);

  // Retrieve a single Transaction with id (Requires Token)
  /** @swagger /api/transactions/{id}: get: { summary: "Get transaction by id", tags: [TransactionsRuntime], security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { 200: { description: "Found" }, 404: { description: "Not found" } } } */
  router.get("/:id", verifyToken, transactions.findOne);

  // Retrieve transactions by wallet ID (Requires Token)
  /** @swagger /api/transactions/wallet/{walletId}: get: { summary: "Get transactions by wallet", tags: [TransactionsRuntime], security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "walletId", required: true, schema: { type: "string", format: "uuid" } }], responses: { 200: { description: "List" } } } */
  router.get("/wallet/:walletId", verifyToken, transactions.findByWalletId);

  // Update a Transaction with id (Requires Token)
  /** @swagger /api/transactions/{id}: put: { summary: "Update transaction", tags: [TransactionsRuntime], security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { 200: { description: "Updated" } } } */
  router.put("/:id", verifyToken, transactions.update);

  // Delete a Transaction with id (Requires Token)
  /** @swagger /api/transactions/{id}: delete: { summary: "Delete transaction", tags: [TransactionsRuntime], security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { 200: { description: "Deleted" } } } */
  router.delete("/:id", verifyToken, transactions.delete);

  // Delete all Transactions (Requires Token)
  /** @swagger /api/transactions: delete: { summary: "Delete all transactions", tags: [TransactionsRuntime], security: [{ bearerAuth: [] }], responses: { 200: { description: "Deleted" } } } */
  router.delete("/", verifyToken, transactions.deleteAll);

  app.use('/api/transactions', router);
};
