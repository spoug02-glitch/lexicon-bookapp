/*
  Warnings:

  - You are about to drop the `AcquisitionPreset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `acquisitionDetail` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `acquisitionRoute` on the `Review` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AcquisitionPreset_route_label_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AcquisitionPreset";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "ReviewTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "ReviewTag_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReviewTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "rating" INTEGER,
    "shortReview" TEXT,
    "body" TEXT NOT NULL,
    "finishedAt" DATETIME NOT NULL,
    "channel" TEXT,
    "originStory" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("isbn13") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("body", "bookId", "createdAt", "finishedAt", "id", "rating", "updatedAt", "userId") SELECT "body", "bookId", "createdAt", "finishedAt", "id", "rating", "updatedAt", "userId" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
CREATE INDEX "Review_userId_channel_idx" ON "Review"("userId", "channel");
CREATE INDEX "Review_bookId_idx" ON "Review"("bookId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Tag_label_key" ON "Tag"("label");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewTag_reviewId_tagId_key" ON "ReviewTag"("reviewId", "tagId");
