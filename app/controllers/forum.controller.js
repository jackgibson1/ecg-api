/*
* Controller containing all logic for forum page
* creating question, deleting question, retrieve all question, get a single question
* creating comment, deleting comment, get all comments for a question
*/

const sequelize = require('sequelize');
const db = require('../models');

const Question = db.question;
const Comment = db.comment;
const QuestionUpvotes = db.question_upvotes;
const QuestionDownvotes = db.question_downvotes;

exports.createQuestion = async (req, res) => {
  const username = req.headers.username;
  const title = req.body.title;
  const description = req.body.description;

  if (!title || !description || !username) {
    return res.status(400).send({ success: false, message: 'Ensure username, title & description are all set.' });
  }

  await Question.create({
    title, description, username, date: Date.now()
  }).then((row) => {
    res.json({ success: true, questionId: row.dataValues.id });
  }).catch(() => {
    res.status(500).send({ success: false, message: 'Something has went wrong.' });
  });
};

exports.uploadImage = async (req, res) => {
  const questionId = req.body.questionId;
  const fileName = req.file.originalname;
  db.question_image_source.create({ questionId, imgsrc: `${questionId}-${fileName}` }).then(() => {
    res.status(200).send({ success: true });
  }).catch(() => {
    res.status(500).send({ success: false });
  });
};

exports.getImageName = async (req, res) => {
  const questionId = req.params.questionId;
  if (!questionId) {
    return res.status(400).send({ success: false, message: 'Ensure questionId is set in parameters.' });
  }

  db.question_image_source.findOne({ where: { questionId } }).then((row) => res.json({ imgName: row.dataValues.imgsrc }))
    .catch(() => res.status(400).send({ message: 'Question image does not exist' }));
};

exports.deleteQuestion = async (req, res) => {
  const username = req.headers.username;
  const questionId = req.params.questionId;

  if (!username || !questionId) {
    return res.status(400).send({ success: false, message: 'Ensure username & questionId are set.' });
  }

  // check to see if provided question was created by user
  // should only be able to delete a question if user created it (or is admin)
  const foundQuestion = await Question.findOne({ where: { id: questionId } }).then((row) => {
    if (row.dataValues.username !== username) return false;
    return true;
  }).catch(() => false);

  if (!foundQuestion) {
    return res.status(400).send({ success: false, message: 'The provided question does either not exist or you do not have permission to delete it.' });
  }

  // delete question
  await Question.destroy({ where: { id: questionId } }).then(() => {
    res.json({ success: true });
  }).catch(() => {
    res.status(500).send({ success: false, message: 'Unable to delete question.' });
  });
};

exports.getAllQuestions = async (req, res) => {
  const page = req.query.page || 1;
  const filter = req.query.filter || '';
  const order = [];

  if (filter === 'most-comments') {
    order.push([sequelize.literal('totalComments'), 'DESC']);
  }
  else if (filter === 'highest-votes') {
    order.push([sequelize.literal('totalVotes'), 'DESC']);
  }
  order.push(['date', 'DESC']);

  const numberPerPage = 10;
  const skip = (page - 1) * numberPerPage;

  await Question.findAndCountAll().then(async (totalQuestions) => {
    const numRows = totalQuestions.count;
    const numPages = Math.ceil(numRows / numberPerPage);

    await Question.findAll({
      limit: numberPerPage,
      offset: skip,
      attributes: [
        'id',
        'title',
        'description',
        'date',
        'username',
        [sequelize.literal('(SELECT COUNT(*) FROM comments WHERE questions.id = comments.questionId)'), 'totalComments'],
        [sequelize.literal('((SELECT COUNT(*) FROM question_upvotes WHERE questions.id = question_upvotes.questionId) - (SELECT COUNT(*) FROM question_downvotes WHERE questions.id = question_downvotes.questionId))'), 'totalVotes']
      ],
      order
    }).then(async (questions) => {
      res.json({ results: questions, numberOfPages: numPages, numberOfResults: numRows });
    });
  }).catch(() => {
    res.status(500).send({ message: 'Something has went wrong.' });
  });
};

exports.getQuestion = async (req, res) => {
  const questionId = req.params.questionId;

  if (!questionId) {
    return res.status(400).send({ message: 'Ensure questionId has been set.' });
  }

  await Question.findOne({ where: { id: questionId } }).then((row) => {
    if (row) return res.json(row);
    return res.status(400).send({ message: 'Provided question does not exist.' });
  }).catch(() => res.status(500).send({ message: 'Something has went wrong.' }));
};

exports.createComment = async (req, res) => {
  const username = req.headers.username;
  const questionId = req.body.questionId;
  const description = req.body.description;

  if (!username || !questionId || !description) {
    return res.status(400).send({ success: false, message: 'Please ensure username, questionId and description are all set.' });
  }

  Comment.create({
    description, date: Date.now(), questionId, username
  }).then(() => res.json({ success: true }))
    .catch((err) => res.status(400).send({ success: false, message: err.name }));
};

exports.deleteComment = async (req, res) => {
  const username = req.headers.username;
  const commentId = req.params.commentId;

  if (!username || !commentId) {
    return res.status(400).send({ success: false, message: 'Ensure username & commentId are set.' });
  }

  // check to see if provided comment was created by user
  // should only be able to delete a comment if user created it
  const foundComment = await Comment.findOne({ where: { id: commentId } }).then((row) => {
    if (row.dataValues.username !== username) return false;
    return true;
  }).catch(() => false);

  if (!foundComment) {
    return res.status(400).send({ success: false, message: 'The provided comment does either not exist or you do not have permission to delete it.' });
  }

  // delete question
  await Comment.destroy({ where: { id: commentId } }).then(() => {
    res.json({ success: true });
  }).catch(() => {
    res.status(500).send({ success: false, message: 'Unable to delete comment.' });
  });
};

exports.getComments = async (req, res) => {
  const questionId = req.params.questionId;

  if (!questionId) {
    return res.status(400).send({ message: 'Please ensure questionId is set in request parameters.' });
  }

  Comment.findAll({ where: { questionId } }).then((comments) => res.json(comments)).catch(() => {
    res.status(500).send({ message: 'Something has went wrong.' });
  });
};

exports.getVotes = async (req, res) => {
  const questionId = req.params.questionId;

  if (!questionId) {
    return res.status(400).send({ message: 'Please ensure questionId is set in request parameters.' });
  }

  const result = await db.sequelize.query(`SELECT (SELECT COUNT(*) FROM question_upvotes WHERE question_upvotes.questionId = ${questionId}) - (SELECT COUNT(*) FROM question_downvotes WHERE question_downvotes.questionId = ${questionId}) AS totalVotes`);
  res.json({ totalVotes: result[0][0].totalVotes });
};

exports.getHasUserVoted = async (req, res) => {
  const username = req.headers.username;
  const questionId = req.params.questionId;

  if (!username || !questionId) {
    return res.status(400).send({ success: false, message: 'Ensure username & questionId are set.' });
  }

  // check if user has downvoted question
  const qDownvotes = await QuestionDownvotes.findOne({ where: { username, questionId } })
    .then((downvote) => downvote)
    .catch(() => 'err');

  // check for error first, if downvote is found return votetype as downvote
  if (qDownvotes === 'err') return res.status(500).send({ message: 'Something has went wrong.' });
  if (qDownvotes !== null) {
    return res.json({ voted: true, voteType: 'downvote' });
  }

  // check if user has upvoted question
  const qUpvotes = await QuestionUpvotes.findOne({ where: { username, questionId } })
    .then((upvote) => upvote)
    .catch(() => 'err');

  // check for error first, if upvote is found return votetype as upvote
  if (qUpvotes === 'err') return res.status(500).send({ message: 'Something has went wrong.' });
  if (qUpvotes !== null) {
    return res.json({ voted: true, voteType: 'upvote' });
  }

  // if all checks pass user has not voted on this question yet
  return res.json({ voted: false });
};

// cast a vote (check if user has previously voted is done client side)
exports.castVote = async (req, res) => {
  const questionId = req.params.questionId;
  const username = req.headers.username;
  const vote = req.body.voteType;

  if (!username || !questionId || !vote) {
    return res.status(400).send({ success: false, message: 'Ensure username, questionId and vote type are all set.' });
  }

  if (vote === 'upvote') {
    QuestionUpvotes.create({ username, questionId }).then(() => {
      res.json({ success: true });
    }).catch(() => res.json({ success: false }));
  }
  if (vote === 'downvote') {
    QuestionDownvotes.create({ username, questionId }).then(() => {
      res.json({ success: true });
    }).catch(() => res.json({ success: false }));
  }
};
