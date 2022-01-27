const db = require("../models"); 
const Courses = db.course;
const Course_Ratings = db.course_rating;

exports.getCourseRating = async (req, res) => { 
    let courseId = req.params.courseId; 

    const totalRatings = await Course_Ratings.count({ where: { courseId: courseId} }).then(count => count);
    const ratingTotal = await Course_Ratings.sum('rating', { where: { courseId: courseId} }).then(sum => sum);
    if (totalRatings == 0) return res.json({ rating: 0});
    const roundedAverage = Math.round((ratingTotal / totalRatings) * 2) / 2;
    return res.json({ rating: roundedAverage });
};

exports.getAllCourseRatings = async (req, res) => { 
    let ratings = [];

    await Courses.findAll().then(async (courses) => { 
        for (const course of courses) {
            const courseId = course.dataValues.id;
            const totalRatings = await Course_Ratings.count({ where: { courseId: courseId} }).then(count => count);
            const ratingTotal = await Course_Ratings.sum('rating', { where: { courseId: courseId} }).then(sum => sum);

            if (totalRatings == 0) { 
                ratings.push({ courseId: courseId, rating: 0});
                continue;
            };
            
            const roundedAverage = Math.round((ratingTotal / totalRatings) * 2) / 2;
            ratings.push({ courseId: courseId, rating: roundedAverage});
        };
        return res.json(ratings);
    }).catch((err) => { 
        return res.status(500).send({ message: err.message });
    });
};