/*
 * Controller for all user related logic
 * Date user created account & users total credits
 * Note: Logic for incrementation of user credits is done within course/quiz controllers
*/

const db = require('../models');

const Users = db.user;
const Credit = db.credit;

// Get date that user created account
exports.getDateCreated = (req, res) => {
  const userId = req.headers['user-id'];

  if (!userId) {
    return res.status(403).send({
      message: 'No userId provided!'
    });
  }

  Users.findOne({ where: { id: userId } })
    .then((result) => {
      const dateObj = new Date(result.dataValues.createdAt);
      res.json({ created: dateObj.toLocaleDateString('en-UK') });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// Get total credits that user has earned
exports.getCredits = (req, res) => {
  const userId = req.headers['user-id'];

  if (!userId) {
    return res.status(403).send({
      message: 'userId not present!'
    });
  }

  Credit.findAll({
    where: {
      userId
    }
  }).then((result) => res.json({ credits: result[0].dataValues.credits })).catch((err) => res.status(500).send({ message: err.message }));
};
