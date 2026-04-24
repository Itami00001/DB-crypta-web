module.exports = (db) => {
  // User associations
  db.users.hasMany(db.cryptoWallets, { foreignKey: 'userId', as: 'wallets' });
  db.users.hasMany(db.newsPosts, { foreignKey: 'authorId', as: 'posts' });
  db.users.hasMany(db.comments, { foreignKey: 'userId', as: 'comments' });
  db.users.hasMany(db.userPredictions, { foreignKey: 'userId', as: 'predictions' });
  db.users.hasMany(db.likes, { foreignKey: 'userId', as: 'likes' });
  db.users.hasMany(db.chartPoints, { foreignKey: 'userId', as: 'chartPoints' });

  // CryptoWallet associations
  db.cryptoWallets.belongsTo(db.users, { foreignKey: 'userId', as: 'user' });
  db.cryptoWallets.hasMany(db.transactions, { foreignKey: 'fromWalletId', as: 'outgoingTransactions' });
  db.cryptoWallets.hasMany(db.transactions, { foreignKey: 'toWalletId', as: 'incomingTransactions' });

  // Transaction associations
  db.transactions.belongsTo(db.cryptoWallets, { foreignKey: 'fromWalletId', as: 'fromWallet' });
  db.transactions.belongsTo(db.cryptoWallets, { foreignKey: 'toWalletId', as: 'toWallet' });
  db.transactions.belongsTo(db.cryptoCurrencies, { foreignKey: 'currencyCode', targetKey: 'symbol', as: 'currency' });

  // NewsPost associations
  db.newsPosts.belongsTo(db.users, { foreignKey: 'authorId', as: 'author' });
  db.newsPosts.hasMany(db.comments, { foreignKey: 'postId', as: 'comments' });
  db.newsPosts.hasMany(db.likes, { foreignKey: 'postId', as: 'likes' });

  // Comment associations
  db.comments.belongsTo(db.newsPosts, { foreignKey: 'postId', as: 'post' });
  db.comments.belongsTo(db.users, { foreignKey: 'userId', as: 'user' });
  db.comments.belongsTo(db.comments, { foreignKey: 'parentCommentId', as: 'parentComment' });
  db.comments.hasMany(db.comments, { foreignKey: 'parentCommentId', as: 'replies' });

  // CryptoCurrency associations
  db.cryptoCurrencies.hasMany(db.userPredictions, { foreignKey: 'currencyId', as: 'predictions' });
  db.cryptoCurrencies.hasMany(db.cryptoWallets, { foreignKey: 'currencyCode', sourceKey: 'symbol', as: 'wallets' });

  // UserPrediction associations
  db.userPredictions.belongsTo(db.users, { foreignKey: 'userId', as: 'user' });
  db.userPredictions.belongsTo(db.cryptoCurrencies, { foreignKey: 'currencyId', as: 'currency' });

  // Like associations
  db.likes.belongsTo(db.users, { foreignKey: 'userId', as: 'user' });
  db.likes.belongsTo(db.newsPosts, { foreignKey: 'postId', as: 'post' });

  // ChartPoint associations
  db.chartPoints.belongsTo(db.users, { foreignKey: 'userId', as: 'user' });
};
