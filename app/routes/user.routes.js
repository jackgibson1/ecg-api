const { authJwt } = require('../middleware');
const controller = require('../controllers/user.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  // get date user created account
  app.get(
    '/api/user/datecreated',
    [authJwt.verifyToken],
    controller.getDateCreated
  );

  // get credits for user
  app.get(
    '/api/user/credits',
    [authJwt.verifyToken],
    controller.getCredits
  );
};
