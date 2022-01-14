// model used to keep track of course completions 
// note that each course can completed many times

module.exports = (sequelize, Sequelize) => {
    const userCompletedCourse = sequelize.define('user_completed_course', { 
        datecompleted: Sequelize.DataTypes.DATE
    }, { timestamps: false }); 

    return userCompletedCourse; 
};