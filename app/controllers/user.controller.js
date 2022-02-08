const db = require("../models");
const User_Progress = db.user_progress;
const User_Completed_Course = db.user_completed_course;
const Credit = db.credit;


exports.allAccess = (req, res) => { 
    res.status(200).send("Public content.");
};

exports.adminBoard = (req, res) => { 
    res.status(200).send("Admin Content.");
};

exports.getAllCoursePositions = (req, res) => { 
    let userId = req.headers["user-id"]; 
    
    if(!userId) { 
        return res.status(403).send({ 
            message: "No userId provided!"
        });
    }
    
    User_Progress.findAll({
        where: { 
            userId: userId
        }
    }).then(results => { 
        let allCourseProgresses = []; 
        results.forEach((row) => { 
            allCourseProgresses.push( { courseId: row.courseId, position: row.position }); 
        });
        return res.json(allCourseProgresses);
    }).catch((err) => { 
        return res.status(500).send({ message: err.message });
    });
};

exports.getCoursePosition = (req, res) => { 
    let userId = req.headers["user-id"]; 
    let courseId = req.params.courseId; 
    
    if(!userId || !courseId) { 
        return res.status(403).send({ 
            message: "userId or courseId not present!"
        });
    }

    User_Progress.findAll({
        where: { 
            userId: userId, 
            courseId: courseId
        }
    }).then(result => { 
        return res.json({ position: result[0].dataValues.position });
    }).catch((err) => { 
        return res.status(500).send({ message: err.message });
    });
}

exports.updateCoursePosition = (req, res) => { 
    let userId = req.headers["user-id"]; 
    let courseId = req.params.courseId; 

    let updatedPosition = req.body.updatedPosition;
    
    if(!userId) { 
        return res.status(403).send({ 
            message: "userId not present in the headers!"
        });
    } else if (!courseId) { 
        return res.status(403).send({ 
            message: "courseId not present parameters!"
        });
    } else if (typeof updatedPosition == 'undefined') { 
        return res.status(403).send({ 
            message: "updated position not present in the request body!"
        });
    }

    User_Progress.update(
        { position: updatedPosition },
        { where: { 
            userId: userId, 
            courseId: courseId
          }
        }
    ).then(() => { 
        return res.json({ updatedPosition: updatedPosition });
    }).catch((err) => { 
        return res.status(500).send({ message: err.message });
    });
};

exports.completeCourse = async (req, res) => { 
    let userId = req.headers["user-id"];
    let courseId = req.params.courseId; 

    console.log("USER ID!!" + userId); 
    console.log(courseId);

    if(!userId) { 
        return res.status(403).send({ 
            message: "userId not present in the headers!"
        });
    } else if (!courseId) { 
        return res.status(403).send({ 
            message: "courseId not present parameters!"
        });
    };

    const createdCourse = await User_Completed_Course.create({ 
        userId: userId, 
        courseId: courseId, 
        datecompleted: new Date().toISOString().split('T')[0]
    }).then(() => { 
        return { error: false };
    }).catch((err) => { 
        return { error: true, message: err.message };
    });
    if (createdCourse.error) return res.status(500).send({ message: createdCourse.message });

    const completedCourses = await User_Completed_Course.findAll({ 
        where: { 
            userId: userId, 
            courseId, courseId
        }
    }).then((result) => { 
        return result;
    }).catch((err) => { 
        return false;;
    }); 
    if (!completedCourses) return res.status(500).send({ message: "Something has went wrong!" });

    if (completedCourses.length > 1 || completedCourses.length == 0) { 
        if (completedCourses.length == 0) { 
            return res.status(500).send({ message: 'User has not completed the course fully yet.' });
        } 
        return res.json({ message: 'Successfully completed the course!', creditEarned: false });
    }; 

    Credit.increment('credits', { by: 1, where: { userId: userId }}).then(() => { 
        return res.json({ message: "Successfuly completed the course and earned a credit!", creditEarned: true });
    });
};

exports.getCredits = (req, res) => { 
    let userId = req.headers["user-id"]; 
    
    if(!userId) { 
        return res.status(403).send({ 
            message: "userId not present!"
        });
    }

    Credit.findAll({
        where: { 
            userId: userId, 
        }
    }).then(result => { 
        return res.json({ credits: result[0].dataValues.credits });
    }).catch((err) => { 
        return res.status(500).send({ message: err.message });
    });
};