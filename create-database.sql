-- Create database
CREATE DATABASE "rank-predictor";

-- Create tables based on the schema

-- Users table
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "institutionId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Institutions table
CREATE TABLE "institutions" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'STANDARD',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "contactPerson" TEXT,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "currentStudents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- Templates table
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "examCode" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "accuracy" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- Institution Templates junction table
CREATE TABLE "institution_templates" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "institution_templates_pkey" PRIMARY KEY ("id")
);

-- Predictions table
CREATE TABLE "predictions" (
    "id" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "studentEmail" TEXT NOT NULL,
    "rollNumber" TEXT,
    "predictedRank" INTEGER,
    "accuracy" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,

    CONSTRAINT "predictions_pkey" PRIMARY KEY ("id")
);

-- Datasets table
CREATE TABLE "datasets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "datasets_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "institutions_institutionId_key" ON "institutions"("institutionId");
CREATE UNIQUE INDEX "institutions_email_key" ON "institutions"("email");
CREATE UNIQUE INDEX "templates_examCode_key" ON "templates"("examCode");
CREATE UNIQUE INDEX "institution_templates_institutionId_templateId_key" ON "institution_templates"("institutionId", "templateId");

-- Create foreign key constraints
ALTER TABLE "users" ADD CONSTRAINT "users_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "institution_templates" ADD CONSTRAINT "institution_templates_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "institution_templates" ADD CONSTRAINT "institution_templates_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "predictions" ADD CONSTRAINT "predictions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "predictions" ADD CONSTRAINT "predictions_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "predictions" ADD CONSTRAINT "predictions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
