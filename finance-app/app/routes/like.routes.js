module.exports = app => {
  const likes = require("../controllers/like.controller.js");
  var router = require("express").Router();

  /**
   * @swagger
   * tags:
   *   name: Likes
   *   description: Likes and reactions API
   */

  // Create a new Like
  /** @swagger /api/likes: post: { summary: "Create like", tags: [Likes], responses: { 200: { description: "Created" } } } */
  router.post("/", likes.create);

  // Retrieve all Likes
  /** @swagger /api/likes: get: { summary: "Get likes", tags: [Likes], responses: { 200: { description: "List" } } } */
  router.get("/", likes.findAll);

  // Retrieve a single Like with id
  /** @swagger /api/likes/{id}: get: { summary: "Get like by id", tags: [Likes], parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { 200: { description: "Found" }, 404: { description: "Not found" } } } */
  router.get("/:id", likes.findOne);

  // Retrieve likes by post ID
  /** @swagger /api/likes/post/{postId}: get: { summary: "Get likes by post", tags: [Likes], parameters: [{ in: "path", name: "postId", required: true, schema: { type: "string", format: "uuid" } }], responses: { 200: { description: "List" } } } */
  router.get("/post/:postId", likes.findByPostId);

  // Retrieve likes by user ID
  /** @swagger /api/likes/user/{userId}: get: { summary: "Get likes by user", tags: [Likes], parameters: [{ in: "path", name: "userId", required: true, schema: { type: "string", format: "uuid" } }], responses: { 200: { description: "List" } } } */
  router.get("/user/:userId", likes.findByUserId);

  // Update a Like with id
  /** @swagger /api/likes/{id}: put: { summary: "Update like", tags: [Likes], parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { 200: { description: "Updated" } } } */
  router.put("/:id", likes.update);

  // Delete a Like with id
  /** @swagger /api/likes/{id}: delete: { summary: "Delete like", tags: [Likes], parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { 200: { description: "Deleted" } } } */
  router.delete("/:id", likes.delete);

  // Delete all Likes
  /** @swagger /api/likes: delete: { summary: "Delete all likes", tags: [Likes], responses: { 200: { description: "Deleted" } } } */
  router.delete("/", likes.deleteAll);

  app.use('/api/likes', router);
};
