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

    // get rating for respective course
    app.get(
        "/api/course/rating/:courseId", 
        [authJwt.verifyToken], 
        controller.getCourseRating
    );

    // get rating for all courses
    app.get( 
        "/api/course/ratings/all", 
        [authJwt.verifyToken], 
        controller.getAllCourseRatings
    ); 

    // submit rating for respective course
    app.post( 
        "/api/course/rating/submit", 
        [authJwt.verifyToken], 
        controller.submitCourseRating
    );

    // get position for provided courseId
    app.get(
        "/api/course/position/:courseId", 
        [authJwt.verifyToken], 
        controller.getCoursePosition
    ); 

    // update position for provided courseId
    app.put(
        "/api/course/position/:courseId", 
        [authJwt.verifyToken], 
        controller.updateCoursePosition
    ); 

    // get all positions for all courses
    app.get(
        "/api/course/positions/all", 
        [authJwt.verifyToken], 
        controller.getAllCoursePositions
    ); 

    // save completed course for provided courseId (and award credit if first completion)
    app.post(
        "/api/course/complete/:courseId", 
        [authJwt.verifyToken], 
        controller.completeCourse
    );   
    
    // get all courses and their completion status
    app.get( 
        "/api/course/completions/all", 
        [authJwt.verifyToken], 
        controller.getAllCourseCompletions
    );

};