import express from "express";
import authRoutes from "./auth.js";
import userRoutes from "./user.js";
import campaignRoutes from "./campaign.js";
const router = express.Router();
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/campaign", campaignRoutes);

export default router;
