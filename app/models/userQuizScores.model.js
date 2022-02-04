module.exports = (sequelize, Sequelize) => { 
    const UserQuizScores = sequelize.define("user_quiz_score", { 
        bestScore: { 
            type: Sequelize.DataTypes.INTEGER, 
            allowNull: false, 
        }
    }, { timestamps: false });
    
    return UserQuizScores;
};