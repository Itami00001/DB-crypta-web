module.exports = app => {
  const userPredictions = require("../controllers/user-prediction.controller.js");
  var router = require("express").Router();

  /**
   * @swagger
   * tags:
   *   name: UserPredictions
   *   description: User prediction API
   */

  // Create a new UserPrediction
  /** @swagger /api/user-predictions: post: { summary: "Create prediction", tags: [UserPredictions], responses: { 200: { description: "Created" } } } */
  router.post("/", userPredictions.create);

  // Retrieve all UserPredictions
  /** @swagger /api/user-predictions: get: { summary: "Get predictions", tags: [UserPredictions], responses: { 200: { description: "List" } } } */
  router.get("/", userPredictions.findAll);

  // Retrieve a single UserPrediction with id
  /** @swagger /api/user-predictions/{id}: get: { summary: "Get prediction by id", tags: [UserPredictions], parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { 200: { description: "Found" }, 404: { description: "Not found" } } } */
  router.get("/:id", userPredictions.findOne);

  // Retrieve predictions by user ID
  /** @swagger /api/user-predictions/user/{userId}: get: { summary: "Get predictions by user", tags: [UserPredictions], parameters: [{ in: "path", name: "userId", required: true, schema: { type: "string", format: "uuid" } }], responses: { 200: { description: "List" } } } */
  router.get("/user/:userId", userPredictions.findByUserId);

  // Retrieve predictions by currency ID
  /** @swagger /api/user-predictions/currency/{currencyId}: get: { summary: "Get predictions by currency", tags: [UserPredictions], parameters: [{ in: "path", name: "currencyId", required: true, schema: { type: "string", format: "uuid" } }], responses: { 200: { description: "List" } } } */
  router.get("/currency/:currencyId", userPredictions.findByCurrencyId);

  // Update a UserPrediction with id
  /** @swagger /api/user-predictions/{id}: put: { summary: "Update prediction", tags: [UserPredictions], parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { 200: { description: "Updated" } } } */
  router.put("/:id", userPredictions.update);

  // Delete a UserPrediction with id
  /** @swagger /api/user-predictions/{id}: delete: { summary: "Delete prediction", tags: [UserPredictions], parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { 200: { description: "Deleted" } } } */
  router.delete("/:id", userPredictions.delete);

  // Delete all UserPredictions
  /** @swagger /api/user-predictions: delete: { summary: "Delete all predictions", tags: [UserPredictions], responses: { 200: { description: "Deleted" } } } */
  router.delete("/", userPredictions.deleteAll);

  app.use('/api/user-predictions', router);
};
