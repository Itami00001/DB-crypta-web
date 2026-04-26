module.exports = app => {
  const comments = require("../controllers/comment.controller.js");
  var router = require("express").Router();

  /**
   * @swagger
   * tags:
   *   name: Comments
   *   description: Comments API
   */

  // Create a new Comment
  /** @swagger /api/comments: post: { summary: "Create comment", tags: [Comments], responses: { 200: { description: "Created" } } } */
  router.post("/", comments.create);

  // Retrieve all Comments
  /** @swagger /api/comments: get: { summary: "Get comments", tags: [Comments], responses: { 200: { description: "List" } } } */
  router.get("/", comments.findAll);

  // Retrieve a single Comment with id
  /** @swagger /api/comments/{id}: get: { summary: "Get comment by id", tags: [Comments], parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { 200: { description: "Found" }, 404: { description: "Not found" } } } */
  router.get("/:id", comments.findOne);

  // Retrieve comments by post ID
  /** @swagger /api/comments/post/{postId}: get: { summary: "Get comments by post", tags: [Comments], parameters: [{ in: "path", name: "postId", required: true, schema: { type: "string", format: "uuid" } }], responses: { 200: { description: "List" } } } */
  router.get("/post/:postId", comments.findByPostId);

  // Update a Comment with id
  /** @swagger /api/comments/{id}: put: { summary: "Update comment", tags: [Comments], parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { 200: { description: "Updated" } } } */
  router.put("/:id", comments.update);

  // Delete a Comment with id (soft delete)
  /** @swagger /api/comments/{id}: delete: { summary: "Delete comment", tags: [Comments], parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { 200: { description: "Deleted" } } } */
  router.delete("/:id", comments.delete);

  // Delete all Comments
  /** @swagger /api/comments: delete: { summary: "Delete all comments", tags: [Comments], responses: { 200: { description: "Deleted" } } } */
  router.delete("/", comments.deleteAll);

  app.use('/api/comments', router);
};
