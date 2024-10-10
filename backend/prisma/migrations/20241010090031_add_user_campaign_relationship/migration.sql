-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "posterTitle" TEXT NOT NULL,
    "posterDescription" TEXT NOT NULL,
    "poster_url" TEXT,
    "poster_id" TEXT,
    "aboutTitle" TEXT NOT NULL,
    "aboutDescription" TEXT NOT NULL,
    "about_url" TEXT,
    "about_id" TEXT,
    "firstPlan" DOUBLE PRECISION NOT NULL,
    "secondPlan" DOUBLE PRECISION NOT NULL,
    "thirdPlan" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_id_key" ON "Campaign"("id");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
