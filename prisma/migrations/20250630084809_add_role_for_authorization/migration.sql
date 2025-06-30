-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
