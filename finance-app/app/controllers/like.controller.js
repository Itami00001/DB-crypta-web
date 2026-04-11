const db = require("../models");
const Like = db.likes;
const User = db.users;
const NewsPost = db.newsPosts;

// Create a new Like
exports.create = (req, res) => {
  // Validate request
  if (!req.body.userId || !req.body.postId || !req.body.likeType) {
    res.status(400).send({
      message: "User ID, post ID and like type are required!"
    });
    return;
  }

  // Check if user already liked this post
  Like.findOne({
    where: { 
      userId: req.body.userId, 
      postId: req.body.postId 
    }
  })
    .then(existingLike => {
      if (existingLike) {
        // Update existing like
        return Like.update(
          { likeType: req.body.likeType },
          { where: { id: existingLike.id } }
        );
      } else {
        // Create new like
        const like = {
          userId: req.body.userId,
          postId: req.body.postId,
          likeType: req.body.likeType
        };
        return Like.create(like);
      }
    })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating Like."
      });
    });
};

// Retrieve all Likes from database.
exports.findAll = (req, res) => {
  Like.findAll({
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName']
      },
      {
        model: NewsPost,
        as: 'post',
        attributes: ['id', 'title']
      }
    ],
    order: [['createdAt', 'DESC']]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving likes."
      });
    });
};

// Find a single Like with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Like.findByPk(id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName']
      },
      {
        model: NewsPost,
        as: 'post',
        attributes: ['id', 'title']
      }
    ]
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Like with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Like with id=" + id
      });
    });
};

// Find likes by post ID
exports.findByPostId = (req, res) => {
  const postId = req.params.postId;

  Like.findAll({
    where: { postId: postId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName']
      }
    ],
    order: [['createdAt', 'DESC']]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving post likes."
      });
    });
};

// Find likes by user ID
exports.findByUserId = (req, res) => {
  const userId = req.params.userId;

  Like.findAll({
    where: { userId: userId },
    include: [
      {
        model: NewsPost,
        as: 'post',
        attributes: ['id', 'title']
      }
    ],
    order: [['createdAt', 'DESC']]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving user's likes."
      });
    });
};

// Update a Like by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Like.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Like was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Like with id=${id}. Maybe Like was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Like with id=" + id
      });
    });
};

// Delete a Like with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Like.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Like was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Like with id=${id}. Maybe Like was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Like with id=" + id
      });
    });
};

// Delete all Likes from the database.
exports.deleteAll = (req, res) => {
  Like.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Likes were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all likes."
      });
    });
};
