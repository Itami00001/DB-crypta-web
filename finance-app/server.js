require("dotenv").config();

const express = require("express");
const cors = require("cors");
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const app = express();

var corsOptions = {
  origin: ["http://localhost:8081", "http://localhost:6868"]
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// simple route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance App API',
      version: '1.0.0',
      description: 'API for financial accounting with cryptocurrency support',
    },
    servers: [
      {
        url: 'http://localhost:6868',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['username', 'email', 'passwordHash'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'User unique identifier'
            },
            username: {
              type: 'string',
              example: 'john_doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com'
            },
            passwordHash: {
              type: 'string',
              description: 'Hashed password (write-only)'
            },
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            },
            phone: {
              type: 'string',
              example: '+1234567890'
            },
            isVerified: {
              type: 'boolean',
              example: false
            },
            isAdmin: {
              type: 'boolean',
              example: false
            },
            coinBalance: {
              type: 'number',
              format: 'decimal',
              example: 100.50
            },
            btcBalance: {
              type: 'number',
              format: 'decimal',
              example: 0.001
            },
            usdBalance: {
              type: 'number',
              format: 'decimal',
              example: 1000.00
            },
            rubBalance: {
              type: 'number',
              format: 'decimal',
              example: 75000.00
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        CryptoWallet: {
          type: 'object',
          required: ['userId', 'walletAddress', 'walletType'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Wallet unique identifier'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'Owner user ID'
            },
            walletAddress: {
              type: 'string',
              example: 'wallet_abc123'
            },
            walletType: {
              type: 'string',
              example: 'default'
            },
            coinBalance: {
              type: 'number',
              format: 'decimal',
              example: 100.50
            },
            btcBalance: {
              type: 'number',
              format: 'decimal',
              example: 0.001
            },
            usdBalance: {
              type: 'number',
              format: 'decimal',
              example: 1000.00
            },
            rubBalance: {
              type: 'number',
              format: 'decimal',
              example: 75000.00
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Transaction: {
          type: 'object',
          required: ['amount', 'currencyCode', 'transactionType', 'fromWalletId'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Transaction unique identifier'
            },
            amount: {
              type: 'number',
              format: 'decimal',
              example: 100.50
            },
            currencyCode: {
              type: 'string',
              example: 'USD'
            },
            transactionType: {
              type: 'string',
              enum: ['transfer', 'buy', 'sell', 'deposit', 'withdraw', 'exchange'],
              example: 'transfer'
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'failed', 'cancelled'],
              example: 'completed'
            },
            fee: {
              type: 'number',
              format: 'decimal',
              example: 0.50
            },
            transactionHash: {
              type: 'string',
              example: 'TRANSFER_1234567890'
            },
            fromWalletId: {
              type: 'string',
              format: 'uuid',
              description: 'Source wallet ID'
            },
            toWalletId: {
              type: 'string',
              format: 'uuid',
              description: 'Destination wallet ID (null for deposit/withdraw)'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        NewsPost: {
          type: 'object',
          required: ['title', 'content'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Post unique identifier'
            },
            title: {
              type: 'string',
              example: 'Bitcoin Price Analysis'
            },
            content: {
              type: 'string',
              example: 'Detailed analysis of Bitcoin price movements...'
            },
            postType: {
              type: 'string',
              enum: ['news', 'prediction', 'analysis', 'announcement'],
              example: 'analysis'
            },
            category: {
              type: 'string',
              example: 'cryptocurrency'
            },
            isPublished: {
              type: 'boolean',
              example: true
            },
            viewCount: {
              type: 'integer',
              example: 150
            },
            url: {
              type: 'string',
              example: 'https://example.com/bitcoin-analysis'
            },
            imageUrl: {
              type: 'string',
              example: 'https://example.com/bitcoin.jpg'
            },
            authorId: {
              type: 'string',
              format: 'uuid',
              description: 'Author user ID'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Comment: {
          type: 'object',
          required: ['content'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Comment unique identifier'
            },
            content: {
              type: 'string',
              example: 'Great analysis!'
            },
            isDeleted: {
              type: 'boolean',
              example: false
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'Comment author user ID'
            },
            postId: {
              type: 'string',
              format: 'uuid',
              description: 'Post ID'
            },
            parentCommentId: {
              type: 'string',
              format: 'uuid',
              description: 'Parent comment ID for nested replies'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Like: {
          type: 'object',
          required: ['likeType'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Like unique identifier'
            },
            likeType: {
              type: 'string',
              enum: ['like', 'dislike', 'love'],
              example: 'like'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'User who liked'
            },
            postId: {
              type: 'string',
              format: 'uuid',
              description: 'Post that was liked'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        UserPrediction: {
          type: 'object',
          required: ['predictedPrice', 'targetPrice', 'predictionType', 'predictionDate', 'targetDate'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Prediction unique identifier'
            },
            predictedPrice: {
              type: 'number',
              format: 'decimal',
              example: 70000.00
            },
            targetPrice: {
              type: 'number',
              format: 'decimal',
              example: 75000.00
            },
            predictionType: {
              type: 'string',
              enum: ['bullish', 'bearish', 'neutral'],
              example: 'bullish'
            },
            predictionDate: {
              type: 'string',
              format: 'date-time'
            },
            targetDate: {
              type: 'string',
              format: 'date-time'
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            notes: {
              type: 'string',
              example: 'Based on technical analysis'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'Prediction author user ID'
            },
            currencyId: {
              type: 'string',
              format: 'uuid',
              description: 'Cryptocurrency ID'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ChartPoint: {
          type: 'object',
          required: ['symbol', 'price'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Chart point unique identifier'
            },
            symbol: {
              type: 'string',
              example: 'BTC'
            },
            price: {
              type: 'number',
              format: 'decimal',
              example: 68000.00
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            note: {
              type: 'string',
              example: 'Resistance level'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'Point creator user ID'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error description'
            }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Validation error description'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Field name'
                  },
                  message: {
                    type: 'string',
                    description: 'Error message for the field'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./app/routes/*.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Import routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/news-post.routes")(app);
require("./app/routes/crypto-wallet.routes")(app);
require("./app/routes/transaction.routes")(app);
require("./app/routes/crypto-currency.routes")(app);
require("./app/routes/comment.routes")(app);
require("./app/routes/user-prediction.routes")(app);
require("./app/routes/like.routes")(app);
require("./app/routes/analytics.routes")(app);
require("./app/routes/chart-point.routes")(app);

const db = require("./app/models");
const bcrypt = require("bcryptjs");

const startApp = async () => {
  try {
    await db.sequelize.authenticate();
    console.log("Connection has been established successfully.");

    // Manual column check BEFORE sync
    const columnsToAdd = [
      { name: 'coin_balance', type: 'DECIMAL(20,8)', default: '0' },
      { name: 'btc_balance', type: 'DECIMAL(20,8)', default: '0' },
      { name: 'usd_balance', type: 'DECIMAL(20,2)', default: '0' },
      { name: 'rub_balance', type: 'DECIMAL(20,2)', default: '0' }
    ];

    for (const col of columnsToAdd) {
      try {
        // We use double quotes for table and column names to be safe in Postgres
        await db.sequelize.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type} DEFAULT ${col.default}`);
        console.log(`Column ${col.name} verified/added.`);
      } catch (e) {
        console.log(`Note: ${col.name} column check handled.`);
      }
    }

    // Manual check for news_posts columns - use TEXT for long URLs
    try {
      // Add columns if missing (as TEXT)
      await db.sequelize.query(`ALTER TABLE "news_posts" ADD COLUMN IF NOT EXISTS "url" TEXT`);
      await db.sequelize.query(`ALTER TABLE "news_posts" ADD COLUMN IF NOT EXISTS "image_url" TEXT`);
      // Alter existing VARCHAR columns to TEXT if they were created as VARCHAR
      await db.sequelize.query(`ALTER TABLE "news_posts" ALTER COLUMN "url" TYPE TEXT`);
      await db.sequelize.query(`ALTER TABLE "news_posts" ALTER COLUMN "image_url" TYPE TEXT`);
      // Drop the unique constraint on url if it exists (long TEXT can't be indexed uniquely in PG)
      await db.sequelize.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'news_posts_url_unique'
          ) THEN
            ALTER TABLE "news_posts" DROP CONSTRAINT "news_posts_url_unique";
          END IF;
        END $$;
      `);
      console.log("NewsPost url/image_url columns set to TEXT.");
    } catch (e) {
      console.log(`Note: news_posts column migration: ${e.message}`);
    }

    // Manual migration for crypto_wallets - add new balance fields
    try {
      const walletColumnsToAdd = [
        { name: 'coin_balance', type: 'DECIMAL(20,8)', default: '0' },
        { name: 'btc_balance', type: 'DECIMAL(20,8)', default: '0' },
        { name: 'usd_balance', type: 'DECIMAL(20,2)', default: '0' },
        { name: 'rub_balance', type: 'DECIMAL(20,2)', default: '0' }
      ];

      for (const col of walletColumnsToAdd) {
        try {
          await db.sequelize.query(`ALTER TABLE "crypto_wallets" ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type} DEFAULT ${col.default}`);
          console.log(`CryptoWallet column ${col.name} verified/added.`);
        } catch (e) {
          console.log(`Note: crypto_wallets column ${col.name} check handled.`);
        }
      }

      // Migrate data from old balance/currencyCode to new fields
      try {
        // Migrate COIN wallets
        await db.sequelize.query(`
          UPDATE "crypto_wallets" 
          SET "coin_balance" = "balance" 
          WHERE "currency_code" = 'COIN' AND "coin_balance" = 0
        `);

        // Migrate BTC wallets
        await db.sequelize.query(`
          UPDATE "crypto_wallets" 
          SET "btc_balance" = "balance" 
          WHERE "currency_code" = 'BTC' AND "btc_balance" = 0
        `);

        // Migrate USD wallets
        await db.sequelize.query(`
          UPDATE "crypto_wallets" 
          SET "usd_balance" = "balance" 
          WHERE "currency_code" = 'USD' AND "usd_balance" = 0
        `);

        // Migrate RUB wallets
        await db.sequelize.query(`
          UPDATE "crypto_wallets" 
          SET "rub_balance" = "balance" 
          WHERE "currency_code" = 'RUB' AND "rub_balance" = 0
        `);

        console.log("CryptoWallet data migration completed.");
      } catch (e) {
        console.log(`Note: crypto_wallets data migration handled: ${e.message}`);
      }
    } catch (e) {
      console.log(`Note: crypto_wallets migration check handled: ${e.message}`);
    }

    await db.sequelize.sync({ alter: true });
    console.log("Synced db successfully.");

    console.log("Starting user seeding...");
    // Seed users
    try {
      const User = db.users;
      const usersToSeed = [
        { username: "admin", email: "admin@gmail.com", password: "adminadmin", isAdmin: true },
        { username: "test", email: "test@gmail.com", password: "testtest", isAdmin: false },
        { username: "test1", email: "test1@gmail.com", password: "test1test1", isAdmin: false },
        { username: "test2", email: "test2@gmail.com", password: "test2test2", isAdmin: false },
      ];
      for (const u of usersToSeed) {
        const existing = await User.findOne({ where: { username: u.username } });
        if (!existing) {
          const hash = await bcrypt.hash(u.password, 10);
          await User.create({
            username: u.username, email: u.email, passwordHash: hash,
            isAdmin: u.isAdmin, coinBalance: 0, btcBalance: 0, usdBalance: 0, rubBalance: 0
          });
          console.log(`User '${u.username}' created.`);
        } else if (u.isAdmin && !existing.isAdmin) {
          await existing.update({ isAdmin: true });
          console.log(`Admin flag set for '${u.username}'.`);
        }
      }
    } catch (err) {
      console.error("User seeding error:", err);
    }

    console.log("Starting crypto seeding...");
    // Seed default cryptocurrencies
    try {
      const Crypto = db.cryptoCurrencies;
      const cryptosToSeed = [
        { symbol: "BTC", name: "Bitcoin", currentPrice: 68000.00, marketCap: 1340000000000, volume24h: 28000000000, iconUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png", isActive: true },
        { symbol: "COIN", name: "Internal Coin", currentPrice: 1.0, marketCap: 1000000, volume24h: 50000, iconUrl: "💰", isActive: true },
        { symbol: "USD", name: "US Dollar", currentPrice: 1.0, marketCap: 0, volume24h: 0, iconUrl: "$", isActive: true },
        { symbol: "RUB", name: "Russian Ruble", currentPrice: 0.011, marketCap: 0, volume24h: 0, iconUrl: "₽", isActive: true },
        { symbol: "ETH", name: "Ethereum", currentPrice: 3500.00, marketCap: 420000000000, volume24h: 14000000000, iconUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png", isActive: true },
        { symbol: "SOL", name: "Solana", currentPrice: 175.00, marketCap: 80000000000, volume24h: 3000000000, iconUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png", isActive: true },
        { symbol: "BNB", name: "Binance Coin", currentPrice: 610.00, marketCap: 90000000000, volume24h: 1500000000, iconUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png", isActive: true },
        { symbol: "M", name: "Music COIN", currentPrice: 2.50, marketCap: 25000000, volume24h: 500000, iconUrl: "♪", description: "Music platform token", isActive: true },
        { symbol: "R", name: "R COIN", currentPrice: 15.00, marketCap: 150000000, volume24h: 2000000, iconUrl: "®", description: "Royalty token", isActive: true },
      ];
      for (const c of cryptosToSeed) {
        const existing = await Crypto.findOne({ where: { symbol: c.symbol } });
        if (!existing) {
          await Crypto.create(c);
          console.log(`Crypto '${c.symbol}' created.`);
        } else {
          // Update existing to ensure they are active and have names
          await existing.update({ isActive: true, name: c.name });
        }
      }
    } catch (err) {
      console.error("Crypto seeding error:", err);
    }

    const PORT = process.env.PORT || 6868;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });

  } catch (err) {
    console.error("Unable to connect to the database:", err);
    process.exit(1);
  }
};

startApp();
