import express from "express";

import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
} from "../controllers/product.controller.js";

import protect from "../middleware/user.middleware.js";
import authorize from "../middleware/rolemiddleware.js";

const router = express.Router();

router.get("/", getProducts);

router.get("/seller/me", protect, authorize("seller", "admin"), getSellerProducts);

router.get("/:id", getProduct);
// reviews
import { getReviews, addReview } from "../controllers/review.controller.js";
import upload from "../middleware/upload.middleware.js";
router.get("/:id/reviews", getReviews);
router.post("/:id/reviews", protect, addReview);

router.post(
  "/",
  protect,
  authorize("seller", "admin"),
  upload.array("images", 5),
  createProduct
);

router.put(
  "/:id",
  protect,
  authorize("seller", "admin"),
  updateProduct
);

router.delete(
  "/:id",
  protect,
  authorize("seller", "admin"),
  deleteProduct
);

export default router;