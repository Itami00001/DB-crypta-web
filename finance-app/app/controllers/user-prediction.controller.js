const db = require("../models");
const UserPrediction = db.userPredictions;
const User = db.users;
const CryptoCurrency = db.cryptoCurrencies;

// Create a new UserPrediction
exports.create = (req, res) => {
  // Validate request
  if (!req.body.predictedPrice || !req.body.targetPrice || !req.body.predictionType || !req.body.userId || !req.body.currencyId || !req.body.predictionDate || !req.body.targetDate) {
    res.status(400).send({
      message: "Predicted price, target price, prediction type, user ID, currency ID, prediction date and target date are required!"
    });
    return;
  }

  // Create a UserPrediction
  const userPrediction = {
    predictedPrice: req.body.predictedPrice,
    targetPrice: req.body.targetPrice,
    predictionType: req.body.predictionType,
    userId: req.body.userId,
    currencyId: req.body.currencyId,
    predictionDate: req.body.predictionDate,
    targetDate: req.body.targetDate,
    isActive: req.body.isActive ? req.body.isActive : true,
    notes: req.body.notes
  };

  // Save UserPrediction in database
  UserPrediction.create(userPrediction)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating UserPrediction."
      });
    });
};

// Retrieve all UserPredictions from database.
exports.findAll = (req, res) => {
  UserPrediction.findAll({
    where: { isActive: true },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName']
      },
      {
        model: CryptoCurrency,
        as: 'currency',
        attributes: ['id', 'symbol', 'name', 'currentPrice']
      }
    ],
    order: [['createdAt', 'DESC']]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving user predictions."
      });
    });
};

// Find a single UserPrediction with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  UserPrediction.findByPk(id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName']
      },
      {
        model: CryptoCurrency,
        as: 'currency',
        attributes: ['id', 'symbol', 'name', 'currentPrice']
      }
    ]
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find UserPrediction with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving UserPrediction with id=" + id
      });
    });
};

// Find predictions by user ID
exports.findByUserId = (req, res) => {
  const userId = req.params.userId;

  UserPrediction.findAll({
    where: { userId: userId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName']
      },
      {
        model: CryptoCurrency,
        as: 'currency',
        attributes: ['id', 'symbol', 'name', 'currentPrice']
      }
    ],
    order: [['createdAt', 'DESC']]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving user's predictions."
      });
    });
};

// Find predictions by currency ID
exports.findByCurrencyId = (req, res) => {
  const currencyId = req.params.currencyId;

  UserPrediction.findAll({
    where: { currencyId: currencyId, isActive: true },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName']
      },
      {
        model: CryptoCurrency,
        as: 'currency',
        attributes: ['id', 'symbol', 'name', 'currentPrice']
      }
    ],
    order: [['createdAt', 'DESC']]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving currency predictions."
      });
    });
};

// Update a UserPrediction by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  UserPrediction.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "UserPrediction was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update UserPrediction with id=${id}. Maybe UserPrediction was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating UserPrediction with id=" + id
      });
    });
};

// Delete a UserPrediction with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  UserPrediction.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "UserPrediction was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete UserPrediction with id=${id}. Maybe UserPrediction was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete UserPrediction with id=" + id
      });
    });
};

// Delete all UserPredictions from the database.
exports.deleteAll = (req, res) => {
  UserPrediction.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} UserPredictions were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all user predictions."
      });
    });
};
