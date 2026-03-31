-- Make institutionId optional in predictions table for public access
-- This allows anyone to make predictions without requiring an institution

-- First, drop the foreign key constraint
ALTER TABLE predictions DROP CONSTRAINT predictions_institutionId_fkey;

-- Then, make the institutionId column nullable
ALTER TABLE predictions ALTER COLUMN institutionId DROP NOT NULL;

-- Re-add the foreign key constraint (now nullable)
ALTER TABLE predictions ADD CONSTRAINT predictions_institutionId_fkey 
  FOREIGN KEY (institutionId) 
  REFERENCES institutions(id) 
  ON DELETE CASCADE;

-- Add comment for documentation
COMMENT ON COLUMN predictions.institutionId IS 'Made optional for public access - predictions can be made without institution assignment';
