/*
  Warnings:

  - You are about to drop the column `body` on the `message_templates` table. All the data in the column will be lost.
  - You are about to drop the column `isDefault` on the `message_templates` table. All the data in the column will be lost.
  - You are about to drop the column `stageTrigger` on the `message_templates` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `message_templates` table. All the data in the column will be lost.
  - Added the required column `content` to the `message_templates` table without a default value. This is not possible if the table is not empty.
  - Made the column `subject` on table `message_templates` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "message_templates" DROP COLUMN "body",
DROP COLUMN "isDefault",
DROP COLUMN "stageTrigger",
DROP COLUMN "type",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isRequired" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "subject" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
