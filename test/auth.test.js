const request = require('supertest');
const app = require('../app');
const db = require('../app/models');
const initial = require('../initialDatabase');

describe('Authentication Endpoints', () => {
  const testDb = db;

  beforeAll(async () => {
    await testDb.sequelize.sync({ force: true });
    await initial(db.role, db.course, db.quiz);
  });

  it('user should be able to signup if all conditions are correct', async () => {
    const username = 'testuser';
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        username,
        password: 'testpassword',
        email: 'test@test.com'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ message: 'User was registered successfully' });

    // check created user has been added to roles, courses positions & quiz scores tables
    const user = await testDb.user.findOne({ where: { username } }).then((usr) => usr);
    const userRoles = await user.getRoles();
    const totalCoursePositions = await user.getCourses();
    const totalQuizScores = await user.getCourses();

    expect(userRoles.length).toEqual(1);
    expect(totalCoursePositions.length).toEqual(6);
    expect(totalQuizScores.length).toEqual(6);
  });

  // it('user should not be able to sign up if invalid request body', async () => {
  //   const res = await request(app)
  //     .post('/api/auth/signup')
  //     .send({
  //       username: '',
  //       password: 'test is cool',
  //       email: 'jackgibson@gmail.com'
  //     });
  //   expect(res.statusCode).toEqual(400);
  //   expect(res.body).toEqual({ message: 'User was registered successfully' });
  // });
});
