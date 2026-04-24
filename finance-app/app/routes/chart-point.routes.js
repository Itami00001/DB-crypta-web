module.exports = app => {
  const chartPoints = require("../controllers/chart-point.controller.js");
  const { verifyToken } = require("../middleware/auth.middleware.js");
  var router = require("express").Router();

  // Create a new ChartPoint
  router.post("/", verifyToken, chartPoints.create);

  // Retrieve all ChartPoints for the current user
  router.get("/", verifyToken, chartPoints.findAll);

  // Delete a ChartPoint
  router.delete("/:id", verifyToken, chartPoints.delete);

  app.use('/api/chart-points', router);
};
