/*
  Warnings:

  - You are about to drop the column `image` on the `Game` table. All the data in the column will be lost.
  - Added the required column `imagePath` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "image",
ADD COLUMN     "imagePath" TEXT NOT NULL;
