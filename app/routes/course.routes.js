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
};