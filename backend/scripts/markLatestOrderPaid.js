import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
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

    // Find latest pending order
    const order = await db.collection('orders').findOne({ status: 'pending' }, { sort: { createdAt: -1 } });
    if (!order) { console.log('No pending order found'); return; }

    const razorOrderId = order.paymentInfo?.razorpayOrderId || order._id.toString();
    const paymentId = 'pay_simulated_' + Date.now();

    const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET_CANONICAL;
    let signature = '';
    if (keySecret) {
      const hmac = crypto.createHmac('sha256', keySecret);
      hmac.update(`${razorOrderId}|${paymentId}`);
      signature = hmac.digest('hex');
    }

    const update = {
      $set: {
        'paymentInfo.razorpayPaymentId': paymentId,
        'paymentInfo.razorpaySignature': signature,
        isPaid: true,
        paidAt: new Date(),
        status: 'completed'
      }
    };

    const res = await db.collection('orders').updateOne({ _id: order._id }, update);
    console.log('Marked order paid:', res.modifiedCount, 'orderId:', order._id.toString());
  } catch (err) { console.error(err); }
  finally { await client.close(); }
}

run();
