const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller"); 

module.exports = function(app) { 
    app.use(function(req, res, next) { 
        res.header( 
            "Access-Control-Allow-Headers", 
            "x-access-token, Origin, Content-Type, Accept"
        ); 
        next();
    }); 

    app.get("/api/test/all", controller.allAccess); 
    
    // define normal user function here
    app.get(
        "/api/test/user", 
        [authJwt.verifyToken], 
        controller.userBoard   
    ); 

    // get all positions for all courses
    app.get(
        "/api/test/user/position/all", 
        [authJwt.verifyToken], 
        controller.userAllCourseProgress
    ); 

    // get position for given course
    app.get(
        "/api/test/user/position/:courseId", 
        [authJwt.verifyToken], 
        controller.userAllCourseProgress
    ); 

    app.get( 
        "/api/test/mod", 
        [authJwt.verifyToken, authJwt.isModerator], 
        controller.moderatorBoard
    ); 

    app.get( 
        "/api/test/admin", 
        [authJwt.verifyToken, authJwt.isAdmin], 
        controller.adminBoard
        // include controller function to get all
    );
};