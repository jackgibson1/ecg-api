/* 
 * Controller for authentication logic
 * signup, signin and verifying google captcha 
*/

const db = require("../models");
const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var fetch = require ('node-fetch');

const User = db.user;
const Role = db.role;
const RefreshToken = db.refreshToken;
const User_Progress = db.user_progress;
const Course = db.course;
const Quiz = db.quiz;
const Credit = db.credit;
const User_Quiz_Scores = db.user_quiz_scores;
const Op = db.Sequelize.Op;

exports.signup = (req, res) => {
    // Save User to Database 
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8)
    })
        .then(user => {
            if (req.body.roles) {
                Role.findAll({
                    where: {
                        name: {
                            [Op.or]: req.body.roles
                        }
                    }
                }).then(roles => {
                    user.setRoles(roles).then(() => {
                        res.send({ message: "User was registered successfully!" });
                    });
                });
            } else {
                // user role = 1 
                user.setRoles([1]).then(() => {
                    res.send({ message: "User was registered successfully" });
                });
            }

            // Create course positions and intialise to 0 for all courses
            Course.findAndCountAll().then(result => {
                result.rows.forEach((row) => {
                    User_Progress.create({
                        position: 0,
                        userId: user.id, 
                        courseId: row.dataValues.id
                    });
                })
            });

            // Initialise all users quiz scores to -1
            Quiz.findAndCountAll().then(result => {
                result.rows.forEach((row) => {
                    User_Quiz_Scores.create({
                        bestScore: -1,
                        userId: user.id, 
                        quizId: row.dataValues.id
                    });
                })
            });

            // create user credits and intialise to 0
            Credit.create({ 
                userId: user.id, 
                credits: 0
            });
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};

exports.signin = (req, res) => {
    // Find user in database
    User.findOne({
        where: {
            username: req.body.username
        }
    })
        .then(async (user) => {
            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }

            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
            }

            var token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: config.jwtExpiration
            });

            let refreshToken = await RefreshToken.createToken(user);

            var authorities = [];
            user.getRoles().then(roles => {
                for (let i = 0; i < roles.length; i++) {
                    authorities.push("ROLE_" + roles[i].name.toUpperCase());
                }
                res.status(200).send({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    roles: authorities,
                    accessToken: token, 
                    refreshToken: refreshToken,
                });
            });
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};

exports.refreshToken = async (req, res) => {
    // get Refresh token form request data
    const { refreshToken: requestToken } = req.body;
    if (requestToken == null) {
      return res.status(403).json({ message: "Refresh Token is required!" });
    }
    try {
        // get Refresh token object { id, user, token, expiryDate }
      let refreshToken = await RefreshToken.findOne({ where: { token: requestToken } });
      console.log(refreshToken)
      if (!refreshToken) {
        res.status(403).json({ message: "Refresh token is not in database!" });
        return;
      }
      // if refresh token has expired remove it from the database and return message
      if (RefreshToken.verifyExpiration(refreshToken)) {
        RefreshToken.destroy({ where: { id: refreshToken.id } });
        
        res.status(403).json({
          message: "Refresh token was expired. Please make a new signin request",
        });
        return;
      }
      const user = await refreshToken.getUser();
      // use user id field to generate new Access Token using jwt library
      let newAccessToken = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: config.jwtExpiration,
      });
      return res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: refreshToken.token,
      });
    } catch (err) {
      return res.status(500).send({ message: err });
    }
  };

exports.verifyCaptcha = async (req, res) => { 
    // secret key for communication between this server and reCAPTCHA
    const secretKey = "6Ld6P00eAAAAAKMB6zYlO1kchNw1X_ROUuefv4tW";
    // response token generated from react app
    const responseToken = req.body.responseToken;

    if (!responseToken) { 
        return res.status(404).send({message: "Ensure secret and response keys are both set."})
    }; 

    // Validate is Human
    const isHuman = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
        method: "post",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
        },
        body: `secret=${secretKey}&response=${responseToken}`
    })
    .then(res => res.json())
    .then(json => json.success)
    .catch(err => {
        throw new Error(`Error in Google Siteverify API. ${err.message}`)
    });

    res.json(isHuman);
}

