/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/*
 * Controller for all course related logic
 * Course ratings, course positions and course completions
 * Users earn credits for first time completion of any course
*/
const db = require('../models');

const Courses = db.course;
const CourseRatings = db.course_rating;
const UserCompletedCourse = db.user_completed_course;
const UserProgress = db.user_progress;
const Credit = db.credit;

// Get average user rating of course
// Used within each course card
exports.getCourseRating = async (req, res) => {
  const courseId = req.params.courseId;
  const totalRatings = await CourseRatings.count({ where: { courseId } }).then((count) => count);
  const ratingTotal = await CourseRatings.sum('rating', { where: { courseId } }).then((sum) => sum);
  if (totalRatings === 0) return res.json({ rating: 0 });
  const roundedAverage = Math.round((ratingTotal / totalRatings) * 2) / 2;
  // return object contains rounded average and total number of ratings
  return res.json({ rating: roundedAverage, totalRatings });
};

// Get average user rating of all courses
// Used on all courses page to display ratings on each card
exports.getAllCourseRatings = async (req, res) => {
  const ratings = [];

  await Courses.findAll().then(async (courses) => {
    for (const course of courses) {
      const courseId = course.dataValues.id;
      const totalRatings = await CourseRatings.count({ where: { courseId } }).then((count) => count);
      const ratingTotal = await CourseRatings.sum('rating', { where: { courseId } }).then((sum) => sum);

      // ensure no division by 0
      if (totalRatings === 0) {
        ratings.push({ courseId, rating: 0, totalRatings: 0 });
        // eslint-disable-next-line no-continue
        continue;
      }
      const roundedAverage = Math.round((ratingTotal / totalRatings) * 2) / 2;
      ratings.push({ courseId, rating: roundedAverage, totalRatings });
    }
    // returns an array containing { courseId, rating, total ratings } for each course
    return res.json(ratings);
  }).catch((err) => res.status(500).send({ message: err.message }));
};

// Enable user to submit a course rating
// This is used within course completed section of each course
exports.submitCourseRating = async (req, res) => {
  const userId = req.headers['user-id'];
  const courseId = req.body.courseId;
  const rating = req.body.rating;

  // ensure all required variables have been appropriately set
  if (typeof userId === 'undefined' || typeof courseId === 'undefined' || typeof rating === 'undefined') {
    return res.status(400).send({ message: 'Ensure userId, courseId and rating are all set' });
  }

  await CourseRatings.create({
    userId,
    courseId,
    rating
  }).then(() =>
  // return object contains a sucess attribute
  // this is used to inform user if they have already submitted a rating
    res.json({ success: true, rating })).catch(async (err) => {
    if (err.name === 'SequelizeUniqueConstraintError') {
    // error is caught if user has already submitted a rating for said course
    // my implementation only allows for one user rating per course
      const previousRating = await CourseRatings.findOne({
        where: {
          courseId,
          userId
        }
      }).then((resp) => resp);
        // set success to false - this ensures that credit won't be awardeed again
      return res.json({ success: false, rating: previousRating.dataValues.rating });
    }
    // catch all other errors
    return res.status(500).send({ message: err.message });
  });
};

// Return course relative position for a user
exports.getCoursePosition = (req, res) => {
  const userId = req.headers['user-id'];
  const courseId = req.params.courseId;

  if (!userId || !courseId) {
    return res.status(403).send({
      message: 'userId or courseId not present!'
    });
  }

  UserProgress.findAll({
    where: {
      userId,
      courseId
    }
  }).then((result) => res.json({ position: result[0].dataValues.position })).catch((err) => res.status(500).send({ message: err.message }));
};

// Update course position for a user
// This is used when navigating through a course to ensure user can return to same course position
exports.updateCoursePosition = (req, res) => {
  const userId = req.headers['user-id'];
  const courseId = req.params.courseId;
  const updatedPosition = req.body.updatedPosition;

  // ensure all required variables have been set
  if (!userId) {
    return res.status(403).send({
      message: 'userId not present in the headers!'
    });
  } if (!courseId) {
    return res.status(403).send({
      message: 'courseId not present parameters!'
    });
  } if (typeof updatedPosition === 'undefined') {
    return res.status(403).send({
      message: 'updated position not present in the request body!'
    });
  }

  UserProgress.update(
    { position: updatedPosition },
    {
      where: {
        userId,
        courseId
      }
    }
  ).then(() => res.json({ updatedPosition })).catch((err) => res.status(500).send({ message: err.message }));
};

// Get a list of all courses and the users respective position on that course
// This allows us to calculate how much a user is through a course
exports.getAllCoursePositions = (req, res) => {
  const userId = req.headers['user-id'];

  if (!userId) {
    return res.status(403).send({
      message: 'No userId provided!'
    });
  }

  UserProgress.findAll({
    where: {
      userId
    }
  }).then((results) => {
    const allCourseProgresses = [];
    results.forEach((row) => {
      allCourseProgresses.push({ courseId: row.courseId, position: row.position });
    });
    return res.json(allCourseProgresses);
  }).catch((err) => res.status(500).send({ message: err.message }));
};

// Complete course functionality to save completed course to respective table
// My implementation can save unlimited completions for each course
// However user can only earn credit for first time completion of a course
exports.completeCourse = async (req, res) => {
  const userId = req.headers['user-id'];
  const courseId = req.params.courseId;

  if (!userId) {
    return res.status(403).send({
      message: 'userId not present in the headers!'
    });
  } if (!courseId) {
    return res.status(403).send({
      message: 'courseId not present parameters!'
    });
  }

  // save completion to respective table
  const createdCourse = await UserCompletedCourse.create({
    userId,
    courseId,
    datecompleted: new Date().toISOString().split('T')[0]
  }).then(() => ({ error: false })).catch((err) => ({ error: true, message: err.message }));
  if (createdCourse.error) return res.status(500).send({ message: createdCourse.message });

  const completedCourses = await UserCompletedCourse.findAll({
    where: {
      userId,
      courseId
    }
  }).then((result) => result).catch(() => false);
  if (!completedCourses) return res.status(500).send({ message: 'Something has went wrong!' });

  // if this course and user already exists within completed course table credit not earned
  if (completedCourses.length > 1 || completedCourses.length === 0) {
    if (completedCourses.length === 0) {
      return res.status(500).send({ message: 'User has not completed the course fully yet.' });
    }
    return res.json({ message: 'Successfully completed the course!', creditEarned: false });
  }

  // if first time completion of course increment credits by 1
  Credit.increment('credits', { by: 1, where: { userId } }).then(() => res.json({ message: 'Successfuly completed the course and earned a credit!', creditEarned: true }));
};

// Get a list of all courses and whether they have been completed or not for a user
exports.getAllCourseCompletions = async (req, res) => {
  const userId = req.headers['user-id'];

  if (!userId) {
    return res.status(403).send({
      message: 'No userId provided!'
    });
  }

  const courseCompletions = [];
  await Courses.findAll().then(async (courses) => {
    for (const course of courses) {
      const courseId = course.dataValues.id;

      // note that the order is ascending by date - this allows us to get the earliest completion first
      const datecompleted = await UserCompletedCourse.findAll({ where: { courseId, userId }, order: [['datecompleted', 'ASC']] })
        .then((resp) => resp);

      // the earliest completion
      if (datecompleted[0]) {
        // if completed object should contain completion date
        courseCompletions.push({ courseId, completed: true, firstCompletionDate: datecompleted[0].dataValues.datecompleted });
      }
      else {
        courseCompletions.push({ courseId, completed: false });
      }
    }
    return res.json(courseCompletions);
  }).catch((err) => res.status(500).send({ message: err.message }));
};
