const { authJwt } = require("../middleware");
const controller = require("../controllers/quiz.controller"); 

module.exports = function(app) { 
    app.use(function(req, res, next) { 
        res.header( 
            "Access-Control-Allow-Headers", 
            "x-access-token, Origin, Content-Type, Accept"
        ); 
        next();
    }); 

    app.get(
        "/api/quizscores/:quizId", 
        [authJwt.verifyToken], 
        controller.getQuizScore
    );

    app.get(
        "/api/allquizscores", 
        [authJwt.verifyToken], 
        controller.getAllQuizScores
    );

    app.put(
        "/api/quizscores", 
        [authJwt.verifyToken], 
        controller.updateCourseRating
    );
};