const { authJwt } = require("../middleware");
const controller = require("../controllers/admin.controller"); 

module.exports = function(app) { 
    app.use(function(req, res, next) { 
        res.header( 
            "Access-Control-Allow-Headers", 
            "x-access-token, Origin, Content-Type, Accept"
        ); 
        next();
    }); 

    // get all users 
    app.get(
        "/api/admin/all-users", 
        [authJwt.isAdmin, authJwt.verifyToken], 
        controller.getAllUsers      
    );

    // get courses for each user 

    // get quizzes for each user 

    // delete user 

    // reset all stats for user 

    // delete post 

    // delete comment

};






