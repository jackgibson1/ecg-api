// model used to keep track of course ratings (reviews)

module.exports = (sequelize, Sequelize) => {
    const courseRating = sequelize.define('course_ratings', { 
        rating: { 
            type: Sequelize.DataTypes.INTEGER, 
            allowNull: false, 
        }
    }, { timestamps: false }); 

    return courseRating; 
};