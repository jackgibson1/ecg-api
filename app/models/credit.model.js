// model defining credits 
// joined to user via one to one relationship to give total credits for each user

module.exports = (sequelize, Sequelize) => { 
    const Credit = sequelize.define("credits", { 
        credits: { 
            type: Sequelize.INTEGER, 
        }
    }); 
    return Credit;
};