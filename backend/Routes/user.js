import express from "express";
import { getUser, updateUser } from "../controllers/user.js";
import { protect } from "../controllers/auth.js";
import upload from "../utils/multer.js";
const router = express.Router();
router.post("/get-my-profile", protect, getUser);
router.patch(
  "/update-my-profile",
  protect,
  upload.single("avatar"),
  updateUser
);

export default router;
