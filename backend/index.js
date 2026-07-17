import 'dotenv/config';
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import 'dotenv/config';
import connectDB from "./config/db.js";
import { connectRedis } from "./config/redisclient.js";
import { app } from "./app.js";

const start = async () => {
  await connectDB();

  if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
    try {
      await connectRedis();
      console.log("Redis client connected");
    } catch (err) {
      console.warn("Redis connection failed, continuing without Redis:", err.message);
    }
  } else {
    console.log("Redis not configured; skipping Redis connect");
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start().catch(err => {
  console.error('Failed to start server', err);
  process.exit(1);
});

