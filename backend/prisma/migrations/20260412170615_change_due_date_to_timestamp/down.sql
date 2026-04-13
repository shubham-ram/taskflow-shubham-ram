-- AlterTable
ALTER TABLE "tasks" ALTER COLUMN "due_date" SET DATA TYPE DATE USING "due_date"::DATE;
