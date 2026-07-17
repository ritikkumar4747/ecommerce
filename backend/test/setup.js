import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import 'dotenv/config';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret1234567890';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'testrefreshsecret1234567890';

let mongo;

export const startInMemoryMongo = async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  process.env.MONGO_URI = uri;
  await mongoose.connect(uri, { dbName: 'test' });
};

export const stopInMemoryMongo = async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
};
