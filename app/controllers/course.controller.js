const db = require("../models"); 
const Courses = db.course;
const Course_Ratings = db.course_rating;
const User_Completed_Course = db.user_completed_course;

exports.getCourseRating = async (req, res) => { 
    let courseId = req.params.courseId; 

    const totalRatings = await Course_Ratings.count({ where: { courseId: courseId} }).then(count => count);
    const ratingTotal = await Course_Ratings.sum('rating', { where: { courseId: courseId} }).then(sum => sum);
    if (totalRatings == 0) return res.json({ rating: 0});
    const roundedAverage = Math.round((ratingTotal / totalRatings) * 2) / 2;
    return res.json({ rating: roundedAverage, totalRatings: totalRatings });
};

exports.getAllCourseRatings = async (req, res) => { 
    let ratings = [];

    await Courses.findAll().then(async (courses) => { 
        for (const course of courses) {
            const courseId = course.dataValues.id;
            const totalRatings = await Course_Ratings.count({ where: { courseId: courseId} }).then(count => count);
            const ratingTotal = await Course_Ratings.sum('rating', { where: { courseId: courseId} }).then(sum => sum);

            if (totalRatings == 0) { 
                ratings.push({ courseId: courseId, rating: 0, totalRatings: 0 });
                continue;
            };
            
            const roundedAverage = Math.round((ratingTotal / totalRatings) * 2) / 2;
            ratings.push({ courseId: courseId, rating: roundedAverage, totalRatings: totalRatings });
        };
        return res.json(ratings);
    }).catch((err) => { 
        return res.status(500).send({ message: err.message });
    });
};

exports.submitCourseRating = async (req, res) => { 
    let userId = req.headers["user-id"]; 
    let courseId = req.body.courseId; 
    let rating = req.body.rating;

    if(typeof userId === 'undefined' || typeof courseId === 'undefined' || typeof rating === 'undefined') { 
        return res.status(400).send({ message: "Ensure userId, courseId and rating are all set"});
    }

    await Course_Ratings.create({ 
        userId: userId, 
        courseId: courseId, 
        rating: rating
    }).then(() => { 
        return res.json({ success: true, rating: rating });
    }).catch(async (err) => { 
        if (err.name == "SequelizeUniqueConstraintError") { 
            const previousRating = await Course_Ratings.findOne({ 
                where: { 
                    courseId: courseId, 
                    userId: userId
                }
            }).then((res) => res);
            return res.json({ success: false, rating: previousRating.dataValues.rating })
        }
        return res.status(500).send({ message: err.message });
    });
}

exports.getAllCourseCompletions = async (req, res) => { 
    let userId = req.headers["user-id"]; 
    
    if(!userId) { 
        return res.status(403).send({ 
            message: "No userId provided!"
        });
    }

    let courseCompletions = [];
    await Courses.findAll().then(async (courses) => { 
        for(const course of courses) { 
            const courseId = course.dataValues.id; 

            const datecompleted = await User_Completed_Course.findAll({ where: { courseId, userId }, order: [['datecompleted', 'ASC']]})
            .then((res) => res);

            if (datecompleted[0]) { 
                courseCompletions.push({ courseId: courseId, completed: true, firstCompletionDate: datecompleted[0].dataValues.datecompleted });
            } else { 
                courseCompletions.push({ courseId: courseId, completed: false });
            }
        }
        return res.json(courseCompletions);
    }).catch((err) => { 
        return res.status(500).send({ message: err.message });
    });
}