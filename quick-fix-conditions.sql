-- QUICK FIX: Add conditions field to exams table
-- Copy this SQL and run it in your PostgreSQL database

ALTER TABLE exams ADD COLUMN conditions JSONB;

-- Verify it was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'exams' AND column_name = 'conditions';
