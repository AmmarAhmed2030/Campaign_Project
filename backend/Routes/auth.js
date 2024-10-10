import express from "express";
import {
  forgotPassword,
  login,
  register,
  resetPassword,
  sendOtp,
  verifyOtp,
} from "../controllers/auth.js";

const router = express.Router();

router.post("/register", register, sendOtp);
router.post("/send-otp", sendOtp);

router.post("/verify-otp", verifyOtp);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
