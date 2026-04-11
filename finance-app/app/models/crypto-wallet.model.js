module.exports = (sequelize, Sequelize) => {
  const CryptoWallet = sequelize.define("cryptoWallet", {
    walletAddress: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    walletType: {
      type: Sequelize.STRING,
      allowNull: false
    },
    balance: {
      type: Sequelize.DECIMAL(20, 8),
      defaultValue: 0
    },
    currencyCode: {
      type: Sequelize.STRING,
      allowNull: false
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  });

  return CryptoWallet;
};
