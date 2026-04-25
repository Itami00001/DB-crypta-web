module.exports = app => {
  const transactions = require("../controllers/transaction.controller.js");
  var router = require("express").Router();

  /**
   * @swagger
   * tags:
   *   name: Transactions
   *   description: Financial transactions and transfers
   */

  /**
   * @swagger
   * /api/transactions:
   *   post:
   *     summary: Create a new transaction
   *     tags: [Transactions]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - amount
   *               - currencyCode
   *               - transactionType
   *               - fromWalletId
   *             properties:
   *               amount:
   *                 type: number
   *                 format: decimal
   *                 minimum: 0.01
   *                 example: 100.50
   *                 description: Transaction amount
   *               currencyCode:
   *                 type: string
   *                 example: USD
   *                 description: Currency code (can be composite like "USD->RUB")
   *               transactionType:
   *                 type: string
   *                 enum: [transfer, buy, sell, deposit, withdraw, exchange]
   *                 example: transfer
   *                 description: Type of transaction
   *               status:
   *                 type: string
   *                 enum: [pending, completed, failed, cancelled]
   *                 default: pending
   *                 example: pending
   *                 description: Transaction status
   *               fee:
   *                 type: number
   *                 format: decimal
   *                 minimum: 0
   *                 default: 0
   *                 example: 0.50
   *                 description: Transaction fee
   *               transactionHash:
   *                 type: string
   *                 example: TX_1234567890
   *                 description: Blockchain transaction hash
   *               fromWalletId:
   *                 type: string
   *                 format: uuid
   *                 example: 550e8400-e29b-41d4-a716-446655440000
   *                 description: Source wallet ID
   *               toWalletId:
   *                 type: string
   *                 format: uuid
   *                 example: 550e8400-e29b-41d4-a716-446655440001
   *                 description: Destination wallet ID (null for deposit/withdraw)
   *     responses:
   *       201:
   *         description: Transaction created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Transaction'
   *       400:
   *         description: Bad request - validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationError'
   *       401:
   *         description: Unauthorized - authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Wallet not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post("/", transactions.create);

  /**
   * @swagger
   * /api/transactions:
   *   get:
   *     summary: Retrieve all transactions for current user
   *     tags: [Transactions]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of user transactions
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Transaction'
   *       401:
   *         description: Unauthorized - authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get("/", transactions.findAll);

  /**
   * @swagger
   * /api/transactions/{id}:
   *   get:
   *     summary: Retrieve a single transaction by id
   *     tags: [Transactions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Transaction unique identifier
   *     responses:
   *       200:
   *         description: Transaction found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Transaction'
   *       401:
   *         description: Unauthorized - authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       403:
   *         description: Forbidden - can only access own transactions
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Transaction not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get("/:id", transactions.findOne);

  /**
   * @swagger
   * /api/transactions/wallet/{walletId}:
   *   get:
   *     summary: Retrieve all transactions for a specific wallet
   *     tags: [Transactions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: walletId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Wallet unique identifier
   *     responses:
   *       200:
   *         description: List of wallet transactions
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Transaction'
   *       401:
   *         description: Unauthorized - authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       403:
   *         description: Forbidden - can only access own wallet transactions
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Wallet not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.get("/wallet/:walletId", transactions.findByWalletId);

  /**
   * @swagger
   * /api/transactions/{id}:
   *   put:
   *     summary: Update a transaction by id
   *     tags: [Transactions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Transaction unique identifier
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [pending, completed, failed, cancelled]
   *                 example: completed
   *                 description: Updated transaction status
   *               fee:
   *                 type: number
   *                 format: decimal
   *                 minimum: 0
   *                 example: 1.00
   *                 description: Updated transaction fee
   *               transactionHash:
   *                 type: string
   *                 example: TX_UPDATED_1234567890
   *                 description: Updated transaction hash
   *     responses:
   *       200:
   *         description: Transaction updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Transaction was updated successfully.
   *       400:
   *         description: Bad request - validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationError'
   *       401:
   *         description: Unauthorized - authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       403:
   *         description: Forbidden - can only update own transactions
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Transaction not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.put("/:id", transactions.update);

  /**
   * @swagger
   * /api/transactions/{id}:
   *   delete:
   *     summary: Delete a transaction by id
   *     tags: [Transactions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Transaction unique identifier
   *     responses:
   *       200:
   *         description: Transaction deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Transaction was deleted successfully!
   *       401:
   *         description: Unauthorized - authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       403:
   *         description: Forbidden - can only delete own transactions
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Transaction not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.delete("/:id", transactions.delete);

  /**
   * @swagger
   * /api/transactions:
   *   delete:
   *     summary: Delete all transactions (admin only)
   *     tags: [Transactions]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: All transactions deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "25 Transactions were deleted successfully!"
   *       401:
   *         description: Unauthorized - authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       403:
   *         description: Forbidden - admin access required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.delete("/", transactions.deleteAll);

  /**
   * @swagger
   * /api/transactions/transfer:
   *   post:
   *     summary: Transfer funds between users (SERIALIZABLE transaction)
   *     tags: [Transactions]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - toUsername
   *               - currency
   *               - amount
   *             properties:
   *               toUsername:
   *                 type: string
   *                 minLength: 3
   *                 maxLength: 30
   *                 example: jane_doe
   *                 description: Recipient username
   *               currency:
   *                 type: string
   *                 enum: [COIN, USD, RUB, BTC]
   *                 example: USD
   *                 description: Currency to transfer
   *               amount:
   *                 type: number
   *                 format: decimal
   *                 minimum: 0.01
   *                 example: 50.00
   *                 description: Amount to transfer (must be positive)
   *     responses:
   *       200:
   *         description: Transfer successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Transfer successful
   *                 newBalance:
   *                   type: number
   *                   format: decimal
   *                   example: 950.00
   *                 description: New balance after transfer
   *       400:
   *         description: Bad request - validation error or insufficient balance
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       401:
   *         description: Unauthorized - authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: Recipient not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       409:
   *         description: Could not serialize access - concurrent transaction conflict
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post("/transfer", transactions.transferBetweenUsers);

  /**
   * @swagger
   * /api/transactions/exchange:
   *   post:
   *     summary: Exchange currency (SERIALIZABLE transaction)
   *     tags: [Transactions]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - fromCurrency
   *               - toCurrency
   *               - amount
   *             properties:
   *               fromCurrency:
   *                 type: string
   *                 enum: [COIN, USD, RUB, BTC]
   *                 example: USD
   *                 description: Currency to exchange from
   *               toCurrency:
   *                 type: string
   *                 enum: [COIN, USD, RUB, BTC]
   *                 example: BTC
   *                 description: Currency to exchange to
   *               amount:
   *                 type: number
   *                 format: decimal
   *                 minimum: 0.01
   *                 example: 100.00
   *                 description: Amount to exchange (must be positive)
   *     responses:
   *       200:
   *         description: Exchange successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Exchange successful
   *                 newBalanceFrom:
   *                   type: number
   *                   format: decimal
   *                   example: 900.00
   *                   description: New balance in source currency
   *                 newBalanceTo:
   *                   type: number
   *                   format: decimal
   *                   example: 0.0015
   *                   description: New balance in target currency
   *                 exchangedAmount:
   *                   type: number
   *                   format: decimal
   *                   example: 0.0015
   *                   description: Amount received in target currency
   *       400:
   *         description: Bad request - validation error or insufficient balance
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       401:
   *         description: Unauthorized - authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       409:
   *         description: Could not serialize access - concurrent transaction conflict
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post("/exchange", transactions.exchangeCurrency);

  app.use('/api/transactions', router);
};
