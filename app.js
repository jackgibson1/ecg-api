const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const initial = require('./initialDatabase');
require('dotenv').config();

const app = express();

const corsOptions = {
  // add in deployment origin
  origin: 'http://localhost:8081'
};

app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// import database and models required for intialisation
const db = require('./app/models');

if (process.env.NODE_ENV === 'development') {
  db.sequelize.sync({ force: true }).then(() => initial(db.role, db.course, db.quiz));
}
else if (process.env.NODE_ENV === 'production') {
  db.sequelize.sync({ force: false });
}

// API ROUTES
app.get('/', (req, res) => res.json({ message: 'ECG API' }));
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/course.routes')(app);
require('./app/routes/quiz.routes')(app);
require('./app/routes/admin.routes')(app);

module.exports = app;
