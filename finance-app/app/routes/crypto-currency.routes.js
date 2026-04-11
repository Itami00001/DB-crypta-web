module.exports = app => {
  const cryptoCurrencies = require("../controllers/crypto-currency.controller.js");
  var router = require("express").Router();

  // Create a new CryptoCurrency
  router.post("/", cryptoCurrencies.create);

  // Retrieve all CryptoCurrencies
  router.get("/", cryptoCurrencies.findAll);

  // Retrieve a single CryptoCurrency with id
  router.get("/:id", cryptoCurrencies.findOne);

  // Find CryptoCurrency by symbol
  router.get("/symbol/:symbol", cryptoCurrencies.findBySymbol);

  // Update a CryptoCurrency with id
  router.put("/:id", cryptoCurrencies.update);

  // Delete a CryptoCurrency with id
  router.delete("/:id", cryptoCurrencies.delete);

  // Delete all CryptoCurrencies
  router.delete("/", cryptoCurrencies.deleteAll);

  app.use('/api/crypto-currencies', router);
};
