module.exports = (sequelize, Sequelize) => {
  const Like = sequelize.define("like", {
    likeType: {
      type: Sequelize.ENUM('like', 'dislike', 'love'),
      allowNull: false,
      defaultValue: 'like'
    }
  });

  return Like;
};
