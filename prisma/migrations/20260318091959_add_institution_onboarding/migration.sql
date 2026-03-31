-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('NEW', 'CONTACTED', 'CONVERTED', 'REJECTED');

-- CreateTable
CREATE TABLE "InstitutionOnboarding" (
    "id" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "location" TEXT,
    "interestedCourses" TEXT[],
    "message" TEXT,
    "status" "OnboardingStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionOnboarding_pkey" PRIMARY KEY ("id")
);
