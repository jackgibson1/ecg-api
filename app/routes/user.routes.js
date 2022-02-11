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

    // get date user created account 
    app.get(
        "/api/datecreated", 
        [authJwt.verifyToken], 
        controller.getDateCreated
    ); 


    // get credits for user
    app.get(
        "/api/credits", 
        [authJwt.verifyToken], 
        controller.getCredits
    ); 

    // get all positions for all courses
    app.get(
        "/api/position/all", 
        [authJwt.verifyToken], 
        controller.getAllCoursePositions
    ); 

    // get position for provided courseId
    app.get(
        "/api/position/:courseId", 
        [authJwt.verifyToken], 
        controller.getCoursePosition
    ); 

    // update position for provided courseId
    app.put(
        "/api/position/:courseId", 
        [authJwt.verifyToken], 
        controller.updateCoursePosition
    ); 

    // save completed course for provided courseId (and award credit if first completion)
    app.post(
        "/api/coursecomplete/:courseId", 
        [authJwt.verifyToken], 
        controller.completeCourse
    ); 

    // 1. admin will be able to get all course positions for all users
    app.get( 
        "/api/test/admin", 
        [authJwt.verifyToken, authJwt.isAdmin], 
        controller.adminBoard
    );
};