module.exports = (sequelize, Sequelize) => {
  const NewsPost = sequelize.define("newsPost", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    postType: {
      type: Sequelize.ENUM('news', 'prediction', 'analysis', 'announcement'),
      defaultValue: 'news'
    },
    category: {
      type: Sequelize.STRING
    },
    isPublished: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    viewCount: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    url: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    imageUrl: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    authorId: {
      type: Sequelize.UUID,
      allowNull: true,
      field: 'author_id'
    }
  }, {
    indexes: [
      {
        fields: ['author_id']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['is_published']
      }
    ]
  });

  return NewsPost;
};
