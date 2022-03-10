/*
* Controller containing all logic for forum page
* creating post, deleting post, retrieve all posts, get a single post
* creating comment, deleting comment, get all comments for a post
*/

const db = require('../models');

const Post = db.post;

exports.createPost = async (req, res) => {
  const userId = req.headers['user-id'];
  const title = req.body.title;
  const description = req.body.description;

  if (!title || !description || !userId) {
    return res.status(400).send({ success: false, message: 'Ensure userid, title & description are all set.' });
  }

  Post.create({
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
  Post.destroy({ where: { id: postId } }).then(() => {
    res.json({ success: true });
  }).catch(() => {
    res.status(400).send({ success: false, message: 'Unable to delete post.' });
  });
};
