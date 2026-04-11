module.exports = app => {
  const likes = require("../controllers/like.controller.js");
  var router = require("express").Router();

  // Create a new Like
  router.post("/", likes.create);

  // Retrieve all Likes
  router.get("/", likes.findAll);

  // Retrieve a single Like with id
  router.get("/:id", likes.findOne);

  // Retrieve likes by post ID
  router.get("/post/:postId", likes.findByPostId);

  // Retrieve likes by user ID
  router.get("/user/:userId", likes.findByUserId);

  // Update a Like with id
  router.put("/:id", likes.update);

  // Delete a Like with id
  router.delete("/:id", likes.delete);

  // Delete all Likes
  router.delete("/", likes.deleteAll);

  app.use('/api/likes', router);
};
