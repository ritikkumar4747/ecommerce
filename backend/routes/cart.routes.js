import express from "express";
import {
    addToCart,
    getCart,
    removeFromCart,
    updateCart
} from "../controllers/cart.controller.js";
import authMiddleware from "../middleware/user.middleware.js";

const router = express.Router();

router.post("/add", authMiddleware, addToCart);
router.get("/", authMiddleware, getCart);
router.put("/update", authMiddleware, updateCart);
router.delete("/remove", authMiddleware, removeFromCart);

export default router;