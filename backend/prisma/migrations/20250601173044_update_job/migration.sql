-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "jobBoards" JSONB,
ADD COLUMN     "minYearsExperience" INTEGER,
ADD COLUMN     "skills" JSONB;
