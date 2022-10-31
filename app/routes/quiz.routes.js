const { authJwt } = require('../middleware');
const controller = require('../controllers/quiz.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  // get users best score for provided quiz
  app.get(
    '/api/quiz/score/:quizId',
    [authJwt.verifyToken],
    controller.getQuizScore
  );

  // get list of all quiz scores for user
  app.get(
    '/api/quiz/scores/all',
    [authJwt.verifyToken],
    controller.getAllQuizScores
  );

  // update quiz score
  app.put(
    '/api/quiz/score',
    [authJwt.verifyToken],
    controller.updateQuizScore
  );
};
