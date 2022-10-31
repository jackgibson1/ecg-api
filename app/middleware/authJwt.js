const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const db = require('../models');

const User = db.user;

const { TokenExpiredError } = jwt;

// functionality for checking if token expired error
// if token isn't valid return unauthorised
const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(401).send({ message: 'Unauthorized! Access Token has expired!' });
  }
  return res.sendStatus(401).send({ message: 'Unauthorised!' });
};

const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];

  if (!token) {
    return res.status(403).send({
      message: 'No token provided!'
    });
  }

  // check if jwt provided is valid
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) return catchError(err, res);
    req.userId = decoded.id;
    next();
  });
};

// check if user's roles contains ROLE_ADMIN
const isAdmin = (req, res, next) => {
  const adminId = req.headers['admin-user-id'];

  if (!adminId) {
    return res.status(403).send({ message: 'Admin user ID is not set within header!' });
  }

  User.findByPk(adminId).then((user) => {
    user.getRoles().then((roles) => {
      for (let i = 0; i < roles.length; i += 1) {
        if (roles[i].name === 'admin') {
          next();
          return;
        }
      }

      res.status(403).send({
        message: 'Require Admin Role!'
      });
    });
  });
};

const authJwt = {
  verifyToken,
  isAdmin
};
module.exports = authJwt;
