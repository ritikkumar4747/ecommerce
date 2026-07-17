import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set in backend/.env');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const res = await db.collection('products').insertOne({
      name: 'Test Car (cheap)',
      description: 'A affordable test car',
      price: 1000,
      category: 'cars',
      stock: 5,
      imageUrl: '/181536-866999858_medium.mp4'
    });
    console.log('Inserted product id:', res.insertedId);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
