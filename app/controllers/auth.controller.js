const db = require("../models");
const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var fetch = require ('node-fetch');
const { secret } = require("../config/auth.config");

const User = db.user;
const Role = db.role;
const User_Progress = db.user_progress;
const Course = db.course;
const Credit = db.credit;
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

            // create course positions and intialise to 0 for all courses
            Course.findAndCountAll().then(result => {
                result.rows.forEach((row) => {
                    User_Progress.create({
                        position: 0,
                        userId: user.id, 
                        courseId: row.dataValues.id
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
        .then(user => {
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
                expiresIn: 86400 // 24 hours
            });

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
                    accessToken: token
                });
            });
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
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

