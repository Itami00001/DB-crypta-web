module.exports = (sequelize, Sequelize) => {
  const Like = sequelize.define("like", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    likeType: {
      type: Sequelize.ENUM('like', 'dislike', 'love'),
      allowNull: false,
      defaultValue: 'like'
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: true,
      field: 'user_id'
    },
    postId: {
      type: Sequelize.UUID,
      allowNull: true,
      field: 'post_id'
    }
  }, {
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['post_id']
      },
      {
        unique: true,
        fields: ['user_id', 'post_id']
      }
    ]
  });

  return Like;
};
