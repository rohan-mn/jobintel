-- CreateTable
CREATE TABLE "JobPost" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceJobId" TEXT,
    "title" TEXT NOT NULL,
    "company" TEXT,
    "location" TEXT,
    "url" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobPost_source_url_key" ON "JobPost"("source", "url");
