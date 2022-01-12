const db = require("../models");
const User_Progress = db.user_progress;

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
    } else if (!updatedPosition) { 
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

}