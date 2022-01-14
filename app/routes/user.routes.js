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

    // can use this to view all posts
    app.get("/api/test/all", controller.allAccess); 

    // get credits for user
    app.get(
        "/api/credits", 
        [authJwt.verifyToken], 
        controller.userCredits
    ); 

    // update credits for user 
    app.post(
        "/api/credits/:courseId", 
        [authJwt.verifyToken], 
        controller.userUpdateCredits
    ); 

    // get all positions for all courses
    app.get(
        "/api/position/all", 
        [authJwt.verifyToken], 
        controller.userAllCoursePositions
    ); 

    // get position for provided courseId
    app.get(
        "/api/position/:courseId", 
        [authJwt.verifyToken], 
        controller.userCoursePosition
    ); 

    // update position for provided courseId
    app.put(
        "/api/position/:courseId", 
        [authJwt.verifyToken], 
        controller.userUpdateCoursePosition
    ); 

    // save completed course for provided courseId
    app.post(
        "/api/coursecomplete/:courseId", 
        [authJwt.verifyToken], 
        controller.userCompleteCourse
    ); 

    // 1. admin will be able to get all course positions for all users
    app.get( 
        "/api/test/admin", 
        [authJwt.verifyToken, authJwt.isAdmin], 
        controller.adminBoard
    );
};