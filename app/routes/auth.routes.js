const { verifySignup } = require("../middleware"); 
const controller = require("../controllers/auth.controller");

module.exports = function(app) { 
    app.use(function(res, res, next) { 
        res.header( 
            "Access-Control-Allow-Headers", 
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post( 
        "/api/auth/signup", 
        [ 
            verifySignup.checkDuplicateUsernameOrEmail, 
            verifySignup.checkRolesExisted
        ],
        controller.signup
    ); 

    app.post("/api/auth/signin", controller.signin);
    app.post("/api/auth/verifycaptcha", controller.verifyCaptcha);
};