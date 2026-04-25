module.exports = (sequelize, Sequelize) => {
  const Comment = sequelize.define("comment", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    isDeleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
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
    },
    parentCommentId: {
      type: Sequelize.UUID,
      allowNull: true,
      field: 'parent_comment_id'
    }
  }, {
    indexes: [
      {
        fields: ['post_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['parent_comment_id']
      }
    ]
  });

  return Comment;
};
