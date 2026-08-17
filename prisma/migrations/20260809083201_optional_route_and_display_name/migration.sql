-- AlterTable
ALTER TABLE "User" ADD COLUMN "displayName" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "rating" INTEGER,
    "body" TEXT NOT NULL,
    "finishedAt" DATETIME NOT NULL,
    "acquisitionRoute" TEXT,
    "acquisitionDetail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("isbn13") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("acquisitionDetail", "acquisitionRoute", "body", "bookId", "createdAt", "finishedAt", "id", "rating", "updatedAt", "userId") SELECT "acquisitionDetail", "acquisitionRoute", "body", "bookId", "createdAt", "finishedAt", "id", "rating", "updatedAt", "userId" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
CREATE INDEX "Review_userId_acquisitionRoute_idx" ON "Review"("userId", "acquisitionRoute");
CREATE INDEX "Review_bookId_idx" ON "Review"("bookId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
