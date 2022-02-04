const config = require("../config/db.config.js"); 
const Sequelize = require("sequelize"); 

/* intialise sequelize and define database connection pool details */
const sequelize = new Sequelize( 
    config.DB, 
    config.USER, 
    config.PASSWORD, 
    { 
        host: config.HOST,
        port: config.PORT,
        dialect: config.dialect, 
        operatorsAliases: false, 

        pool: { 
            max: config.pool.max,
            min: config.pool.min, 
            acquire: config.pool.acquire,
            idle: config.pool.idle
        }
    }
); 

/* declare and intialise database to be created using Sequelize library - not need to write any MySQL */
const db = {}; 
db.Sequelize = Sequelize; 
db.sequelize = sequelize; 

/* import all models */
db.user = require("../models/user.model.js")(sequelize, Sequelize); 
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.course = require("../models/course.model.js")(sequelize, Sequelize);
db.user_progress = require("../models/userProgress.model.js")(sequelize, Sequelize);
db.user_completed_course = require("../models/userCompletedCourse.model.js")(sequelize, Sequelize);
db.credit = require("../models/credit.model.js")(sequelize, Sequelize);
db.course_rating = require("../models/courseRating.model.js")(sequelize, Sequelize);
db.quiz = require("../models/quiz.model.js")(sequelize, Sequelize);
db.user_quiz_scores = require("../models/userQuizScores.model.js")(sequelize, Sequelize);

/* define many to many relationship between users and roles to track users assigned roles */
db.role.belongsToMany(db.user, { through: "user_roles", foreignKey: "roleId", otherKey: "userId" });
db.user.belongsToMany(db.role, { through: "user_roles", foreignKey: "userId", otherKey: "roleId" }); 
db.ROLES = ["user", "admin"]; 

/* define many to many relationship between user and courses to track user progress */
db.user.belongsToMany(db.course, { through: db.user_progress });
db.course.belongsToMany(db.user, { through: db.user_progress });

/* define one to one relationship between a user and their credits */
db.credit.belongsTo(db.user, { foreignKey: { unique: true }});
db.user.hasOne(db.credit, { foreignKey: { unique: true }});

/* define relationship between user and completed courses (one to many) */ 
db.user.hasMany(db.user_completed_course, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' }); 
db.user_completed_course.belongsTo(db.user, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' }); // table should have foreign key reference to course 
db.user_completed_course.belongsTo(db.course, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' }); // table should have foreign key reference to course 

/* define relationship between course and ratings (one to many) */ 
db.course.hasMany(db.course_rating, { foreignKey: 'courseId', onDelete: 'CASCADE' });
db.course_rating.belongsTo(db.user, { foreignKey: 'userId', onDelete: 'CASCADE' }); 
db.course_rating.belongsTo(db.course, { foreignKey: 'courseId', onDelete: 'CASCADE' });

/* user has many quizzes (and quiz can have many users*/ 
db.user.belongsToMany(db.quiz, { through: db.user_quiz_scores });
db.quiz.belongsToMany(db.user, { through: db.user_quiz_scores });
// through quiz best scores - contains userId and quizId as composite key
// has field bestScore
module.exports = db; 

