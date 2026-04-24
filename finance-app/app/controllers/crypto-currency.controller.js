const db = require("../models");
const CryptoCurrency = db.cryptoCurrencies;
const UserPrediction = db.userPredictions;
const CryptoWallet = db.cryptoWallets;
const https = require('https');

// Create a new CryptoCurrency
exports.create = (req, res) => {
  // Validate request
  if (!req.body.symbol || !req.body.name) {
    res.status(400).send({
      message: "Symbol and name are required!"
    });
    return;
  }

  // Create a CryptoCurrency
  const cryptoCurrency = {
    symbol: req.body.symbol.toUpperCase(),
    name: req.body.name,
    description: req.body.description,
    currentPrice: req.body.currentPrice ? req.body.currentPrice : 0,
    marketCap: req.body.marketCap ? req.body.marketCap : 0,
    volume24h: req.body.volume24h ? req.body.volume24h : 0,
    iconUrl: req.body.iconUrl,
    isActive: req.body.isActive ? req.body.isActive : true
  };

  // Save CryptoCurrency in database
  CryptoCurrency.create(cryptoCurrency)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating CryptoCurrency."
      });
    });
};

// Retrieve all CryptoCurrencies from database.
exports.findAll = (req, res) => {
  CryptoCurrency.findAll({
    where: { isActive: true },
    include: [
      {
        model: UserPrediction,
        as: 'predictions',
        limit: 5,
        order: [['createdAt', 'DESC']]
      }
    ],
    order: [['marketCap', 'DESC']]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving crypto currencies."
      });
    });
};

// Find a single CryptoCurrency with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  CryptoCurrency.findByPk(id, {
    include: [
      {
        model: UserPrediction,
        as: 'predictions',
        include: [
          {
            model: db.users,
            as: 'user',
            attributes: ['id', 'username', 'firstName', 'lastName']
          }
        ],
        order: [['createdAt', 'DESC']]
      },
      {
        model: CryptoWallet,
        as: 'wallets',
        attributes: ['id', 'walletAddress', 'balance']
      }
    ]
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find CryptoCurrency with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving CryptoCurrency with id=" + id
      });
    });
};

// Find CryptoCurrency by symbol
exports.findBySymbol = (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  CryptoCurrency.findOne({
    where: { symbol: symbol },
    include: [
      {
        model: UserPrediction,
        as: 'predictions',
        include: [
          {
            model: db.users,
            as: 'user',
            attributes: ['id', 'username', 'firstName', 'lastName']
          }
        ],
        order: [['createdAt', 'DESC']]
      }
    ]
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find CryptoCurrency with symbol=${symbol}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving CryptoCurrency with symbol=" + symbol
      });
    });
};

// Update a CryptoCurrency by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  // Convert symbol to uppercase if provided
  if (req.body.symbol) {
    req.body.symbol = req.body.symbol.toUpperCase();
  }

  CryptoCurrency.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "CryptoCurrency was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update CryptoCurrency with id=${id}. Maybe CryptoCurrency was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating CryptoCurrency with id=" + id
      });
    });
};

// Delete a CryptoCurrency with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  CryptoCurrency.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "CryptoCurrency was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete CryptoCurrency with id=${id}. Maybe CryptoCurrency was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete CryptoCurrency with id=" + id
      });
    });
};

// Delete all CryptoCurrencies from the database.
exports.deleteAll = (req, res) => {
  CryptoCurrency.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} CryptoCurrencies were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all crypto currencies."
      });
    });
};

// Get market data from CryptoCompare API
exports.getMarketData = async (req, res) => {
  try {
    const apiKey = process.env.CRYPTO_COMPARE_API_KEY;
    const options = {
      hostname: 'min-api.cryptocompare.com',
      path: '/data/top/mktcapfull?tsym=USD&limit=20',
      method: 'GET',
      headers: {
        'Authorization': `Apikey ${apiKey}`
      }
    };

    const marketReq = https.request(options, (marketRes) => {
      let data = '';

      marketRes.on('data', (chunk) => {
        data += chunk;
      });

      marketRes.on('end', async () => {
        try {
          const response = JSON.parse(data);
          
          if (response.Response === 'Success' && response.Data) {
            const marketData = response.Data;
            let updatedCount = 0;

            for (const item of marketData) {
              const coinInfo = item.CoinInfo;
              const raw = item.RAW;
              
              if (coinInfo && raw && raw.USD) {
                const existing = await CryptoCurrency.findOne({
                  where: { symbol: coinInfo.Name }
                });

                const currencyData = {
                  symbol: coinInfo.Name,
                  name: coinInfo.FullName,
                  currentPrice: raw.USD.PRICE,
                  marketCap: raw.USD.MKTCAP,
                  volume24h: raw.USD.TOTALVOLUME24HTO,
                  iconUrl: coinInfo.ImageUrl ? `https://www.cryptocompare.com${coinInfo.ImageUrl}` : null,
                  isActive: true
                };

                if (existing) {
                  await existing.update(currencyData);
                  updatedCount++;
                } else {
                  await CryptoCurrency.create(currencyData);
                  updatedCount++;
                }
              }
            }

            res.send({
              message: `Successfully updated ${updatedCount} cryptocurrencies`,
              total: marketData.length,
              updated: updatedCount
            });
          } else {
            res.status(500).send({
              message: 'Failed to fetch market data from CryptoCompare'
            });
          }
        } catch (error) {
          res.status(500).send({
            message: error.message || 'Error parsing market data'
          });
        }
      });
    });

    marketReq.on('error', (error) => {
      res.status(500).send({
        message: error.message || 'Error fetching market data from CryptoCompare'
      });
    });

    marketReq.end();
  } catch (error) {
    res.status(500).send({
      message: error.message || 'Error getting market data'
    });
  }
};
