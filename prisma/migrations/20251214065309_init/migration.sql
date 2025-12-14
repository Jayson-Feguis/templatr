-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "backgroundColor" TEXT NOT NULL,
    "backgroundImage" TEXT,
    "brandingText" TEXT,
    "brandingColor" TEXT,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImagePosition" (
    "id" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "isOverlay" BOOLEAN DEFAULT false,
    "src" TEXT,
    "name" TEXT,
    "templateId" TEXT NOT NULL,

    CONSTRAINT "ImagePosition_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ImagePosition" ADD CONSTRAINT "ImagePosition_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;
