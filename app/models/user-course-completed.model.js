// model used to keep track of course completions 
// note that a user can complete each course many times

module.exports = (sequelize, Sequelize) => {
    const userCompletedCourse = sequelize.define('user_completed_course', { 
        datecompleted: Sequelize.DataTypes.DATE
    }, { timestamps: false }); 

    return userCompletedCourse; 
};