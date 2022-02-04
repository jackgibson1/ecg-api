// model defining courses

module.exports = (sequelize, Sequelize) => { 
    const Quiz = sequelize.define("courses", { 
        id: { 
            type: Sequelize.INTEGER, 
            primaryKey: true
        },
        name: { 
            type: Sequelize.STRING
        }
    }, { timestamps: false }); 

    return Quiz;
};