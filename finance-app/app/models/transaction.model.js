module.exports = (sequelize, Sequelize) => {
  const Transaction = sequelize.define("transaction", {
    amount: {
      type: Sequelize.DECIMAL(20, 8),
      allowNull: false
    },
    currencyCode: {
      type: Sequelize.STRING,
      allowNull: false
    },
    transactionType: {
      type: Sequelize.ENUM('transfer', 'buy', 'sell', 'deposit', 'withdraw'),
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
