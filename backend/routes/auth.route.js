import express from "express";
import {
  register,
  login,
  logout,
} from "../controllers/user.authentication.js";
import { me } from "../controllers/user.authentication.js";
import protect from "../middleware/user.middleware.js";
import { refreshToken } from "../utils/refreshtoken.js";
import { makeAdmin } from "../controllers/user.authentication.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/me", protect, me);
router.post("/make-admin", protect, makeAdmin);

export default router;