-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "goal" TEXT,
    "initialWeight" DOUBLE PRECISION,
    "targetWeight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "muscleGroup" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "equipment" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutPlanExercise" (
    "id" TEXT NOT NULL,
    "workoutPlanId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" TEXT NOT NULL,
    "restSeconds" INTEGER NOT NULL DEFAULT 60,
    "weight" DOUBLE PRECISION,
    "order" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "WorkoutPlanExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutPlanId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutLogExercise" (
    "id" TEXT NOT NULL,
    "workoutLogId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "WorkoutLogExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutLogSet" (
    "id" TEXT NOT NULL,
    "workoutLogExerciseId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,

    CONSTRAINT "WorkoutLogSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyWeight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BodyWeight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "reps" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_username_idx" ON "User"("username");
CREATE UNIQUE INDEX "Exercise_name_key" ON "Exercise"("name");
CREATE INDEX "Exercise_muscleGroup_idx" ON "Exercise"("muscleGroup");
CREATE INDEX "Exercise_name_idx" ON "Exercise"("name");
CREATE INDEX "WorkoutPlan_userId_idx" ON "WorkoutPlan"("userId");
CREATE INDEX "WorkoutPlanExercise_workoutPlanId_idx" ON "WorkoutPlanExercise"("workoutPlanId");
CREATE INDEX "WorkoutPlanExercise_exerciseId_idx" ON "WorkoutPlanExercise"("exerciseId");
CREATE INDEX "WorkoutLog_userId_idx" ON "WorkoutLog"("userId");
CREATE INDEX "WorkoutLog_date_idx" ON "WorkoutLog"("date");
CREATE INDEX "WorkoutLog_workoutPlanId_idx" ON "WorkoutLog"("workoutPlanId");
CREATE INDEX "WorkoutLogExercise_workoutLogId_idx" ON "WorkoutLogExercise"("workoutLogId");
CREATE INDEX "WorkoutLogExercise_exerciseId_idx" ON "WorkoutLogExercise"("exerciseId");
CREATE INDEX "WorkoutLogSet_workoutLogExerciseId_idx" ON "WorkoutLogSet"("workoutLogExerciseId");
CREATE INDEX "BodyWeight_userId_idx" ON "BodyWeight"("userId");
CREATE INDEX "BodyWeight_date_idx" ON "BodyWeight"("date");
CREATE INDEX "PersonalRecord_userId_idx" ON "PersonalRecord"("userId");
CREATE INDEX "PersonalRecord_exerciseId_idx" ON "PersonalRecord"("exerciseId");
CREATE UNIQUE INDEX "PersonalRecord_userId_exerciseId_key" ON "PersonalRecord"("userId", "exerciseId");
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "WorkoutPlan" ADD CONSTRAINT "WorkoutPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkoutPlanExercise" ADD CONSTRAINT "WorkoutPlanExercise_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkoutPlanExercise" ADD CONSTRAINT "WorkoutPlanExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WorkoutLogExercise" ADD CONSTRAINT "WorkoutLogExercise_workoutLogId_fkey" FOREIGN KEY ("workoutLogId") REFERENCES "WorkoutLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkoutLogExercise" ADD CONSTRAINT "WorkoutLogExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkoutLogSet" ADD CONSTRAINT "WorkoutLogSet_workoutLogExerciseId_fkey" FOREIGN KEY ("workoutLogExerciseId") REFERENCES "WorkoutLogExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BodyWeight" ADD CONSTRAINT "BodyWeight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PersonalRecord" ADD CONSTRAINT "PersonalRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PersonalRecord" ADD CONSTRAINT "PersonalRecord_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
