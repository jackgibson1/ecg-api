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

exports.userAllCoursePositions = (req, res) => { 
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

exports.userCoursePosition = (req, res) => { 
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

exports.userUpdateCoursePosition = (req, res) => { 
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

// save course completion in user completed course
exports.userCompleteCourse = (req, res) => { 
    let userId = req.headers["user-id"];
    let courseId = req.params.courseId; 

    if(!userId) { 
        return res.status(403).send({ 
            message: "userId not present in the headers!"
        });
    } else if (!courseId) { 
        return res.status(403).send({ 
            message: "courseId not present parameters!"
        });
    };

    User_Completed_Course.create({ 
        userId: userId, 
        courseId: courseId, 
        datecompleted: new Date().toJSON().slice(0, 19).replace('T', ' ')
    }).then(() => { 
        return res.json({ message: 'Completed course successfully saved.'});
    }).catch((err) => { 
        return res.status(500).send({ message: err.message });
    });
};

exports.userCredits = (req, res) => { 
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

// only credited credit if course not already completed
/* 
* user first completes course
* then claims credit (at this stage completed course table will contain record of completion)
*/
exports.userUpdateCredits = async (req, res) => { 
    let userId = req.headers["user-id"]; 
    let courseId = req.params.courseId; 
    
    if(!userId) { 
        return res.status(403).send({ 
            message: "userId not present in the headers!"
        });
    } else if (!courseId) { 
        return res.status(403).send({ 
            message: "courseId not present parameters!"
        });
    };

    const completedCourses = await User_Completed_Course.findAll({ 
        where: { 
            userId: userId, 
            courseId, courseId
        }
    }).then((result) => { 
        return result;
    }).catch((err) => { 
        return res.status(500).send({ message: err.message });
    }); 

    console.log(completedCourses);
    if (completedCourses.length > 1 || completedCourses.length == 0) { 
        if (completedCourses.length == 0) { 
            return res.status(500).send({ message: 'User has not complete the course fully yet.' });
        } 
        return res.status(500).send({ message: 'User has already completed course and earned credit!' });
    }; 

    Credit.increment('credits', { by: 1, where: { userId: userId }}).then(() => { 
        return res.json({ message: "Successfuly incremented credits by 1."});
    });
};