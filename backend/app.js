import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import addressRoutes from "./routes/address.routes.js";

const createApp = () => {
  const app = express();

  // Trust first proxy for secure cookies behind reverse proxies (Render, Railway, Heroku, etc.)
  app.set("trust proxy", 1);

  app.use(express.json());
  app.use(helmet());
  app.use(cookieParser());

  const allowedOrigins = process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(",").map((o) => o.trim())
    : ["http://localhost:5173"];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, tests, mobile)
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true,
    })
  );

  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/addresses", addressRoutes);

  app.get("/", (req, res) => res.send("API is running..."));

  return app;
};

const app = createApp();
export { createApp, app };
