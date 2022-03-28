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

    // check created user has been added to roles, courses positions, quiz scores & credits tables
    const user = await testDb.user.findOne({ where: { username } }).then((usr) => usr);
    const userRoles = await user.getRoles();
    const totalCoursePositions = await user.getCourses();
    const totalQuizScores = await user.getQuizzes();
    const userCredit = await user.getCredit();

    expect(userRoles.length).toEqual(1);
    expect(totalCoursePositions.length).toEqual(6);
    expect(totalQuizScores.length).toEqual(6);
    expect(userCredit.credits).toEqual(0);
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

describe('Authentication Endpoints - Signin', () => {
  const testDb = db;
  const username = 'testuser';
  const password = 'testuser';
  const email = 'test@test.com';

  beforeAll(async () => {
    await testDb.sequelize.sync({ force: true });
    await initial(db.role, db.course, db.quiz);
    // intialise db with test user
    await request(app).post('/api/auth/signup').send({ username, password, email });
  });

  it('user should be able to signin', async () => {
    const res = await request(app).post('/api/auth/signin').send({ username, password });
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.id).toBeDefined();
    expect(res.body.username).toBeDefined();
    expect(res.body.email).toBeDefined();
    expect(res.body.roles.length).toEqual(1);
  });

  it('user should not able to signin with username that does not exist', async () => {
    const res = await request(app).post('/api/auth/signin')
      .send({ username: 'fakeuser', password: 'fakepass' });
    expect(res.body.message).toEqual('User Not found.');
  });

  it('user should not able to signin with incorrect password', async () => {
    const res = await request(app).post('/api/auth/signin')
      .send({ username, password: 'fakepass' });
    expect(res.body.message).toEqual('Invalid Password!');
  });
});

describe('Authentication Endpoints - Refresh Token', () => {
  const testDb = db;
  const username = 'testuser';
  const password = 'testpass';
  const email = 'test@test.com';
  let refreshToken;

  beforeAll(async () => {
    await testDb.sequelize.sync({ force: true });
    await initial(db.role, db.course, db.quiz);
    // intialise db with test user
    await request(app).post('/api/auth/signup').send({ username, password, email });
    // intialise refreshToken
    refreshToken = await request(app).post('/api/auth/signin').send({ username, password }).then((res) => res.body.refreshToken);
  });

  it('should return message if refresh token is not set', async () => {
    const res = await request(app).post('/api/auth/refreshtoken').send({ refreshToken: null });
    expect(res.body.message).toEqual('Refresh Token is required!');
    expect(res.status).toBe(403);
  });

  it('should return message if refresh token does not exist in db', async () => {
    const res = await request(app).post('/api/auth/refreshtoken').send({ refreshToken: 'faketoken' });
    expect(res.body.message).toEqual('Refresh token is not in database!');
    expect(res.status).toBe(403);
  });

  it('should return new access token and same refresh token if successful', async () => {
    const res = await request(app).post('/api/auth/refreshtoken').send({ refreshToken });
    expect(res.body.accessToken).toBeDefined();
    // refresh token should not update - should remain the samne as old refresh token
    expect(res.body.refreshToken).toEqual(refreshToken);
    expect(res.status).toBe(200);
  });
});

describe('Authentication Endpoints - Verify Captcha', () => {
  const testDb = db;

  beforeAll(async () => {
    await testDb.sequelize.sync({ force: true });
    await initial(db.role, db.course, db.quiz);
  });

  it('should respond with message if response token is not set', async () => {
    const res = await request(app).post('/api/auth/verifycaptcha').send();
    expect(res.body.message).toEqual('Ensure response key is set.');
    expect(res.status).toBe(404);
  });
});
