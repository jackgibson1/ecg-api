module.exports = (sequelize, Sequelize) => { 
    const Role = sequelize.define("courses", { 
        id: { 
            type: Sequelize.INTEGER, 
            primaryKey: true
        },
        name: { 
            type: Sequelize.STRING
        }
    }); 

    return Role;
};