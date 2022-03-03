const request = require('supertest');
const app = require('../app');
const db = require('../app/models');
const initial = require('../initialDatabase');

describe('Authentication Endpoints - Signup', () => {
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
    const totalQuizScores = await user.getQuizzes();

    expect(userRoles.length).toEqual(1);
    expect(totalCoursePositions.length).toEqual(6);
    expect(totalQuizScores.length).toEqual(6);
  });

  it('user should be able to signup as admin if all conditions are correct', async () => {
    const username = 'admin';
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        username,
        password: 'testpassword',
        email: 'admin@admin.com',
        roles: ['user', 'admin']
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ message: 'User was registered successfully!' });

    // check created user (admin) has been added to roles
    const user = await testDb.user.findOne({ where: { username } }).then((usr) => usr);
    const userRoles = await user.getRoles();

    // admin should have both user & admin roles
    expect(userRoles.length).toEqual(2);
  });

  it('user should not be able to sign up if invalid request body', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        username: '',
        password: '',
        email: ''
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ message: 'Ensure userId and quizId are both set!' });
  });

  it('user should not be able to up with duplicate username', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        username: 'testuser',
        password: 'testpassword',
        email: 'hello@gmail.com'
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ message: 'Failed! Username is already in use!' });
  });

  it('user should not be able to sign up with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        username: 'testuser123',
        password: 'testpassword',
        email: 'test@test.com'
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ message: 'Failed! Email is already in use!' });
  });

  it('user should not be able to sign up with role that does not exist (invalid role)', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        username: 'invalidrole',
        password: 'invalid@role.com',
        email: 'invalidt@role.com',
        roles: ['coolrole', 'admin']
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ message: 'Failed! Role does not exist = coolrole' });
  });
});
