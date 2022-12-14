const Sequelize = require('sequelize');
const configdb = require('../config/database.json');

const config = configdb[process.env.NODE_ENV];

/* intialise sequelize and define database connection pool details */
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    operatorsAliases: false,
    logging: config.logging,

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
db.user = require('./user.model')(sequelize, Sequelize);
db.role = require('./role.model')(sequelize, Sequelize);
db.refreshToken = require('./refresh-token.model')(sequelize, Sequelize);
db.course = require('./course.model')(sequelize, Sequelize);
db.user_progress = require('./user-course-progress.model')(sequelize, Sequelize);
db.user_completed_course = require('./user-course-completed.model')(sequelize, Sequelize);
db.credit = require('./credit.model')(sequelize, Sequelize);
db.course_rating = require('./course-rating.model')(sequelize, Sequelize);
db.quiz = require('./quiz.model')(sequelize, Sequelize);
db.user_quiz_scores = require('./user-quiz-scores.model')(sequelize, Sequelize);
db.question = require('./question.model')(sequelize, Sequelize);
db.comment = require('./comment.model')(sequelize, Sequelize);
db.question_image_source = require('./question-imagesrc.model')(sequelize, Sequelize);
db.question_upvotes = require('./question-upvotes.model')(sequelize, Sequelize);
db.question_downvotes = require('./question-downvotes.model')(sequelize, Sequelize);

/* define many to many relationship between users and roles to track users assigned roles */
db.role.belongsToMany(db.user, { through: 'user_roles', foreignKey: 'roleId', otherKey: 'userId' });
db.user.belongsToMany(db.role, { through: 'user_roles', foreignKey: 'userId', otherKey: 'roleId' });
db.ROLES = ['user', 'admin'];

/* define one to one relationship between user and refrsh token */
db.refreshToken.belongsTo(db.user, { foreignKey: 'userId', targetKey: 'id' });
db.user.hasOne(db.refreshToken, { foreignKey: 'userId', targetKey: 'id' });

/* define many to many relationship between user and courses to track user progress */
db.user.belongsToMany(db.course, { through: db.user_progress });
db.course.belongsToMany(db.user, { through: db.user_progress });

/* define one to one relationship between a user and their credits */
db.credit.belongsTo(db.user, { foreignKey: { unique: true } });
db.user.hasOne(db.credit, { foreignKey: { unique: true } });

/* define relationship between user and completed courses (one to many) */
db.user.hasMany(db.user_completed_course, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.user_completed_course.belongsTo(db.user, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' }); // table should have foreign key reference to course
db.user_completed_course.belongsTo(db.course, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' }); // table should have foreign key reference to course

/* define relationship between course and ratings (one to many) */
db.course.hasMany(db.course_rating, { foreignKey: 'courseId', onDelete: 'CASCADE' });
db.course_rating.belongsTo(db.user, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.course_rating.belongsTo(db.course, { foreignKey: 'courseId', onDelete: 'CASCADE' });

/* user has many quizzes (and quiz can have many users) */
db.user.belongsToMany(db.quiz, { through: db.user_quiz_scores });
db.quiz.belongsToMany(db.user, { through: db.user_quiz_scores });

/* define relationship between question and comment (one to many) */
db.question.hasMany(db.comment, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.comment.belongsTo(db.question, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

/* define relationship between user and questions (one to many) */
db.user.hasMany(db.question, { foreignKey: 'username', sourceKey: 'username', onDelete: 'CASCADE' });
db.question.belongsTo(db.user, { foreignKey: 'username', sourceKey: 'username', onDelete: 'CASCADE' });

/* define relationship between user and comment (one to many) */
db.user.hasMany(db.comment, { foreignKey: 'username', sourceKey: 'username', onDelete: 'CASCADE' });
db.comment.belongsTo(db.user, { foreignKey: 'username', sourceKey: 'username', onDelete: 'CASCADE' });

/* define relationship between question and image source (one to one) */
db.question_image_source.belongsTo(db.question, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
db.question.hasOne(db.question_image_source, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

/* define relationship between question and votes (one to many) */
db.question.hasMany(db.question_upvotes, { foreignKey: 'questionId', onDelete: 'CASCADE' });
db.question.hasMany(db.question_downvotes, { foreignKey: 'questionId', onDelete: 'CASCADE' });
// foreign keys defined within models

module.exports = db;
