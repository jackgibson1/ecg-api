// model defining courses

module.exports = (sequelize, Sequelize) => {
  const Course = sequelize.define('courses', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING
    }
  }, { timestamps: false });

  return Course;
};
