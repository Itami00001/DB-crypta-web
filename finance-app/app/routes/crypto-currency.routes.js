module.exports = app => {
  const cryptoCurrencies = require("../controllers/crypto-currency.controller.js");
  var router = require("express").Router();

  /**
   * @swagger
   * tags:
   *   name: CryptoCurrencies
   *   description: Cryptocurrency catalog and market data
   */

  // Create a new CryptoCurrency
  /**
   * @swagger
   * /api/crypto-currencies:
   *   post:
   *     summary: Create cryptocurrency
   *     tags: [CryptoCurrencies]
   *     responses:
   *       200:
   *         description: Currency created
   */
  router.post("/", cryptoCurrencies.create);

  // Retrieve all CryptoCurrencies
  /**
   * @swagger
   * /api/crypto-currencies:
   *   get:
   *     summary: Get all cryptocurrencies
   *     tags: [CryptoCurrencies]
   *     responses:
   *       200:
   *         description: Currency list
   */
  router.get("/", cryptoCurrencies.findAll);

  // Find CryptoCurrency by symbol
  /**
   * @swagger
   * /api/crypto-currencies/symbol/{symbol}:
   *   get:
   *     summary: Get currency by symbol
   *     tags: [CryptoCurrencies]
   *     parameters:
   *       - in: path
   *         name: symbol
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Currency found
   *       404:
   *         description: Not found
   */
  router.get("/symbol/:symbol", cryptoCurrencies.findBySymbol);

  // Retrieve a single CryptoCurrency with id
  /**
   * @swagger
   * /api/crypto-currencies/{id}:
   *   get:
   *     summary: Get currency by id
   *     tags: [CryptoCurrencies]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Currency found
   *       404:
   *         description: Not found
   */
  router.get("/:id", cryptoCurrencies.findOne);

  // Update a CryptoCurrency with id
  /**
   * @swagger
   * /api/crypto-currencies/{id}:
   *   put:
   *     summary: Update currency by id
   *     tags: [CryptoCurrencies]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Currency updated
   */
  router.put("/:id", cryptoCurrencies.update);

  // Delete a CryptoCurrency with id
  /**
   * @swagger
   * /api/crypto-currencies/{id}:
   *   delete:
   *     summary: Delete currency by id
   *     tags: [CryptoCurrencies]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Currency deleted
   */
  router.delete("/:id", cryptoCurrencies.delete);

  // Delete all CryptoCurrencies
  /**
   * @swagger
   * /api/crypto-currencies:
   *   delete:
   *     summary: Delete all currencies
   *     tags: [CryptoCurrencies]
   *     responses:
   *       200:
   *         description: All currencies deleted
   */
  router.delete("/", cryptoCurrencies.deleteAll);

  // Get market data from CryptoCompare
  /**
   * @swagger
   * /api/crypto-currencies/market-data:
   *   post:
   *     summary: Sync market data from provider
   *     tags: [CryptoCurrencies]
   *     responses:
   *       200:
   *         description: Market data updated
   */
  router.post("/market-data", cryptoCurrencies.getMarketData);

  app.use('/api/crypto-currencies', router);
};
