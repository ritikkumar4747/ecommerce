import { expect } from 'chai';
import request from 'supertest';
import { startInMemoryMongo, stopInMemoryMongo } from './setup.js';

let app;

describe('Address API', function() {
  before(async function() {
    await startInMemoryMongo();
    // import app after DB is configured
    const mod = await import('../app.js');
    app = mod.app;
    // create a test user
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'P@ssw0rd123!' });
    // login and store cookie
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'P@ssw0rd123!' });
    this.cookies = res.headers['set-cookie'];
  });

  after(async function() {
    await stopInMemoryMongo();
  });

  it('rejects address with invalid phone', async function() {
    const res = await request(app)
      .post('/api/addresses')
      .set('Cookie', this.cookies)
      .send({ recipientName: 'A', line1: 'L1', city: 'City', postalCode: '123456', country: 'India', phone: 'abc123' });
    expect(res.status).to.equal(400);
    expect(res.body.error).to.match(/phone/);
  });

  it('accepts valid address and returns it', async function() {
    const res = await request(app)
      .post('/api/addresses')
      .set('Cookie', this.cookies)
      .send({ recipientName: 'A', line1: 'L1', city: 'City', postalCode: '123456', country: 'India', phone: '+91 9876543210', label: 'Home' });
    expect(res.status).to.equal(201);
    expect(res.body.recipientName).to.equal('A');
    this.addressId = res.body._id;
  });

  it('can update address and enforce validation', async function() {
    const res = await request(app)
      .put('/api/addresses/' + this.addressId)
      .set('Cookie', this.cookies)
      .send({ phone: 'invalid-phone' });
    expect(res.status).to.equal(400);
  });

});
