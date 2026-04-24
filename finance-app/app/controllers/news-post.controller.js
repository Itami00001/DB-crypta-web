const db = require("../models");
const NewsPost = db.newsPosts;
const User = db.users;
const Comment = db.comments;
const Like = db.likes;
const { getPagination, getPagingData } = require("../utils/pagination");
const https = require('https');

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

// Sync news with CryptoCompare API
exports.syncWithCryptoCompare = async (req, res) => {
  console.log("=== NEWS SYNC START ===");
  try {
    const apiKey = process.env.CRYPTO_COMPARE_API_KEY;
    console.log("Using API Key: ", apiKey ? "SET (ends with " + apiKey.slice(-4) + ")" : "NOT SET");

    const options = {
      hostname: 'min-api.cryptocompare.com',
      path: '/data/v2/news/?lang=EN',
      method: 'GET'
    };

    if (apiKey) {
      options.headers = { 'Authorization': `Apikey ${apiKey}` };
    }

    console.log("Requesting news from CryptoCompare...");
    const newsReq = https.request(options, (newsRes) => {
      let data = '';
      console.log("Response status: ", newsRes.statusCode);

      newsRes.on('data', (chunk) => { data += chunk; });

      newsRes.on('end', async () => {
        try {
          console.log("Data received, parsing...");
          const response = JSON.parse(data);

          if (newsRes.statusCode && newsRes.statusCode >= 400) {
            console.error("CryptoCompare HTTP error:", newsRes.statusCode, response && response.Message);
            return res.status(502).send({
              message: 'CryptoCompare HTTP error',
              status: newsRes.statusCode,
              error: response && response.Message ? response.Message : 'Bad response from CryptoCompare'
            });
          }

          const isSuccess = response && (response.Response === 'Success' || response.Response === 'success');
          // CryptoCompare V2 news response shape is typically: { Response, Message, Data: { Data: [...] } }
          const newsItems = (
            response && Array.isArray(response.Data) ? response.Data :
            response && response.Data && Array.isArray(response.Data.Data) ? response.Data.Data :
            response && response.Data && Array.isArray(response.Data.news) ? response.Data.news :
            []
          );

          // CryptoCompare sometimes returns Response not equal to 'Success' but Message indicates success.
          const messageIndicatesSuccess = !!(
            response && typeof response.Message === 'string' &&
            response.Message.toLowerCase().includes('news list successfully returned')
          );

          const treatAsSuccess = isSuccess || messageIndicatesSuccess;

          if (treatAsSuccess && newsItems.length > 0) {
            console.log(`Received ${newsItems.length} news items.`);

            const adminUser = await User.findOne({ where: { isAdmin: true } });
            const authorId = adminUser ? adminUser.id : null;
            console.log("Author ID for news: ", authorId);

            if (!authorId) {
              console.error("CRITICAL: No admin user found for news authorship.");
              return res.status(500).send({ message: 'Admin user not found. Please run seeding.' });
            }

            let savedCount = 0;
            let skippedCount = 0;
            let errorCount = 0;

            for (const item of newsItems) {
              try {
                const existing = await NewsPost.findOne({ where: { url: item.url } });
                if (!existing) {
                  const content = item.body && item.body.trim() ? item.body : item.title;
                  await NewsPost.create({
                    title: item.title,
                    content: content,
                    postType: 'news',
                    category: item.categories || 'cryptocurrency',
                    isPublished: true,
                    viewCount: 0,
                    url: item.url,
                    imageUrl: item.imageurl,
                    authorId: authorId
                  });
                  savedCount++;
                } else {
                  skippedCount++;
                }
              } catch (e) {
                errorCount++;
                console.error(`Item creation failed [${item.title.slice(0, 20)}]:`, e.message);
              }
            }

            console.log(`Sync complete. Saved: ${savedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);
            res.send({
              message: `Sync complete: ${savedCount} new items.`,
              total: newsItems.length,
              new: savedCount,
              skipped: skippedCount,
              errors: errorCount
            });
          } else {
            // CryptoCompare may return Message like "News list successfully returned" even on success.
            // Treat missing/empty Data as a valid (but empty) sync, not a server error.
            if (treatAsSuccess && newsItems.length === 0) {
              console.log("CryptoCompare returned success but empty news list.");
              return res.send({
                message: 'Sync complete: 0 new items.',
                total: 0,
                new: 0,
                skipped: 0,
                errors: 0
              });
            }

            // If Response isn't Success, treat it as an upstream error.
            console.error("CryptoCompare API error response:", response && response.Message ? response.Message : response);
            res.status(502).send({
              message: 'CryptoCompare API error',
              error: response && response.Message ? response.Message : 'Unknown CryptoCompare error',
              responseType: response && response.Response ? response.Response : undefined
            });
          }
        } catch (error) {
          console.error('Parse error: ', error.message);
          res.status(500).send({ message: 'Parse error', error: error.message });
        }
      });
    });

    newsReq.on('error', (e) => {
      console.error('HTTPS request error: ', e.message);
      res.status(500).send({ message: 'Fetch error', error: e.message });
    });

    newsReq.setTimeout(15000, () => {
      console.error('Sync timeout.');
      newsReq.destroy();
      res.status(500).send({ message: 'Timeout' });
    });

    newsReq.end();
  } catch (err) {
    console.error('Sync process crash: ', err.message);
    res.status(500).send({ message: 'Sync crash', error: err.message });
  }
};
