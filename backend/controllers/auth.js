import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { promisify } from "util";
import prisma from "../Lib/db.js";
import generateOTP from "../Lib/generate_otp.js";
import registerBodyValidation from "../validations/registerBodyValidation.js";
import hashOTP from "../Lib/hashOtp.js";
import sendOurEmail from "../services/sendOurEmail.js";
import createHashedResetToken from "../Lib/createHashedResetToken.js";
dotenv.config();
const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET);

const register = async (req, res, next) => {
  const { error } = registerBodyValidation.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { firstName, lastName, address, email, password } = req.body;
  console.log("req.body", firstName, lastName, password, email, address);
  const hashedPassword = await bcrypt.hash(password, 12);

  const existing_user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (existing_user && existing_user.isVerified) {
    res.status(400).json({
      status: "error",
      message: "User already registered please login",
    });
  } else if (existing_user && !existing_user.isVerified) {
    req.userId = existing_user.id;
    next();
  } else {
    const new_user = await prisma.user.create({
      data: { firstName, lastName, address, email, password: hashedPassword },
    });
    if (!new_user) {
      return res.status(400).json({
        error: "Failed to register user",
      });
    }

    req.userId = new_user.id;
    next();
  }
};
const sendOtp = async (req, res, next) => {
  const { userId } = req;
  if (!userId) {
    return res.status(400).json({ message: "User ID is missing" });
  }
  console.log("userID : ", userId);
  const otp = generateOTP();
  const hashedOtp = await hashOTP(otp);
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId }, // Find user by id
      data: {
        otp: hashedOtp,
        otpExpiry: otpExpiry,
      },
    });

    await sendOurEmail(
      updatedUser.email,
      `${updatedUser.firstName} ${updatedUser.lastName}`,
      otp
    );
    console.log("Otp sent:", updatedUser);
    return res.status(200).json({
      status: "success",
      message: "OTP sent Successfully",
    });
  } catch (error) {
    console.error("Error while sending otp:", error);
  }
};
const verifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;
  try {
    //getting the user

    const user = await prisma.user.findUnique({
      where: { email },
    });

    //check if found user
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User Not Found",
      });
    }

    //check Expiry date
    const currentTime = new Date();
    if (user.otpExpiry && currentTime > new Date(user.otpExpiry)) {
      return res.status(500).json({
        status: "error",
        message: "Otp has expired",
      });
    }

    //compare otp
    if (user.otp === null && user.isVerified) {
      return res.status(200).json({
        status: "success",
        message: "Your Account Already Verified Please Login!",
      });
    }
    if (user.otp === null && !user.isVerified) {
      return res.status(400).json({
        status: "error",
        message: "There is No OTP Found Please Resend The OTP Again!",
      });
    }
    const isOtpValid = await bcrypt.compare(otp, user.otp);

    if (!isOtpValid) {
      return res.status(400).json({
        status: "error",
        message: "Otp is invalid",
      });
    }
    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otp: null, // Clear the OTP after verification
        otpExpiry: null,
      },
    });
    const token = signToken(user.id);
    return res.status(200).json({
      status: "success",
      token,
      userId: user.id,
      message: "User verified successfully",
    });
  } catch (error) {
    console.log("Error : ", error);
    return res
      .status(500)
      .json({ status: "Error", message: "Internal server error" });
  }
};
const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "email and password are required",
    });
  }

  //check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User Not Found Please register first",
    });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(400).json({
      status: "error",
      message: "Bad Credintials",
    });
  }
  const {
    firstName,
    lastName,
    address,
    id,
    photo_url,
    phone,
    createdAt,
    email: userEmail,
  } = user;
  return res.status(200).json({
    message: "Logged In Successfully",
    token: signToken(user.id),
    user: {
      firstName,
      lastName,
      address,
      id,
      photo_url,
      phone,
      createdAt,
      email: userEmail,
    },
    status: "success",
  });
};
const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else {
    return res.status(400).json({
      status: "error",
      message: "You are not authorized",
    });
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //get this user
  const existing_user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });
  if (!existing_user) {
    return res.status(400).json({
      status: "error",
      message: "User Not Found You are not authorized",
    });
  }
  req.user = existing_user;
  next();
};
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const existing_user = await prisma.user.findUnique({
      where: { email: email },
    });
    if (!existing_user) {
      return res.status(404).json({
        status: "Error",
        message: "User Not Found",
      });
    }
    const resetPasswordToken = createHashedResetToken();
    const resetPassworExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken,
        resetPassworExpiry,
      },
    });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}`;
    await sendOurEmail(email, resetLink);
    res.status(200).json({
      status: "Success",
      message: "Reset password token sent successfully",
    });
  } catch (error) {
    console.log("Error : ", error);
  }
};
const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword, token } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        email,
        resetPasswordToken: token,
        resetPasswordExpiry: {
          gte: new Date(), // Ensure the token is not expired
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        status: "Error",
        message: "Invalid or expired reset token.",
      });
    }
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user password and clear the reset token
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
    });

    res.status(200).json({
      status: "Success",
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.log("Error while resetting password : ", error);
  }
};
export {
  register,
  sendOtp,
  verifyOtp,
  login,
  protect,
  forgotPassword,
  resetPassword,
};
