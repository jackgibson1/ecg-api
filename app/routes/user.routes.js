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

    // 1. admin will be able to get all course positions for all users
    app.get( 
        "/api/test/admin", 
        [authJwt.verifyToken, authJwt.isAdmin], 
        controller.adminBoard
    );
};