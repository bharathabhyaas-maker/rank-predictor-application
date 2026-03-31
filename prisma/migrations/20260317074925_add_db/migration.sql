-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'INSTITUTION', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "institutionId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutions" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'STANDARD',
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "contactPerson" TEXT,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "currentStudents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "examCode" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'ai',
    "promptTemplate" TEXT,
    "placeholders" JSONB,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "accuracy" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institution_templates" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "institution_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predictions" (
    "id" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "studentEmail" TEXT NOT NULL,
    "rollNumber" TEXT,
    "predictedRank" INTEGER,
    "predictedPercentile" DOUBLE PRECISION,
    "bestCaseRank" INTEGER,
    "worstCaseRank" INTEGER,
    "avgRank" INTEGER,
    "bestCasePercentile" DOUBLE PRECISION,
    "worstCasePercentile" DOUBLE PRECISION,
    "avgPercentile" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "predictionType" TEXT DEFAULT 'dataset',
    "examName" TEXT,
    "examCode" TEXT,
    "answers" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "examId" TEXT,

    CONSTRAINT "predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "datasets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "datasets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "department" TEXT,
    "phone" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "joinedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "institutionId" TEXT NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "examCode" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "templateId" TEXT NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_conditions" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "parameter" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "operator2" TEXT,
    "value2" TEXT,
    "bestCasePercentile" DOUBLE PRECISION,
    "worstCasePercentile" DOUBLE PRECISION,
    "bestCaseRank" INTEGER,
    "worstCaseRank" INTEGER,
    "avgRank" INTEGER,
    "avgPercentile" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Condition" (
    "id" TEXT NOT NULL,
    "parameter" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "additionalOperator" TEXT,
    "additionalValue" DOUBLE PRECISION,
    "bestCasePercentile" DOUBLE PRECISION NOT NULL,
    "worstCasePercentile" DOUBLE PRECISION NOT NULL,
    "bestCaseRank" INTEGER NOT NULL,
    "worstCaseRank" INTEGER NOT NULL,
    "averageRank" INTEGER NOT NULL,
    "averagePercentile" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Condition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "institutions_institutionId_key" ON "institutions"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "institutions_email_key" ON "institutions"("email");

-- CreateIndex
CREATE UNIQUE INDEX "templates_examCode_key" ON "templates"("examCode");

-- CreateIndex
CREATE UNIQUE INDEX "institution_templates_institutionId_templateId_key" ON "institution_templates"("institutionId", "templateId");

-- CreateIndex
CREATE UNIQUE INDEX "exams_examCode_key" ON "exams"("examCode");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_templates" ADD CONSTRAINT "institution_templates_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institution_templates" ADD CONSTRAINT "institution_templates_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_conditions" ADD CONSTRAINT "exam_conditions_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
