const { authJwt } = require('../middleware');
const controller = require('../controllers/admin.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  // get all users
  app.get(
    '/api/admin/all-users',
    [authJwt.isAdmin, authJwt.verifyToken],
    controller.getAllUsers
  );

  // delete user
  app.delete(
    '/api/admin/delete-user',
    [authJwt.isAdmin, authJwt.verifyToken],
    controller.deleteUser
  );

  // reset all stats for user
  // delete post
  // delete comment
};
