// model defining courses

module.exports = (sequelize, Sequelize) => {
  const quiz = sequelize.define('quizzes', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING
    }
  }, { timestamps: false });

  return quiz;
};
