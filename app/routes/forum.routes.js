const { authJwt, upload } = require('../middleware');
const controller = require('../controllers/forum.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  // create question
  app.post(
    '/api/forum/question/create',
    [authJwt.verifyToken],
    controller.createQuestion
  );

  // upload question image
  app.post(
    '/api/forum/question/upload',
    [authJwt.verifyToken, upload.single('file')],
    controller.uploadImage
  );

  // get uploaded image name for question
  app.get(
    '/api/forum/question/image/:questionId',
    controller.getImageName
  );

  // delete question (only user can delete their own question)
  app.delete(
    '/api/forum/question/delete/:questionId',
    [authJwt.verifyToken],
    controller.deleteQuestion
  );

  // retrieve all questions (can be accessed by all)
  app.get(
    '/api/forum/question/all',
    controller.getAllQuestions
  );

  // retrieve a single question
  app.get(
    '/api/forum/question/:questionId',
    controller.getQuestion
  );

  // create a comment
  app.post(
    '/api/forum/comment/create',
    [authJwt.verifyToken],
    controller.createComment
  );

  // delete comment (only user can delete their own comment)
  app.delete(
    '/api/forum/comment/delete/:commentId',
    [authJwt.verifyToken],
    controller.deleteComment
  );

  // retrieve all comments for a question (can be accessed by all)
  app.get(
    '/api/forum/comment/:questionId',
    controller.getComments
  );
};
