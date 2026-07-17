import express from "express";
import {
    createOrder,
    getOrders,
    getOrderById,
    getSellerOrders,
    updateOrderStatus
} from "../controllers/order.controller.js";
import { verifyPayment } from "../controllers/order.controller.js";
import authMiddleware from "../middleware/user.middleware.js";
import authorize from "../middleware/rolemiddleware.js";

const router = express.Router();

router.post("/checkout", authMiddleware, createOrder);
router.get("/", authMiddleware, getOrders);
router.get("/seller/me", authMiddleware, authorize("seller", "admin"), getSellerOrders);
router.get("/:id", authMiddleware, getOrderById);
router.post("/verify", authMiddleware, verifyPayment);
router.put("/:id/status", authMiddleware, authorize("seller", "admin"), updateOrderStatus);

export default router;