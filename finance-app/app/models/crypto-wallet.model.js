module.exports = (sequelize, Sequelize) => {
  const CryptoWallet = sequelize.define("cryptoWallet", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
      field: 'user_id'
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
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  }, {
    indexes: [
      // Уникальный индекс для walletAddress создается автоматически через unique: true
      {
        fields: ['user_id']
      }
    ]
  });

  return CryptoWallet;
};
