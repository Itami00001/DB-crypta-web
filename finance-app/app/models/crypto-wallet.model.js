module.exports = (sequelize, Sequelize) => {
  const CryptoWallet = sequelize.define("cryptoWallet", {
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    walletAddress: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    walletType: {
      type: Sequelize.STRING,
      allowNull: false
    },
    coinBalance: {
      type: Sequelize.DECIMAL(20, 8),
      defaultValue: 0
    },
    btcBalance: {
      type: Sequelize.DECIMAL(20, 8),
      defaultValue: 0
    },
    usdBalance: {
      type: Sequelize.DECIMAL(20, 2),
      defaultValue: 0
    },
    rubBalance: {
      type: Sequelize.DECIMAL(20, 2),
      defaultValue: 0
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  });

  return CryptoWallet;
};
