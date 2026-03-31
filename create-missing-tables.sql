-- Create missing tables based on Prisma schema

-- Create notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

-- Create institution_onboarding table
CREATE TABLE IF NOT EXISTS "institution_onboarding" (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    "institutionId" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "contactPerson" TEXT,
    email TEXT NOT NULL,
    mobile TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX IF NOT EXISTS "notifications_createdAt_idx" ON "notifications"("createdAt");
CREATE INDEX IF NOT EXISTS "institution_onboarding_institutionId_idx" ON "institution_onboarding"("institutionId");
