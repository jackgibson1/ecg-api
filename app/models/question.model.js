// model defining a forum question
// user can have many question but each question mush have one user (one-many)
// question can have many comments but each comment must have one question (one-many)

module.exports = (sequelize, Sequelize) => {
  const question = sequelize.define('questions', {
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
    }
  }, { timestamps: false });
  return question;
};
