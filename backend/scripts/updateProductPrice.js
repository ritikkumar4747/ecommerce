import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env reliably regardless of current working dir
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set in env — cannot connect');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();

    // Lower any product with a very large price to a safe test amount
    const filter = { price: { $gt: 100000 } };
    const update = { $set: { price: 1000 } };
    const res = await db.collection('products').updateMany(filter, update);
    console.log('Updated products count:', res.modifiedCount);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
