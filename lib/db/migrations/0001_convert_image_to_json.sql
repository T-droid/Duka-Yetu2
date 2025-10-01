-- Migration to convert image column from text to json and add specifications
-- This handles existing data properly

-- First, add the new specifications column
ALTER TABLE "product" ADD COLUMN "specifications" json;

-- Create a new temporary column for the image array
ALTER TABLE "product" ADD COLUMN "image_new" json;

-- Convert existing image text to JSON array format
-- If image is null or empty, set to null, otherwise wrap in array
UPDATE "product" 
SET "image_new" = 
  CASE 
    WHEN "image" IS NULL OR "image" = '' THEN NULL
    ELSE json_build_array("image")
  END;

-- Drop the old image column
ALTER TABLE "product" DROP COLUMN "image";

-- Rename the new column to image
ALTER TABLE "product" RENAME COLUMN "image_new" TO "image";
