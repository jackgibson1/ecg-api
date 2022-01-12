const db = require("../models");
const User_Progress = db.user_progress;

exports.allAccess = (req, res) => { 
    res.status(200).send("Public content.");
};

exports.userBoard = (req, res) => { 
    res.status(200).send("User content.");
};

exports.adminBoard = (req, res) => { 
    res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => { 
    res.status(200).send("Moderator Content.");
};

exports.userAllCourseProgress = (req, res) => { 
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