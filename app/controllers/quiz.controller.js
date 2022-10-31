/* eslint-disable no-restricted-syntax */
const db = require('../models');

const Credit = db.credit;
const UserQuizScores = db.user_quiz_scores;

// get quiz (best)score for user
exports.getQuizScore = async (req, res) => {
  const quizId = req.params.quizId;
  const userId = req.headers['user-id'];

  if (!quizId || !userId) {
    return res.status(400).send({ message: 'Ensure userId and quizId are both set!' });
  } if (Number.isNaN(quizId)) {
    return res.status(400).send({ message: 'Please enter a valid quizId!' });
  }

  const score = await UserQuizScores.findAll({ where: { userId, quizId } })
    .then((resp) => resp[0].dataValues.bestScore)
    .catch((err) => res.status(500).send({ message: err.message }));
  return res.json({ score });
};

// get list of all quiz scores for user
exports.getAllQuizScores = async (req, res) => {
  const userId = req.headers['user-id'];
  const scores = [];

  await UserQuizScores.findAll({ where: { userId } }).then(async (quizzes) => {
    for (const quiz of quizzes) {
      const quizId = quiz.dataValues.quizId;
      const bestScore = quiz.dataValues.bestScore;

      scores.push({ quizId, score: bestScore });
    }
    return res.json(scores);
  }).catch((err) => res.status(500).send({ message: err.message }));
};

// update quiz score
// note that only the best score for a user is saved
exports.updateQuizScore = async (req, res) => {
  const userId = req.headers['user-id'];
  const quizId = req.body.quizId;
  const score = req.body.score;

  // ensure all variables are set and defined
  if (typeof userId === 'undefined' || typeof quizId === 'undefined' || typeof score === 'undefined') {
    return res.status(400).send({ message: 'Ensure userId, quizId and rating are all set' });
  } if (Number.isNaN(quizId) || Number.isNaN(score)) {
    return res.status(400).send({ message: 'Please enter a valid quizId or score!' });
  }

  const previousScore = await UserQuizScores.findAll({ where: { userId, quizId } })
    .then((resp) => resp[0].dataValues.bestScore);

  // only update table if score is greater than previous score
  if (parseInt(score, 10) > previousScore) {
    UserQuizScores.update({ bestScore: score }, { where: { userId, quizId } })
      .catch((err) => res.status(500).send({ message: err.message }));
  }

  // all quiz scores intitially set to -1 for each quiz
  // can only earn credit for successfully completing quiz for time
  if (parseInt(previousScore, 10) === -1) {
    // first time completion = credit earned
    Credit.increment('credits', { by: 1, where: { userId } });
    return res.json({ creditEarned: true });
  }
  return res.json({ creditEarned: false });
};
