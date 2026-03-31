-- SQL script to add conditions field to exams table
-- Run this in your PostgreSQL database

-- Add conditions field to exams table
ALTER TABLE exams 
ADD COLUMN conditions JSONB;

-- Verify the field was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'exams' AND column_name = 'conditions';

-- Show all exams to verify
SELECT id, name, examCode, conditions 
FROM exams 
WHERE examCode = 'CLAT-2025';
