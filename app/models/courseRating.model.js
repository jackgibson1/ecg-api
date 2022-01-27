// model used to keep track of course ratings (reviews)

module.exports = (sequelize, Sequelize) => {
    const courseRating = sequelize.define('course_ratings', { 
        rating: { 
            type: Sequelize.DataTypes.INTEGER, 
            allowNull: false, 
        }, 
        courseId: { 
            type: Sequelize.DataTypes.INTEGER, 
            allowNull: false, 
            unique:"comp_key"
        }, 
        userId: { 
            type: Sequelize.DataTypes.INTEGER, 
            allowNull: false, 
            unique:"comp_key"
        }, 
    }, { timestamps: false }); 

    return courseRating; 
};