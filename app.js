const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const initial = require('./initialDatabase');
require('dotenv').config();

const app = express();

const corsOptions = {
  // add in deployment origin
  origin: ['http://localhost:8081', 'http://143.117.45.71:10003']
};

app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// serve uplaoded images
app.use(express.static(`${__dirname}/public`));

// import database and models required for intialisation
const db = require('./app/models');

if (process.env.NODE_ENV === 'development') {
  db.sequelize.sync({ force: true }).then(() => initial(db.role, db.course, db.quiz));
}
else if (process.env.NODE_ENV === 'production') {
  // ideally force should be false to ensure data is not dropped in production
  // however as product is still in develpment users will not expect data to kept
  // main priority is that users can test product with updated features
  db.sequelize.sync({ force: true }).then(() => initial(db.role, db.course, db.quiz));
}

// API ROUTES
app.get('/', (req, res) => res.json({ message: 'ECG API' }));
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/course.routes')(app);
require('./app/routes/quiz.routes')(app);
require('./app/routes/admin.routes')(app);
require('./app/routes/forum.routes')(app);

module.exports = app;
