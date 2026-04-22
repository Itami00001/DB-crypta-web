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
        console.log(`Note: ${col.name} check for table "users" resulted in: ${e.message}`);
        // Try again with lowercase table name without quotes just in case
        try {
          await db.sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col.name} ${col.type} DEFAULT ${col.default}`);
        } catch (e2) { }
      }
    }

    await db.sequelize.sync({ alter: true });
    console.log("Synced db successfully.");

    // Seed admin user
    try {
      const User = db.users;
      const adminUser = await User.findOne({ where: { username: "admin" } });

      if (!adminUser) {
        const hashedPassword = await bcrypt.hash("adminadmin", 10);
        await User.create({
          username: "admin",
          email: "admin@example.com",
          passwordHash: hashedPassword,
          isAdmin: true,
          coinBalance: 0,
          btcBalance: 0,
          usdBalance: 0,
          rubBalance: 0
        });
        console.log("Admin user created.");
      } else if (!adminUser.isAdmin) {
        await adminUser.update({ isAdmin: true });
        console.log("Admin rights granted.");
      }
    } catch (err) {
      console.error("Admin seeding error:", err);
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
