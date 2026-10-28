CREATE TYPE "OnboardingStatus" AS ENUM ('PENDING', 'COMPLETED', 'SKIPPED');

ALTER TABLE "User" ADD COLUMN "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'PENDING';

-- Existing accounts can open the guide from their profile without a forced tour.
UPDATE "User" SET "onboardingStatus" = 'COMPLETED';
