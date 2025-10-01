-- Migration to simplify categories table and ensure basic categories exist

-- First, let's clean up the categories table by removing extra columns
-- Note: This will drop existing data in description, image, and createdAt columns
ALTER TABLE category DROP COLUMN IF EXISTS description;
ALTER TABLE category DROP COLUMN IF EXISTS image;
ALTER TABLE category DROP COLUMN IF EXISTS "createdAt";

-- Insert basic categories if they don't exist
INSERT INTO category (id, name) VALUES 
  ('food-snacks', 'Food & Snacks'),
  ('groceries', 'Groceries'),
  ('personal-care', 'Personal Care'),
  ('stationery', 'Stationery')
ON CONFLICT (name) DO NOTHING;

-- Additional categories for better product organization
INSERT INTO category (id, name) VALUES 
  ('electronics', 'Electronics'),
  ('clothing', 'Clothing'),
  ('books', 'Books'),
  ('health', 'Health & Wellness'),
  ('kitchen', 'Kitchen & Dining'),
  ('sports', 'Sports & Recreation')
ON CONFLICT (name) DO NOTHING;
