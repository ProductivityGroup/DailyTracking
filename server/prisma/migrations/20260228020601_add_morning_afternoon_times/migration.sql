/*
  Warnings:

  - You are about to drop the column `reminder_time` on the `ReminderSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReminderSettings" DROP COLUMN "reminder_time",
ADD COLUMN     "afternoon_time" TEXT,
ADD COLUMN     "morning_time" TEXT;
