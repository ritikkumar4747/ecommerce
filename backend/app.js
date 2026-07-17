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
  app.use(express.json());
  app.use(helmet());
  app.use(cookieParser());
  app.use(
    cors({
      origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
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
