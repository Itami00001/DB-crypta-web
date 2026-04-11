const db = require("../models");
const NewsPost = db.newsPosts;
const User = db.users;
const Comment = db.comments;
const Like = db.likes;
const { getPagination, getPagingData } = require("../utils/pagination");

// Create a new NewsPost
exports.create = (req, res) => {
  // Validate request
  if (!req.body.title || !req.body.content) {
    res.status(400).send({
      message: "Title and content are required!"
    });
    return;
  }

  // Create a NewsPost
  const newsPost = {
    title: req.body.title,
    content: req.body.content,
    postType: req.body.postType ? req.body.postType : 'news',
    category: req.body.category,
    isPublished: req.body.isPublished ? req.body.isPublished : false,
    authorId: req.body.authorId,
    viewCount: 0
  };

  // Save NewsPost in the database
  NewsPost.create(newsPost)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the NewsPost."
      });
    });
};

// Retrieve all NewsPosts from database.
exports.findAll = (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  NewsPost.findAndCountAll({
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'firstName', 'lastName']
      },
      {
        model: Comment,
        as: 'comments',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'firstName', 'lastName']
          }
        ]
      },
      {
        model: Like,
        as: 'likes',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username']
          }
        ]
      }
    ],
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  })
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving news posts."
      });
    });
};

// Retrieve all published NewsPosts
exports.findAllPublished = (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);

  NewsPost.findAndCountAll({ 
    where: { isPublished: true },
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'firstName', 'lastName']
      }
    ],
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  })
    .then(data => {
      const response = getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving published news posts."
      });
    });
};

// Find a single NewsPost with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  NewsPost.findByPk(id, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'firstName', 'lastName']
      },
      {
        model: Comment,
        as: 'comments',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'firstName', 'lastName']
          }
        ]
      },
      {
        model: Like,
        as: 'likes',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username']
          }
        ]
      }
    ]
  })
    .then(data => {
      if (data) {
        // Increment view count
        NewsPost.increment('viewCount', { where: { id: id } });
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find NewsPost with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving NewsPost with id=" + id
      });
    });
};

// Update a NewsPost by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  NewsPost.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "NewsPost was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update NewsPost with id=${id}. Maybe NewsPost was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating NewsPost with id=" + id
      });
    });
};

// Delete a NewsPost with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  NewsPost.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "NewsPost was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete NewsPost with id=${id}. Maybe NewsPost was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete NewsPost with id=" + id
      });
    });
};

// Delete all NewsPosts from the database.
exports.deleteAll = (req, res) => {
  NewsPost.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} NewsPosts were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all news posts."
      });
    });
};
