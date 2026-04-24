module.exports = (sequelize, Sequelize) => {
  const Transaction = sequelize.define("transaction", {
    amount: {
      type: Sequelize.DECIMAL(20, 8),
      allowNull: false
    },
    currencyCode: {
      type: Sequelize.STRING,
      allowNull: false,
      references: null
    },
    transactionType: {
      type: Sequelize.ENUM('transfer', 'buy', 'sell', 'deposit', 'withdraw', 'exchange'),
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM('pending', 'completed', 'failed', 'cancelled'),
      defaultValue: 'pending'
    },
    fee: {
      type: Sequelize.DECIMAL(20, 8),
      defaultValue: 0
    },
    transactionHash: {
      type: Sequelize.STRING
    }
  });

  return Transaction;
};
