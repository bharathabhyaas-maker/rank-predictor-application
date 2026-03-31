-- Fix template type for conditional prediction
-- Run this SQL to update CLAT-2025 template to use conditional predictions

UPDATE templates 
SET type = 'conditional' 
WHERE examCode = 'CLAT-2025';

-- Also check if other templates need updating
SELECT examCode, name, type FROM templates WHERE type = 'ai' AND examCode LIKE '%CLAT%';
