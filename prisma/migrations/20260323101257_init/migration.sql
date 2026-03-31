/*
  Warnings:

  - The `interestedCourses` column on the `InstitutionOnboarding` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "InstitutionOnboarding" DROP COLUMN "interestedCourses",
ADD COLUMN     "interestedCourses" JSONB;

-- AlterTable
ALTER TABLE "institutions" ADD COLUMN     "notificationPreferences" JSONB;

-- AlterTable
ALTER TABLE "predictions" ALTER COLUMN "institutionId" DROP NOT NULL;
