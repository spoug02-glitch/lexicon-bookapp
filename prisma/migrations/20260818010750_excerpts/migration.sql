-- CreateTable
CREATE TABLE "Excerpt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "pageLabel" TEXT,
    "comment" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Excerpt_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Excerpt_reviewId_order_idx" ON "Excerpt"("reviewId", "order");
