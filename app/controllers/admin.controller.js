/* 
* Controller containing all logic for administrator abilities
*/

const sequelize = require("sequelize");
const db = require("../models");
const users = db.user;

// get all users 
exports.getAllUsers = async (req, res) => { 
    const usersTable = await users.findAll({ 
        attributes: [
            'id', 
            'username', 
            'email', 
            'createdAt', 
            [sequelize.literal('(SELECT COUNT(DISTINCT(courseId)) FROM user_completed_courses WHERE users.id = user_completed_courses.userId)'), 'coursesComplete'], 
            [sequelize.literal('(SELECT COUNT(*) FROM user_quiz_scores WHERE users.id = user_quiz_scores.userId AND user_quiz_scores.bestScore > -1)'), 'quizzesComplete']
        ] 
    }); 
    res.json(usersTable);
};

// get courses for each user 

// get quizzes for each user 

// delete user 

// reset all stats for user 

// delete post 

// delete comment

// SELECT `id`, `username`, `email`, `createdAt`, (SELECT COUNT(*) FROM user_completed_courses WHERE users.id = user_completed_courses.userId) AS `totalAmount` FROM `users` AS `users`;