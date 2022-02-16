const db = require("../models");
const Users = db.user;
const Credit = db.credit;

// Get date that user created account
exports.getDateCreated = (req, res) => { 
    let userId = req.headers["user-id"]; 
    
    if(!userId) { 
        return res.status(403).send({ 
            message: "No userId provided!"
        });
    }

    Users.findOne({ where: { id: userId }})
    .then((result) => { 
        let dateObj = new Date(result.dataValues.createdAt);
        res.json({ created: dateObj.toLocaleDateString('en-UK') });
    })
    .catch((err) => { 
        res.status(500).send({ message: err.message });
    })   
}

// Get total credits that user has earned
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