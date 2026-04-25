module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    passwordHash: {
      type: Sequelize.STRING,
      allowNull: false
    },
    firstName: {
      type: Sequelize.STRING
    },
    lastName: {
      type: Sequelize.STRING
    },
    phone: {
      type: Sequelize.STRING
    },
    isVerified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    isAdmin: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    coinBalance: {
      type: Sequelize.DECIMAL(20, 8),
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    btcBalance: {
      type: Sequelize.DECIMAL(20, 8),
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    usdBalance: {
      type: Sequelize.DECIMAL(20, 2),
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    rubBalance: {
      type: Sequelize.DECIMAL(20, 2),
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    indexes: [
      // Уникальные индексы создаются автоматически через unique: true
    ]
  });

  return User;
};
