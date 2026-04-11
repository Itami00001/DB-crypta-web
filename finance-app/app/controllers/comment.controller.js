const db = require("../models");
const Comment = db.comments;
const User = db.users;
const NewsPost = db.newsPosts;

// Create a new Comment
exports.create = (req, res) => {
  // Validate request
  if (!req.body.content || !req.body.userId || !req.body.postId) {
    res.status(400).send({
      message: "Content, user ID and post ID are required!"
    });
    return;
  }

  // Create a Comment
  const comment = {
    content: req.body.content,
    userId: req.body.userId,
    postId: req.body.postId,
    parentCommentId: req.body.parentCommentId ? req.body.parentCommentId : null,
    isDeleted: false
  };

  // Save Comment in database
  Comment.create(comment)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating Comment."
      });
    });
};

// Retrieve all Comments from database.
exports.findAll = (req, res) => {
  Comment.findAll({
    where: { isDeleted: false },
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
      },
      {
        model: Comment,
        as: 'replies',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'firstName', 'lastName']
          }
        ],
        where: { isDeleted: false }
      }
    ],
    order: [['createdAt', 'ASC']]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving comments."
      });
    });
};

// Find a single Comment with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Comment.findByPk(id, {
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
      },
      {
        model: Comment,
        as: 'parentComment',
        attributes: ['id', 'content']
      },
      {
        model: Comment,
        as: 'replies',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'firstName', 'lastName']
          }
        ],
        where: { isDeleted: false }
      }
    ]
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Comment with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Comment with id=" + id
      });
    });
};

// Find comments by post ID
exports.findByPostId = (req, res) => {
  const postId = req.params.postId;

  Comment.findAll({
    where: { 
      postId: postId,
      isDeleted: false,
      parentCommentId: null  // Only top-level comments
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName']
      },
      {
        model: Comment,
        as: 'replies',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'firstName', 'lastName']
          }
        ],
        where: { isDeleted: false }
      }
    ],
    order: [['createdAt', 'ASC']]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving post comments."
      });
    });
};

// Update a Comment by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Comment.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Comment was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Comment with id=${id}. Maybe Comment was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Comment with id=" + id
      });
    });
};

// Soft delete a Comment with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Comment.update({ isDeleted: true }, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Comment was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Comment with id=${id}. Maybe Comment was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Comment with id=" + id
      });
    });
};

// Delete all Comments from the database.
exports.deleteAll = (req, res) => {
  Comment.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Comments were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all comments."
      });
    });
};
