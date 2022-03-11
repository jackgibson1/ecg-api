/*
* Controller containing all logic for forum page
* creating post, deleting post, retrieve all posts, get a single post
* creating comment, deleting comment, get all comments for a post
*/

const db = require('../models');

const Post = db.post;
const Comment = db.comment;

exports.createPost = async (req, res) => {
  const userId = req.headers['user-id'];
  const title = req.body.title;
  const description = req.body.description;

  if (!title || !description || !userId) {
    return res.status(400).send({ success: false, message: 'Ensure userid, title & description are all set.' });
  }

  await Post.create({
    title, description, userId, date: Date.now()
  }).then(() => {
    res.json({ success: true });
  }).catch(() => {
    res.status(500).send({ success: false, message: 'Something has went wrong.' });
  });
};

exports.deletePost = async (req, res) => {
  const userId = req.headers['user-id'];
  const postId = req.params.postId;

  if (!userId || !postId) {
    return res.status(400).send({ success: false, message: 'Ensure userid & postId are set.' });
  }

  // check to see if provided post was created by user
  // should only be able to delete a post if user created it
  const foundPost = await Post.findOne({ where: { id: postId } }).then((row) => {
    if (row.dataValues.userId !== Number(userId)) return false;
    return true;
  }).catch(() => false);

  if (!foundPost) {
    return res.status(400).send({ success: false, message: 'The provided post does either not exist or you do not have permission to delete it.' });
  }

  // delete post
  await Post.destroy({ where: { id: postId } }).then(() => {
    res.json({ success: true });
  }).catch(() => {
    res.status(500).send({ success: false, message: 'Unable to delete post.' });
  });
};

exports.getAllPosts = async (req, res) => {
  await Post.findAll().then((resp) => {
    res.json(resp);
  }).catch(() => {
    res.status(500).send({ message: 'Something has went wrong.' });
  });
};

exports.getPost = async (req, res) => {
  const postId = req.params.postId;

  if (!postId) {
    return res.status(400).send({ message: 'Ensure postId has been set.' });
  }

  await Post.findOne({ where: { id: postId } }).then((row) => {
    if (row) return res.json(row);
    return res.status(400).send({ message: 'Provided post does not exist.' });
  }).catch(() => res.status(500).send({ message: 'Something has went wrong.' }));
};

exports.createComment = async (req, res) => {
  const userId = req.headers['user-id'];
  const postId = req.body.postId;
  const description = req.body.description;

  if (!userId || !postId || !description) {
    return res.status(400).send({ success: false, message: 'Please ensure userId, postId and description are all set.' });
  }

  Comment.create({
    description, date: Date.now(), postId, userId
  }).then(() => res.json({ success: true }))
    .catch((err) => res.status(400).send({ success: false, message: err.name }));
};

exports.deleteComment = async (req, res) => {
  const userId = req.headers['user-id'];
  const commentId = req.params.commentId;

  if (!userId || !commentId) {
    return res.status(400).send({ success: false, message: 'Ensure userid & commentId are set.' });
  }

  // check to see if provided comment was created by user
  // should only be able to delete a comment if user created it
  const foundComment = await Comment.findOne({ where: { id: commentId } }).then((row) => {
    if (row.dataValues.userId !== Number(userId)) return false;
    return true;
  }).catch(() => false);

  if (!foundComment) {
    return res.status(400).send({ success: false, message: 'The provided comment does either not exist or you do not have permission to delete it.' });
  }

  // delete post
  await Comment.destroy({ where: { id: commentId } }).then(() => {
    res.json({ success: true });
  }).catch(() => {
    res.status(500).send({ success: false, message: 'Unable to delete comment.' });
  });
};
