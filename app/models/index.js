const config = require("../config/db.config.js"); 

const Sequelize = require("sequelize"); 
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

const db = {}; 

db.Sequelize = Sequelize; 
db.sequelize = sequelize; 

db.user = require("../models/user.model.js")(sequelize, Sequelize); 
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.course = require("../models/course.model.js")(sequelize, Sequelize);
db.credit = require("../models/credit.model.js")(sequelize, Sequelize);

db.role.belongsToMany(db.user, { 
    through: "user_roles", 
    foreignKey: "roleId", 
    otherKey: "userId"
});

db.user.belongsToMany(db.role, { 
    through: "user_roles", 
    foreignKey: "userId", 
    otherKey: "roleId"
}); 

db.user_progress = sequelize.define('user_progress', { 
    position: Sequelize.DataTypes.INTEGER
}, { timestamps: false });

db.user.belongsToMany(db.course, { through: db.user_progress });
db.course.belongsToMany(db.user, { through: db.user_progress });

db.credit.belongsTo(db.user);
db.user.hasOne(db.credit);

db.ROLES = ["user", "admin"]; 

module.exports = db; 

