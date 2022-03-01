require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');

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

const Role = db.role;
const Course = db.course;
const Quiz = db.quiz;

// called when API server is first started
async function initial() {
  Role.create({ id: 1, name: 'user' });
  Role.create({ id: 2, name: 'admin' });

  await Course.create({ id: 1, name: 'Heart Fundamentals' });
  await Course.create({ id: 2, name: 'ECG Introduction' });
  await Course.create({ id: 3, name: 'Parts Of The ECG Explained' });
  await Course.create({ id: 4, name: 'How To Read An ECG' });
  await Course.create({ id: 5, name: 'How To Document An ECG' });
  await Course.create({ id: 6, name: 'Conditions' });

  await Quiz.create({ id: 1, name: 'Heart Fundamentals' });
  await Quiz.create({ id: 2, name: 'ECG Introduction' });
  await Quiz.create({ id: 3, name: 'Parts Of The ECG Explained' });
  await Quiz.create({ id: 4, name: 'How To Read An ECG' });
  await Quiz.create({ id: 5, name: 'How To Document An ECG' });
  await Quiz.create({ id: 6, name: 'Conditions' });
}

if (process.env.NODE_ENV === 'development') {
  db.sequelize.sync({ force: true }).then(() => {
    console.log('Drop and Resync DB');
    initial();
  });
}
else {
  db.sequelize.sync({ force: false });
}

// home route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Jacks ECG API' });
});

// imports all defined routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/course.routes')(app);
require('./app/routes/quiz.routes')(app);
require('./app/routes/admin.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
