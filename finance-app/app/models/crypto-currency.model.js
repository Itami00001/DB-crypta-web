module.exports = (sequelize, Sequelize) => {
  const CryptoCurrency = sequelize.define("cryptoCurrency", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    symbol: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT
    },
    currentPrice: {
      type: Sequelize.DECIMAL(20, 8),
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    marketCap: {
      type: Sequelize.DECIMAL(20, 2),
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    volume24h: {
      type: Sequelize.DECIMAL(20, 2),
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    iconUrl: {
      type: Sequelize.STRING
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['symbol']
      }
    ]
  });

  return CryptoCurrency;
};
