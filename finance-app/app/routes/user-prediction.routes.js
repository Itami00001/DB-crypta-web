module.exports = app => {
  const userPredictions = require("../controllers/user-prediction.controller.js");
  var router = require("express").Router();

  // Create a new UserPrediction
  router.post("/", userPredictions.create);

  // Retrieve all UserPredictions
  router.get("/", userPredictions.findAll);

  // Retrieve a single UserPrediction with id
  router.get("/:id", userPredictions.findOne);

  // Retrieve predictions by user ID
  router.get("/user/:userId", userPredictions.findByUserId);

  // Retrieve predictions by currency ID
  router.get("/currency/:currencyId", userPredictions.findByCurrencyId);

  // Update a UserPrediction with id
  router.put("/:id", userPredictions.update);

  // Delete a UserPrediction with id
  router.delete("/:id", userPredictions.delete);

  // Delete all UserPredictions
  router.delete("/", userPredictions.deleteAll);

  app.use('/api/user-predictions', router);
};
