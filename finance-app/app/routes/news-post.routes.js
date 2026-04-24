/**
 * @swagger
 * components:
 *   schemas:
 *     NewsPost:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - authorId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the news post
 *         title:
 *           type: string
 *           description: The title of the news post
 *         content:
 *           type: string
 *           description: The content of the news post
 *         postType:
 *           type: string
 *           enum: [news, prediction, analysis, announcement]
 *           description: The type of the post
 *         category:
 *           type: string
 *           description: The category of the post
 *         isPublished:
 *           type: boolean
 *           description: Whether the post is published
 *         viewCount:
 *           type: integer
 *           description: Number of views
 *         authorId:
 *           type: string
 *           description: The id of the author user
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The creation date
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The update date
 */

module.exports = app => {
  const newsPosts = require("../controllers/news-post.controller.js");
  var router = require("express").Router();

  // Create a new NewsPost
  /**
   * @swagger
   * /api/news-posts:
   *   post:
   *     summary: Create a new news post
   *     tags: [NewsPosts]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/NewsPost'
   *     responses:
   *       200:
   *         description: The news post was successfully created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/NewsPost'
   *       400:
   *         description: Bad request
   */
  router.post("/", newsPosts.create);

  // Retrieve all NewsPosts
  /**
   * @swagger
   * /api/news-posts:
   *   get:
   *     summary: Retrieve all news posts with pagination
   *     tags: [NewsPosts]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 0
   *         description: Page number
   *       - in: query
   *         name: size
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Number of items per page
   *     responses:
   *       200:
   *         description: Paginated list of news posts
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 totalItems:
   *                   type: integer
   *                   description: Total number of items
   *                 items:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/NewsPost'
   *                   description: Array of news posts
   *                 totalPages:
   *                   type: integer
   *                   description: Total number of pages
   *                 currentPage:
   *                   type: integer
   *                   description: Current page number
   */
  router.get("/", newsPosts.findAll);

  // Retrieve all published NewsPosts
  /**
   * @swagger
   * /api/news-posts/published:
   *   get:
   *     summary: Retrieve all published news posts
   *     tags: [NewsPosts]
   *     responses:
   *       200:
   *         description: List of all published news posts
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/NewsPost'
   */
  router.get("/published", newsPosts.findAllPublished);

  // Retrieve a single NewsPost with id
  /**
   * @swagger
   * /api/news-posts/{id}:
   *   get:
   *     summary: Retrieve a single news post by id
   *     tags: [NewsPosts]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: News post found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/NewsPost'
   *       404:
   *         description: News post not found
   */
  router.get("/:id", newsPosts.findOne);

  // Update a NewsPost with id
  /**
   * @swagger
   * /api/news-posts/{id}:
   *   put:
   *     summary: Update a news post by id
   *     tags: [NewsPosts]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/NewsPost'
   *     responses:
   *       200:
   *         description: News post updated successfully
   *       404:
   *         description: News post not found
   */
  router.put("/:id", newsPosts.update);

  // Delete a NewsPost with id
  /**
   * @swagger
   * /api/news-posts/{id}:
   *   delete:
   *     summary: Delete a news post by id
   *     tags: [NewsPosts]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: News post deleted successfully
   *       404:
   *         description: News post not found
   */
  router.delete("/:id", newsPosts.delete);

  // Delete all NewsPosts
  /**
   * @swagger
   * /api/news-posts:
   *   delete:
   *     summary: Delete all news posts
   *     tags: [NewsPosts]
   *     responses:
   *       200:
   *         description: All news posts deleted successfully
   */
  router.delete("/", newsPosts.deleteAll);

  // Sync news with CryptoCompare
  /**
   * @swagger
   * /api/news-posts/sync:
   *   post:
   *     summary: Sync news with CryptoCompare API
   *     tags: [NewsPosts]
   *     responses:
   *       200:
   *         description: News synced successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 total:
   *                   type: integer
   *                 new:
   *                   type: integer
   *       500:
   *         description: Error syncing news
   */
  router.post("/sync", newsPosts.syncWithCryptoCompare);

  app.use('/api/news-posts', router);
};
