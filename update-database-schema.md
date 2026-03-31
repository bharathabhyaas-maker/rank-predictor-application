# Database Schema Update Instructions

## Current Issue
Your database is missing the new fields needed for conditional prediction:
- `conditions` field in Exam table
- `type` field in Template table

## How to Fix

### Option 1: Using Prisma Push (Recommended)
```bash
cd "c:\rank predictor application\rank-predictor"
npx prisma db push
```

### Option 2: Manual SQL Commands
If Prisma push doesn't work, run these SQL commands directly:

```sql
-- Add type field to templates table
ALTER TABLE templates 
ADD COLUMN type VARCHAR(255) DEFAULT 'ai';

-- Add promptTemplate field to templates table  
ALTER TABLE templates
ADD COLUMN "promptTemplate" TEXT;

-- Add placeholders field to templates table
ALTER TABLE templates
ADD COLUMN placeholders JSONB;

-- Add conditions field to exams table
ALTER TABLE exams
ADD COLUMN conditions JSONB;
```

## What This Will Do

1. **Template Table Updates:**
   - Add `type` field (default: 'ai')
   - Add `promptTemplate` field for AI prompts
   - Add `placeholders` field for template variables

2. **Exam Table Updates:**
   - Add `conditions` field to store conditional prediction rules

## After Update

Once you run the schema update:

1. **Restart your application server**
2. **Test CLAT-2025 prediction** - should now show "Condition-Based Analysis"
3. **Templates page** - CLAT-2025 should show as "conditional" type

## Verification

After updating, run this to verify:
```bash
npx tsx check-database-schema.ts
```

You should see:
- ✅ Exam table has conditions field!
- ✅ Template table has type field!

## Current Data Status

Your existing data:
- ✅ 5 Exams (including CLAT-2025)
- ✅ 8 Templates (including CLAT-2025)

The new fields will be added with default values, so your existing data won't be affected.
