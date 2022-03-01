/*
* Controller containing all logic for administrator abilities
*/

const sequelize = require('sequelize');
const db = require('../models');

const users = db.user;

// get all users
// for each user return id, username, email, createdAt, totalCoursesComplete & totalQuizzesComplete
exports.getAllUsers = async (req, res) => {
  const usersTable = await users.findAll({
    attributes: [
      'id',
      'username',
      'email',
      'createdAt',
      [sequelize.literal('(SELECT credits FROM credits WHERE users.id = credits.userId)'), 'credits'],
      [sequelize.literal('(SELECT COUNT(DISTINCT(courseId)) FROM user_completed_courses WHERE users.id = user_completed_courses.userId)'), 'coursesComplete'],
      [sequelize.literal('(SELECT COUNT(*) FROM user_quiz_scores WHERE users.id = user_quiz_scores.userId AND user_quiz_scores.bestScore > -1)'), 'quizzesComplete']
    ]
  });
  res.json(usersTable);
};

// delete user
exports.deleteUser = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(404).send({ message: 'Ensure userId to be deleted is set in body!' });
  await users.destroy({ where: { id: userId } })
    .then((rowDeleted) => {
      if (rowDeleted === 1) res.json({ success: true });
      else res.json({ success: false });
    })
    .catch(() => res.json({ success: false }));
};

// reset all stats for user
// delete post
// delete comment
