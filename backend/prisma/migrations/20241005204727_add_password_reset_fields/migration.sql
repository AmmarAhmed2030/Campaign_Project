-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetPassworExpiry" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" TEXT;
