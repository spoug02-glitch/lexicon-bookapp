-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Book" (
    "isbn13" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "publisher" TEXT,
    "pubDate" DATETIME,
    "coverUrl" TEXT,
    "description" TEXT,
    "priceSales" INTEGER,
    "priceStandard" INTEGER,
    "aladinItemId" TEXT,
    "cachedAt" DATETIME NOT NULL,
    "isSeed" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Book" ("aladinItemId", "author", "cachedAt", "coverUrl", "description", "isbn13", "priceSales", "priceStandard", "pubDate", "publisher", "title") SELECT "aladinItemId", "author", "cachedAt", "coverUrl", "description", "isbn13", "priceSales", "priceStandard", "pubDate", "publisher", "title" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
