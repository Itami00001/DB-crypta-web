module.exports = (sequelize, Sequelize) => {
  const UserPrediction = sequelize.define("userPrediction", {
    predictedPrice: {
      type: Sequelize.DECIMAL(20, 8),
      allowNull: false
    },
    targetPrice: {
      type: Sequelize.DECIMAL(20, 8),
      allowNull: false
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
    }
  });

  return UserPrediction;
};
