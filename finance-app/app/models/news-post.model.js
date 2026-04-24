module.exports = (sequelize, Sequelize) => {
  const NewsPost = sequelize.define("newsPost", {
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
      defaultValue: 0
    },
    url: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    imageUrl: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  });

  return NewsPost;
};
