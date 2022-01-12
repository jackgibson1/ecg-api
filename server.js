const express = require("express"); 
const bodyParser = require("body-parser"); 
const cors = require("cors"); 

const app = express(); 

var corsOptions = { 
    origin: "http://localhost:8081"
}; 

app.use(cors(corsOptions)); 

// import db 
const db = require("./app/models");
const Role = db.role;
const Course = db.course;

// allow to re-sync db - remove paramters for prod 
db.sequelize.sync({force: true}).then(() => { 
    console.log("Drop and Resync DB"); 
    initial();
});

// parse requests of content-type - application/json 
app.use(bodyParser.json());

//parse reuqests of content-type - application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: true })); 

// simple first route 
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Jacks ECG API"});
});

require('./app/routes/auth.routes')(app); 
require('./app/routes/user.routes')(app);

// set port, listen for requests 
const PORT = process.env.PORT || 8080; 
app.listen(PORT, () => { 
    console.log(`Server is running on port ${PORT}.`);
})

function initial() { 
    Role.create({ 
        id: 1, 
        name: "user"
    }); 

    Role.create({ 
        id: 2, 
        name: "moderator"
    }); 

    Role.create({ 
        id: 3, 
        name: "admin"
    });

    Course.create({ 
        id: 1, 
        name: "anat"
    }); 

    Course.create({ 
        id: 2, 
        name: "intro"
    }); 

    Course.create({ 
        id: 3, 
        name: "diagrams"
    });
}
