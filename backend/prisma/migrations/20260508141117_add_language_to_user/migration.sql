-- CreateEnum
CREATE TYPE "Language" AS ENUM ('AR', 'FR', 'EN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'AR';
