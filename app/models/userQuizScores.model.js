module.exports = (sequelize, Sequelize) => { 
    const UserQuizScores = sequelize.define("user_quiz_score", { 
        bestScore: Sequelize.DataTypes.INTEGER
    }, { timestamps: false });
    
    return UserQuizScores;
};