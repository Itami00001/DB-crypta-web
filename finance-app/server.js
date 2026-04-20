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

db.sequelize.sync()
  .then(async () => {
    console.log("Synced db.");

    // Seed admin user
    try {
      const User = db.users;
      const adminUser = await User.findOne({ where: { username: "admin" } });

      if (!adminUser) {
        const passwordHash = await bcrypt.hash("adminadmin", 10);
        await User.create({
          username: "admin",
          email: "admin@example.com",
          passwordHash: passwordHash,
          firstName: "Admin",
          lastName: "System",
          isAdmin: true
        });
        console.log("Admin user created.");
      } else if (!adminUser.isAdmin) {
        await adminUser.update({ isAdmin: true });
        console.log("Existing admin user updated to actual admin.");
      }
    } catch (error) {
      console.error("Error seeding admin user:", error);
    }
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

// set port, listen for requests
const PORT = process.env.NODE_DOCKER_PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
