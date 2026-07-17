import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  const email = 'smoke@test.local';
  const password = 'P@ssw0rd123!';

  console.log('Logging in...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  console.log('Login Status:', loginRes.status);
  const loginData = await loginRes.json();
  console.log('Login Data:', loginData);

  const cookies = loginRes.headers.get('set-cookie');
  console.log('Cookies:', cookies);

  if (!cookies) {
    console.error('No cookies returned');
    return;
  }

  // extract accessToken cookie
  const match = cookies.match(/accessToken=([^;]+)/);
  if (!match) {
    console.error('No accessToken cookie');
    return;
  }
  const token = match[1];

  console.log('Creating FormData...');
  const fd = new FormData();
  fd.append('name', 'Test Auto Product');
  fd.append('description', 'This is a test description');
  fd.append('price', '150000');
  fd.append('category', 'cars');
  fd.append('stock', '5');

  // Let's create a tiny dummy image buffer
  const buffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  const blob = new Blob([buffer], { type: 'image/png' });
  fd.append('images', blob, 'test.png');

  console.log('Sending product creation request...');
  const prodRes = await fetch('http://localhost:5000/api/products', {
    method: 'POST',
    headers: {
      'Cookie': `accessToken=${token}`
    },
    body: fd
  });

  console.log('Product Creation Status:', prodRes.status);
  const prodData = await prodRes.json();
  console.log('Product Creation Response:', prodData);
}

run();
