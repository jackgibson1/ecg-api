module.exports = (sequelize, Sequelize) => {
  const questionImageSrc = sequelize.define('question_image_sources', {
    imgsrc: {
      type: Sequelize.TEXT,
      allowNull: false
    }
  }, { timestamps: false });
  return questionImageSrc;
};
