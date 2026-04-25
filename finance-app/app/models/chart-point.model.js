module.exports = (sequelize, Sequelize) => {
  const ChartPoint = sequelize.define("chartPoint", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    symbol: {
      type: Sequelize.STRING,
      allowNull: false
    },
    price: {
      type: Sequelize.DECIMAL(20, 8),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    timestamp: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    note: {
      type: Sequelize.TEXT
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: true,
      field: 'user_id'
    }
  }, {
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['symbol']
      },
      {
        fields: ['timestamp']
      },
      {
        fields: ['user_id', 'symbol', 'timestamp']
      }
    ]
  });

  return ChartPoint;
};
