import { expect } from 'chai';
import request from 'supertest';
import { startInMemoryMongo, stopInMemoryMongo } from './setup.js';

let app;

describe('Checkout flow', function() {
  before(async function() {
    await startInMemoryMongo();
    const mod = await import('../app.js');
    app = mod.app;
    // create a user and add a product + cart
    await request(app).post('/api/auth/register').send({ name: 'C', email: 'c@x.com', password: 'P@ssw0rd123!' });
    const login = await request(app).post('/api/auth/login').send({ email: 'c@x.com', password: 'P@ssw0rd123!' });
    this.cookies = login.headers['set-cookie'];
    // create a product directly via model
    const Product = (await import('../models/product.models.js')).default;
    const p = await Product.create({ name: 'P', price: 100, category: 'Cat', description: 'Desc', stock: 10, imageUrl: 'img.jpg' });
    // add to cart
    await request(app).post('/api/cart/add').set('Cookie', this.cookies).send({ productId: p._id, quantity: 1 });
  });

  after(async function() {
    await stopInMemoryMongo();
  });

  it('rejects checkout without address selection', async function() {
    const res = await request(app).post('/api/orders/checkout').set('Cookie', this.cookies).send({});
    expect(res.status).to.be.oneOf([400,500]);
  });

  it('accepts checkout with valid shippingAddress and saves if requested', async function() {
    const res = await request(app).post('/api/orders/checkout').set('Cookie', this.cookies).send({ shippingAddress: { recipientName: 'C', line1: 'L', city: 'City', postalCode: '123456', country: 'India', phone: '+91 9999999999' }, saveAddress: true });
    expect(res.status).to.equal(201);
    expect(res.body.order.shippingAddress).to.exist;
  });
});
