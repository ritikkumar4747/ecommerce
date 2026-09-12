import { expect } from 'chai';
import request from 'supertest';
import { startInMemoryMongo, stopInMemoryMongo } from './setup.js';

let app;

describe('Auth API & CORS', function() {
  before(async function() {
    await startInMemoryMongo();
    const mod = await import('../app.js');
    app = mod.app;
  });

  after(async function() {
    await stopInMemoryMongo();
  });

  it('rejects registration with missing fields', async function() {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'missing_password@example.com' });
    expect(res.status).to.equal(400);
  });

  it('registers new user and sets authentication cookies', async function() {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Auth User', email: 'auth_user@example.com', password: 'P@ssw0rd123!' });
    expect(res.status).to.equal(201);
    expect(res.body.message).to.equal('User registered successfully');
    const cookies = res.headers['set-cookie'];
    expect(cookies).to.be.an('array');
    const cookieString = cookies.join(';');
    expect(cookieString).to.include('accessToken=');
    expect(cookieString).to.include('refreshToken=');
    expect(cookieString).to.include('HttpOnly');
  });

  it('logs in registered user and returns cookies', async function() {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'auth_user@example.com', password: 'P@ssw0rd123!' });
    expect(res.status).to.equal(200);
    const cookies = res.headers['set-cookie'];
    expect(cookies).to.be.an('array');
    expect(cookies.join(';')).to.include('accessToken=');
  });

  it('allows CORS preflight from allowed origin', async function() {
    const res = await request(app)
      .options('/api/auth/login')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST');
    expect(res.headers['access-control-allow-origin']).to.equal('http://localhost:5173');
    expect(res.headers['access-control-allow-credentials']).to.equal('true');
  });
});
