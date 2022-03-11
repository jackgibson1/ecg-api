/*
* Controller containing all logic for forum page
* creating post, deleting post, retrieve all posts, get a single post
* creating comment, deleting comment, get all comments for a post
*/

const { post } = require('fetch-mock');
const db = require('../models');

const Post = db.post;
const Comment = db.comment;
const User = db.user;

exports.createPost = async (req, res) => {
  const username = req.headers.username;
  const title = req.body.title;
  const description = req.body.description;

  if (!title || !description || !username) {
    return res.status(400).send({ success: false, message: 'Ensure username, title & description are all set.' });
  }

  await Post.create({
    title, description, username, date: Date.now()
  }).then(() => {
    res.json({ success: true });
  }).catch(() => {
    res.status(500).send({ success: false, message: 'Something has went wrong.' });
  });
};

exports.deletePost = async (req, res) => {
  const username = req.headers.username;
  const postId = req.params.postId;

  if (!username || !postId) {
    return res.status(400).send({ success: false, message: 'Ensure username & postId are set.' });
  }

  // check to see if provided post was created by user
  // should only be able to delete a post if user created it
  const foundPost = await Post.findOne({ where: { id: postId } }).then((row) => {
    if (row.dataValues.username !== username) return false;
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
  await Post.findAll().then(async (resp) => {
    // iterate through posts to get username and total comments for each
    const postsWithComments = await resp.map(async (pst) => {
      // get total comments made on each post
      const totalComments = await pst.getComments().then((commentRows) => commentRows);
      // object one to merge
      const objectOne = {
        id: pst.dataValues.id, title: pst.dataValues.title, description: pst.dataValues.description, date: pst.dataValues.date, username: pst.dataValues.username
      };
      // merge object one with result from totalComments & usrname using spread operator
      return { ...objectOne, ...{ totalComments: totalComments.length } };
    });
    // ensure all promises resolve before sending response back
    const posts = await Promise.all(postsWithComments);
    res.json(posts);
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
  const username = req.headers.username;
  const postId = req.body.postId;
  const description = req.body.description;

  if (!username || !postId || !description) {
    return res.status(400).send({ success: false, message: 'Please ensure username, postId and description are all set.' });
  }

  Comment.create({
    description, date: Date.now(), postId, username
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

  // delete post
  await Comment.destroy({ where: { id: commentId } }).then(() => {
    res.json({ success: true });
  }).catch(() => {
    res.status(500).send({ success: false, message: 'Unable to delete comment.' });
  });
};

exports.getComments = async (req, res) => {
  const postId = req.params.postId;

  if (!postId) {
    return res.status(400).send({ message: 'Please ensure postId is set in request parameters.' });
  }

  Comment.findAll({ where: { postId } }).then((comments) => res.json(comments)).catch(() => {
    res.status(500).send({ message: 'Something has went wrong.' });
  });
};
