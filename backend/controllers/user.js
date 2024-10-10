import prisma from "../Lib/db.js";
import cloudinary from "../utils/cloudinary.js";
const getUser = async (req, res, next) => {
  try {
    const user = req.user;
    const { id: userId } = user;
    const existing_user = await prisma.user.findFirst({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        address: true,
        isVerified: true,
        photo_url: true,
        photo_id: true,
        createdAt: true,
        updatedAt: true,
        // Add any other fields you want to include
      },
    });
    if (!existing_user) {
      return res.status(404).json({
        status: "error",
        message: "User Not Found !",
      });
    }
    res.status(200).json({
      status: "Success",
      data: { ...existing_user },
      message: "User found Successfully",
    });
  } catch (error) {
    console.log("Error While Getting The user : ", error);
  }
};
const updateUser = async (req, res, next) => {
  const { firstName, lastName, address, phone } = req.body;
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Your Are not Authorized or user Not Found",
      });
    }
    const uploadData = await cloudinary.uploader.upload(req.file.path, {
      folder: "avatars",
    });
    if (!uploadData) {
      return res.status(400).json({
        status: "error",
        message: "Failed To Upload Your Photo",
      });
    }
    const { id: userId } = user;
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
        isVerified: true,
      },
      data: {
        firstName,
        lastName,
        address,
        phone,
        photo_id: uploadData.public_id,
        photo_url: uploadData.secure_url,
      },
    });
    if (!updateUser) {
      return res.status(400).json({
        status: "error",
        message: "Failed To Update Your Profile",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Profile Updated Successfully",
      data: { ...updatedUser },
    });
  } catch (error) {
    console.log("Error While Updating Your Profile", error);
  }
};
export { getUser, updateUser };
