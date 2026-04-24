module.exports = (sequelize, Sequelize) => {
  const ChartPoint = sequelize.define("chartPoint", {
    symbol: {
      type: Sequelize.STRING,
      allowNull: false
    },
    price: {
      type: Sequelize.DECIMAL(20, 8),
      allowNull: false
    },
    timestamp: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    note: {
      type: Sequelize.TEXT
    }
  });

  return ChartPoint;
};
