import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath }); else dotenv.config();

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) { console.error('MONGO_URI not set'); process.exit(1); }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const email = process.argv[2] || 'ritikkrind@gmail.com'; // Default email if not provided
    // Check for existing admin to enforce single-admin constraint
    const existingAdmin = await db.collection('users').findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      return;
    }

    const res = await db.collection('users').updateOne({ email }, { $set: { role: 'admin' } });
    console.log('Matched:', res.matchedCount, 'Modified:', res.modifiedCount);
  } catch (err) { console.error(err); }
  finally { await client.close(); }
}

run();
