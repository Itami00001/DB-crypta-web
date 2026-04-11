module.exports = (sequelize, Sequelize) => {
  const CryptoCurrency = sequelize.define("cryptoCurrency", {
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
      defaultValue: 0
    },
    marketCap: {
      type: Sequelize.DECIMAL(20, 2),
      defaultValue: 0
    },
    volume24h: {
      type: Sequelize.DECIMAL(20, 2),
      defaultValue: 0
    },
    iconUrl: {
      type: Sequelize.STRING
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  });

  return CryptoCurrency;
};
