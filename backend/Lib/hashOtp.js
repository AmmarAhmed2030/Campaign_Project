import bcrypt from "bcryptjs";
async function hashOTP(otp) {
  return await bcrypt.hash(otp, 12);
}
export default hashOTP;
