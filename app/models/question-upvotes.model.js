module.exports = (sequelize, Sequelize) => {
  const questionUpvotes = sequelize.define('question_upvotes', {
    questionId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      unique: 'comp_key'
    },
    username: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: 'comp_key',
      references: {
        model: 'users',
        key: 'username'
      }
    }
  }, { timestamps: false });

  return questionUpvotes;
};
