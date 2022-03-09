// defining forum comment of post
// a post can have mulitple comments but each comment must have one post (one-many)
// a user can have multiple comments but each comment must have one user (one-many)

module.exports = (sequelize, Sequelize) => {
  const comment = sequelize.define('comments', {
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    date: {
      type: Sequelize.DATE,
      allowNull: false
    }
  }, { timestamps: false });
  return comment;
};
