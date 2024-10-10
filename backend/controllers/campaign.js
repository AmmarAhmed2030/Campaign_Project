import prisma from "../Lib/db.js";
import cloudinary from "../utils/cloudinary.js";

const createCampaign = async (req, res, next) => {
  const {
    posterTitle,
    posterDescription,
    aboutTitle,
    aboutDescription,
    firstPlan,
    secondPlan,
    thirdPlan,
  } = req.body;

  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "You are not authorized or user not found",
      });
    }

    const files = req.files;

    // Upload campaign image
    let posterImage;
    if (files.poster) {
      posterImage = await cloudinary.uploader.upload(files.poster[0].path, {
        folder: "posters",
      });

      if (!posterImage) {
        return res.status(400).json({
          status: "error",
          message: "Failed to upload poster image",
        });
      }
    }

    // Upload document if provided
    let aboutImage;
    if (files.about) {
      aboutImage = await cloudinary.uploader.upload(files.about[0].path, {
        folder: "abouts",
      });

      if (!aboutImage) {
        return res.status(400).json({
          status: "error",
          message: "Failed to upload about image",
        });
      }
    }

    const { id: userId } = user;
    const newCampaign = await prisma.campaign.create({
      data: {
        userId,
        posterTitle: posterTitle || "", // Use a default value if undefined
        posterDescription: posterDescription || "", // Use a default value if undefined
        aboutTitle: aboutTitle || "", // Use a default value if undefined
        aboutDescription: aboutDescription || "", // Use a default value if undefined
        firstPlan: parseFloat(firstPlan), // Convert to integer and use default if needed
        secondPlan: parseFloat(secondPlan),
        thirdPlan: parseFloat(thirdPlan),
        poster_id: posterImage?.public_id,
        poster_url: posterImage?.secure_url,
        about_id: aboutImage?.public_id,
        about_url: aboutImage?.secure_url,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Campaign created successfully",
      data: newCampaign,
    });
  } catch (error) {
    console.log("Error while creating campaign:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create campaign",
    });
  }
};
const updateCampaign = async (req, res, next) => {
  const {
    campaignId,
    posterTitle,
    posterDescription,
    aboutTitle,
    aboutDescription,
    firstPlan,
    secondPlan,
    thirdPlan,
  } = req.body;
  console.log("campaignId : ", campaignId);
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "You are not authorized or user not found",
      });
    }

    const { id: userId } = user;

    // Check if the campaign exists for the given user
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        userId,
      },
    });

    if (!existingCampaign) {
      return res.status(404).json({
        status: "error",
        message: "Campaign not found for this user",
      });
    }

    const files = req.files;

    // Upload campaign image
    let posterImage;
    if (files.poster) {
      posterImage = await cloudinary.uploader.upload(files.poster[0].path, {
        folder: "posters",
      });

      if (!posterImage) {
        return res.status(400).json({
          status: "error",
          message: "Failed to upload poster image",
        });
      }
    }

    // Upload document if provided
    let aboutImage;
    if (files.about) {
      aboutImage = await cloudinary.uploader.upload(files.about[0].path, {
        folder: "abouts",
      });

      if (!aboutImage) {
        return res.status(400).json({
          status: "error",
          message: "Failed to upload about image",
        });
      }
    }

    // Update campaign
    const updatedCampaign = await prisma.campaign.update({
      where: {
        id: campaignId,
      },
      data: {
        posterTitle: posterTitle || "", // Use a default value if undefined
        posterDescription: posterDescription || "", // Use a default value if undefined
        aboutTitle: aboutTitle || "", // Use a default value if undefined
        aboutDescription: aboutDescription || "", // Use a default value if undefined
        firstPlan: parseFloat(firstPlan), // Convert to float
        secondPlan: parseFloat(secondPlan),
        thirdPlan: parseFloat(thirdPlan),
        poster_id: posterImage?.public_id,
        poster_url: posterImage?.secure_url,
        about_id: aboutImage?.public_id,
        about_url: aboutImage?.secure_url,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Campaign updated successfully",
      data: updatedCampaign,
    });
  } catch (error) {
    console.log("Error while updating campaign:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update campaign",
    });
  }
};
const getAllCampaigns = async (req, res, next) => {
  try {
    // Fetch all campaigns from the database
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "You are not authorized",
      });
    }
    const campaigns = await prisma.campaign.findMany();

    // Respond with the list of campaigns
    res.status(200).json({
      status: "success",
      message: "Campaigns retrieved successfully",
      data: campaigns,
    });
  } catch (error) {
    console.log("Error while fetching campaigns:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch campaigns",
    });
  }
};

const deleteCampaign = async (req, res, next) => {
  const { campaignId } = req.params;

  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "You are not authorized or user not found",
      });
    }

    // Find and delete the campaign
    const deletedCampaign = await prisma.campaign.deleteMany({
      where: {
        id: campaignId,
        userId: user.id,
      },
    });

    // Check if any campaign was deleted
    if (deletedCampaign.count === 0) {
      return res.status(404).json({
        status: "error",
        message:
          "Campaign not found or you are not authorized to delete this campaign",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    console.log("Error while deleting campaign:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete campaign",
    });
  }
};

const getUserCampaigns = async (req, res, next) => {
  try {
    const { userId } = req.query;
    console.log("userId : ", userId);
    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required",
      });
    }
    // const user = req.user;
    // if (!user) {
    //   return res.status(404).json({
    //     status: "error",
    //     message: "You are not authorized or user not found",
    //   });
    // }

    // Fetch all campaigns for the authenticated user
    const userCampaigns = await prisma.campaign.findMany({
      where: {
        userId,
      },
    });

    // Check if the user has any campaigns
    if (userCampaigns.length === 0) {
      return res.status(200).json({
        status: "error",
        message: "No campaigns found for this user",
        data: [],
      });
    }

    res.status(200).json({
      status: "success",
      message: "User campaigns retrieved successfully",
      data: userCampaigns,
    });
  } catch (error) {
    console.log("Error while retrieving user campaigns:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve user campaigns",
    });
  }
};
const getUserCampaign = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "You are not authorized",
    });
  }
  const { campaignId } = req.params;

  try {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
      },
    });

    if (!campaign) {
      return res.status(404).json({
        message: "Campaign not found or does not belong to this user.",
      });
    }

    res.status(200).json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export {
  createCampaign,
  updateCampaign,
  getAllCampaigns,
  deleteCampaign,
  getUserCampaigns,
  getUserCampaign,
};
