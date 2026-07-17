import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const users = await db.collection('users').find({}).toArray();
    console.log(JSON.stringify(users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role })), null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
