const db = require("../models");
const ChartPoint = db.chartPoints;

// Create and Save a new ChartPoint
exports.create = (req, res) => {
  const chartPoint = {
    symbol: req.body.symbol,
    price: req.body.price,
    timestamp: req.body.timestamp || new Date(),
    note: req.body.note,
    userId: req.userId
  };

  ChartPoint.create(chartPoint)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the ChartPoint."
      });
    });
};

// Retrieve all ChartPoints for a user
exports.findAll = (req, res) => {
  const userId = req.userId;
  const symbol = req.query.symbol;
  let condition = { userId: userId };
  if (symbol) {
    condition.symbol = symbol;
  }

  ChartPoint.findAll({ where: condition, order: [['timestamp', 'ASC']] })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving chart points."
      });
    });
};

// Delete a ChartPoint
exports.delete = (req, res) => {
  const id = req.params.id;

  ChartPoint.destroy({
    where: { id: id, userId: req.userId }
  })
    .then(num => {
      if (num == 1) {
        res.send({ message: "Point was deleted successfully!" });
      } else {
        res.send({ message: `Cannot delete point with id=${id}.` });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete point with id=" + id
      });
    });
};
