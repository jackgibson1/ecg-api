const { authJwt } = require('../middleware');
const controller = require('../controllers/forum.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  // create post
  app.post(
    '/api/forum/post/create',
    [authJwt.verifyToken],
    controller.createPost
  );

  // delete post (only user can delete their own post)
  app.delete(
    '/api/forum/post/delete/:postId',
    [authJwt.verifyToken],
    controller.deletePost
  );
};
