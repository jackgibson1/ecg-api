const jwt = require("jsonwebtoken"); 
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;

verifyToken = (req, res, next) => { 
    let token = req.headers["x-access-token"]; 

    if(!token) { 
        return res.status(403).send({ 
            message: "No token provided!"
        });
    }

    jwt.verify(token, config.secret, (err, decoded) => {  
        if (err) { 
            return res.status(401).send({ 
                message: "Unauthorised"
            });
        }
        req.userId = decoded.id; 
        next();
    });
};

isAdmin = (req, res, next) => { 
    let adminId = req.headers["admin-user-id"]; 

    if (!adminId) { 
        return res.status(403).send({ message: "Admin user ID is not set within header!"});
    }

    User.findByPk(adminId).then(user => { 
        user.getRoles().then(roles => { 
            for(let i=0; i<roles.length; i++) { 
                if(roles[i].name === "admin") { 
                    next(); 
                    return;
                }
            }

            res.status(403).send({ 
                message: "Require Admin Role!"
            }); 
            return; 
        });
    });
};

const authJwt = { 
    verifyToken: verifyToken, 
    isAdmin: isAdmin
}; 
module.exports = authJwt;


