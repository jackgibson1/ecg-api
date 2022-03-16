// model defining a forum post
// user can have many posts but each post mush have one user (one-many)
// post can have many comments but each comment must have one post (one-many)

module.exports = (sequelize, Sequelize) => {
  const post = sequelize.define('posts', {
    title: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false
    },
    img_src: {
      type: Sequelize.STRING,
      allowNull: true
    }
  }, { timestamps: false });
  return post;
};
