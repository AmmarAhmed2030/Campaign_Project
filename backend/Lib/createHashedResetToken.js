import crypto from "crypto";
const createHashedResetToken = async () => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  return hashedToken;
};
export default createHashedResetToken;
