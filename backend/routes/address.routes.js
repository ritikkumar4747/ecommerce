import express from "express";
import protect from "../middleware/user.middleware.js";
import {
  listAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/address.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", listAddresses);
router.post("/", createAddress);
router.get("/:id", getAddress);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);

export default router;
