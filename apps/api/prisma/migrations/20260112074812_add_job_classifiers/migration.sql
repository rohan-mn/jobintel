-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('REMOTE', 'ONSITE', 'HYBRID', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "RoleCategory" AS ENUM ('BACKEND', 'FRONTEND', 'FULLSTACK', 'DATA', 'ML', 'DEVOPS', 'SECURITY', 'MOBILE', 'QA', 'PM', 'OTHER');

-- AlterTable
ALTER TABLE "JobPost" ADD COLUMN     "experienceLevel" "ExperienceLevel" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "roleCategory" "RoleCategory" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "workMode" "WorkMode" NOT NULL DEFAULT 'UNKNOWN';

-- CreateIndex
CREATE INDEX "JobPost_createdAt_idx" ON "JobPost"("createdAt");

-- CreateIndex
CREATE INDEX "JobPost_company_idx" ON "JobPost"("company");

-- CreateIndex
CREATE INDEX "JobPost_location_idx" ON "JobPost"("location");

-- CreateIndex
CREATE INDEX "JobPost_workMode_idx" ON "JobPost"("workMode");

-- CreateIndex
CREATE INDEX "JobPost_experienceLevel_idx" ON "JobPost"("experienceLevel");

-- CreateIndex
CREATE INDEX "JobPost_roleCategory_idx" ON "JobPost"("roleCategory");

-- CreateIndex
CREATE INDEX "JobPost_createdAt_roleCategory_idx" ON "JobPost"("createdAt", "roleCategory");
