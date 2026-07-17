import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const carts = await db.collection('carts').find().toArray();
    let updated = 0;
    for (const cart of carts) {
      let total = 0;
      if (!cart.items || !Array.isArray(cart.items)) continue;
      for (const it of cart.items) {
        const pid = it.productId;
        let prod;
        try {
          prod = await db.collection('products').findOne({ _id: typeof pid === 'string' ? new ObjectId(pid) : pid });
        } catch (e) {
          prod = null;
        }
        if (prod && prod.price) {
          total += prod.price * (it.quantity || 1);
        }
      }
      await db.collection('carts').updateOne({ _id: cart._id }, { $set: { totalPrice: total } });
      updated++;
    }
    console.log('Updated carts:', updated);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
