const express = require("express"); 
const bodyParser = require("body-parser"); 
const cors = require("cors"); 

const app = express(); 

var corsOptions = { 
    // add in deployment origin
    origin: "http://localhost:8081"
}; 

app.use(cors(corsOptions)); 

// import db 
const db = require("./app/models");
const Role = db.role;
const Course = db.course;
const Quiz = db.quiz;
const User = db.user;

// allow to re-sync db - remove paramters for prod 
// {force: true}
db.sequelize.sync().then(() => { 
    console.log("Drop and Resync DB"); 
    initial();
});

// parse requests of content-type - application/json 
app.use(bodyParser.json());

//parse requests of content-type - application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: true })); 

// simple first route 
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Jacks ECG API"});
});

require('./app/routes/auth.routes')(app); 
require('./app/routes/user.routes')(app);
require('./app/routes/course.routes')(app);
require('./app/routes/quiz.routes')(app);

// set port, listen for requests 
const PORT = process.env.PORT || 8080; 
app.listen(PORT, () => { 
    console.log(`Server is running on port ${PORT}.`);
})

function initial() { 

    // Role.create({ id: 1, name: "user" }); 
    // Role.create({ id: 2, name: "admin" });

    // Course.create({ id: 1, name: "Heart Fundamentals" }); 
    // Course.create({ id: 2, name: "ECG Introduction" }); 
    // Course.create({ id: 3, name: "Parts Of The ECG Explained" });
    // Course.create({ id: 4, name: "How To Read An ECG" });
    // Course.create({ id: 5, name: "How To Document An ECG" });
    // Course.create({ id: 6, name: "Conditions" });

    // Quiz.create({ id: 1, name: "Heart Fundamentals" }); 
    // Quiz.create({ id: 2, name: "ECG Introduction" }); 
    // Quiz.create({ id: 3, name: "Parts Of The ECG Explained" });
    // Quiz.create({ id: 4, name: "How To Read An ECG" });
    // Quiz.create({ id: 5, name: "How To Document An ECG" });
    // Quiz.create({ id: 6, name: "Conditions" });

    // User.create({ id: 1, username: 'dale', email: 'dale@farm.com', password: 'pass' });
}
