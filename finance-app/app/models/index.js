const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  port: dbConfig.port,
  operatorsAliases: false,
  
  define: {
    underscored: true
  },

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.users = require("./user.model.js")(sequelize, Sequelize);
db.cryptoWallets = require("./crypto-wallet.model.js")(sequelize, Sequelize);
db.transactions = require("./transaction.model.js")(sequelize, Sequelize);
db.newsPosts = require("./news-post.model.js")(sequelize, Sequelize);
db.comments = require("./comment.model.js")(sequelize, Sequelize);
db.cryptoCurrencies = require("./crypto-currency.model.js")(sequelize, Sequelize);
db.userPredictions = require("./user-prediction.model.js")(sequelize, Sequelize);
db.likes = require("./like.model.js")(sequelize, Sequelize);
db.chartPoints = require("./chart-point.model.js")(sequelize, Sequelize);

// Setup associations
require("./associations.js")(db);

module.exports = db;
