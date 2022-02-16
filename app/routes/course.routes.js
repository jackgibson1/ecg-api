const { authJwt } = require("../middleware");
const controller = require("../controllers/course.controller"); 

module.exports = function(app) { 
    app.use(function(req, res, next) { 
        res.header( 
            "Access-Control-Allow-Headers", 
            "x-access-token, Origin, Content-Type, Accept"
        ); 
        next();
    }); 

    app.get(
        "/api/ratings/:courseId", 
        [authJwt.verifyToken], 
        controller.getCourseRating
    );

    app.get( 
        "/api/ratings", 
        [authJwt.verifyToken], 
        controller.getAllCourseRatings
    ); 

    app.post( 
        "/api/ratings/submit", 
        [authJwt.verifyToken], 
        controller.submitCourseRating
    );

    app.get( 
        "/api/allcoursecompletions", 
        [authJwt.verifyToken], 
        controller.getAllCourseCompletions
    );

    // get position for provided courseId
    app.get(
        "/api/course/position/:courseId", 
        [authJwt.verifyToken], 
        controller.getCoursePosition
    ); 

    // get all positions for all courses
    app.get(
        "/api/course/positions/all", 
        [authJwt.verifyToken], 
        controller.getAllCoursePositions
    ); 

    // update position for provided courseId
    app.put(
        "/api/course/position/:courseId", 
        [authJwt.verifyToken], 
        controller.updateCoursePosition
    ); 

    // save completed course for provided courseId (and award credit if first completion)
    app.post(
        "/api/course/complete/:courseId", 
        [authJwt.verifyToken], 
        controller.completeCourse
    ); 
    
};