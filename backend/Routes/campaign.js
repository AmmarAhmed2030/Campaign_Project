import express from "express";
import { protect } from "../controllers/auth.js";
import { multipleUpload } from "../utils/multer.js";
import {
  createCampaign,
  deleteCampaign,
  getAllCampaigns,
  getUserCampaign,
  getUserCampaigns,
  updateCampaign,
} from "../controllers/campaign.js";
const router = express.Router();

router.post("/create-campaign", protect, multipleUpload, createCampaign);
router.patch("/update-campaign", protect, multipleUpload, updateCampaign);
router.post("/get-all-campaigns", protect, getAllCampaigns);
router.post("/get-user-campaigns", protect, getUserCampaigns);
router.post("/get-campaign/:campaignId", protect, getUserCampaign);

router.delete("/delete-campaign", protect, deleteCampaign);

export default router;
