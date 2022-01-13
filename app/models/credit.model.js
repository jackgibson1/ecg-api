module.exports = (sequelize, Sequelize) => { 
    const Credit = sequelize.define("credits", { 
        credits: { 
            type: Sequelize.INTEGER, 
        }
    }); 
    return Credit;
};