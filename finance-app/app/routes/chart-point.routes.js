module.exports = app => {
  const chartPoints = require("../controllers/chart-point.controller.js");
  const { verifyToken } = require("../middleware/auth.middleware.js");
  var router = require("express").Router();

  /**
   * @swagger
   * tags:
   *   name: ChartPoints
   *   description: User chart annotation points
   */

  // Create a new ChartPoint
  /**
   * @swagger
   * /api/chart-points:
   *   post:
   *     summary: Create chart point for current user
   *     tags: [ChartPoints]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Chart point created
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.post("/", verifyToken, chartPoints.create);

  // Retrieve all ChartPoints for the current user
  /**
   * @swagger
   * /api/chart-points:
   *   get:
   *     summary: Get current user chart points
   *     tags: [ChartPoints]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of chart points
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.get("/", verifyToken, chartPoints.findAll);

  // Delete all ChartPoints for the current user (optionally by symbol)
  /**
   * @swagger
   * /api/chart-points:
   *   delete:
   *     summary: Delete all current user chart points
   *     tags: [ChartPoints]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Points deleted
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete("/", verifyToken, chartPoints.deleteAllForUser);

  // Delete a ChartPoint
  /**
   * @swagger
   * /api/chart-points/{id}:
   *   delete:
   *     summary: Delete one chart point by id
   *     tags: [ChartPoints]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Point deleted
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  router.delete("/:id", verifyToken, chartPoints.delete);

  app.use('/api/chart-points', router);
};
