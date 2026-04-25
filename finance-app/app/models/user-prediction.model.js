module.exports = (sequelize, Sequelize) => {
  const UserPrediction = sequelize.define("userPrediction", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    predictedPrice: {
      type: Sequelize.DECIMAL(20, 8),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    targetPrice: {
      type: Sequelize.DECIMAL(20, 8),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    predictionType: {
      type: Sequelize.ENUM('bullish', 'bearish', 'neutral'),
      allowNull: false
    },
    predictionDate: {
      type: Sequelize.DATE,
      allowNull: false
    },
    targetDate: {
      type: Sequelize.DATE,
      allowNull: false
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    notes: {
      type: Sequelize.TEXT
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: true,
      field: 'user_id'
    },
    currencyId: {
      type: Sequelize.UUID,
      allowNull: true,
      field: 'currency_id'
    }
  }, {
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['currency_id']
      },
      {
        fields: ['target_date']
      }
    ]
  });

  return UserPrediction;
};
