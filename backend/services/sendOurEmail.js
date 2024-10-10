import nodemailer from "nodemailer";
import otpTemplate from "../Templates/otp.js";
import ResetPassword from "../Templates/resetPassword.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "ammarahmed10000@gmail.com",
    pass: "wdyt cvzh aiyp ufxy",
  },
});
const sendOurEmail = async (
  email = "",
  name = "Username",
  otp = "",
  resetLink = ""
) => {
  try {
    const info = await transporter.sendMail({
      from: `"Champaign Builder 👻" <ammarahmed10000@gmail.com>`, // sender address
      to: email, // list of receivers
      subject:
        resetLink.length > 0 ? "Reset Password Link" : "OTP Verification Code", // Subject line
      text: "Hello world?", // plain text body
      html:
        resetLink.length > 0
          ? ResetPassword(name, resetLink)
          : otpTemplate(name, otp), // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.emai
  } catch (error) {
    console.log("mailer error : ", error);
  }
};
export default sendOurEmail;
