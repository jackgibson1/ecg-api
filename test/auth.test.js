/* eslint-disable no-undef */

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

  it('user should be able to signup', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        username: 'username1',
        password: 'test is cool',
        email: 'jackgibson@gmail.com'
      });
    expect(res.statusCode).toEqual(200);
  });
});
