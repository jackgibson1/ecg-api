// model to keep track of user progress of course
// primary key is a composite key (userId and courseId) and the attribute is 'position'

module.exports = (sequelize, Sequelize) => {
  const UserProgress = sequelize.define('user_progress', {
    position: Sequelize.DataTypes.INTEGER
  }, { timestamps: false });

  return UserProgress;
};
