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

  // create post
  app.post(
    '/api/forum/post/create',
    [authJwt.verifyToken],
    controller.createPost
  );

  // upload post image
  app.post(
    '/api/forum/post/upload',
    [authJwt.verifyToken, upload.single('file')],
    controller.uploadImage
  );

  // get uploaded image name for post
  app.get(
    '/api/forum/post/image/:postId',
    [authJwt.verifyToken],
    controller.getImageName
  );

  // delete post (only user can delete their own post)
  app.delete(
    '/api/forum/post/delete/:postId',
    [authJwt.verifyToken],
    controller.deletePost
  );

  // retrieve all posts (can be accessed by all)
  app.get(
    '/api/forum/post/all',
    controller.getAllPosts
  );

  // retrieve a single post
  app.get(
    '/api/forum/post/:postId',
    controller.getPost
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

  // retrieve all comments for a post (can be accessed by all)
  app.get(
    '/api/forum/comment/:postId',
    controller.getComments
  );
};
