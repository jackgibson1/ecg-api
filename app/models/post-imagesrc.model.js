module.exports = (sequelize, Sequelize) => {
  const postImageSrc = sequelize.define('post_image_sources', {
    imgsrc: {
      type: Sequelize.TEXT,
      allowNull: false
    }
  }, { timestamps: false });
  return postImageSrc;
};
