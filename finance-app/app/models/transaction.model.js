module.exports = (sequelize, Sequelize) => {
  const Transaction = sequelize.define("transaction", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    amount: {
      type: Sequelize.DECIMAL(20, 8),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    currencyCode: {
      type: Sequelize.STRING,
      allowNull: false
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
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    transactionHash: {
      type: Sequelize.STRING
    },
    fromWalletId: {
      type: Sequelize.UUID,
      allowNull: false,
      field: 'from_wallet_id'
    },
    toWalletId: {
      type: Sequelize.UUID,
      allowNull: true,
      field: 'to_wallet_id'
    }
  }, {
    indexes: [
      {
        fields: ['from_wallet_id']
      },
      {
        fields: ['to_wallet_id']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['currency_code']
      }
    ]
  });

  return Transaction;
};
