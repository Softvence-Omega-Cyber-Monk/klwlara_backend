/*
  Warnings:

  - Added the required column `userId` to the `UserProducts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserProducts" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "UserProducts" ADD CONSTRAINT "UserProducts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
