// Enhanced prediction logic to properly handle different prediction types
// This file explains the correct prediction flow and fixes common issues

## PREDICTION TYPES AND THEIR BEHAVIOR

### 1. CONDITION-BASED PREDICTION
**When it triggers:**
- Template type is "conditional" OR
- Exam has stored conditions in database

**What it does:**
- Uses stored exam conditions from database
- Applies conditional logic based on score ranges, parameters, operators
- Returns results based on predefined conditional rules

**API endpoint:** `/api/predictions/conditional`

### 2. AI-BASED PREDICTION  
**When it triggers:**
- Template type is "ai"

**What it does:**
- Uses Google Gemini AI for prediction
- Two sub-types based on AI source:
  - **Internet**: Uses live internet knowledge
  - **Dataset**: Analyzes historical dataset patterns

**API endpoint:** `/api/predictions/ai`

### 3. DATASET-BASED PREDICTION
**When it triggers:**
- Template type is NOT "ai" or "conditional"
- Template preview mode

**What it does:**
- Uses client-side rank prediction algorithms
- Analyzes score against historical patterns
- Traditional dataset-based analysis

**Function:** `predictRankFromTemplate()`

## COMMON ISSUES AND FIXES

### Issue 1: All predictions show "Dataset-Based Analysis"
**Cause:** Template type not properly detected or AI source not set

**Fix:**
1. Check template.type in database
2. Verify template.placeholders.aiSource is set
3. Ensure prediction logic checks template.type first

### Issue 2: AI predictions not using correct source
**Cause:** aiSource not passed correctly to Gemini API

**Fix:**
1. Extract aiSource from template.placeholders.aiSource
2. Pass aiSource to AI API call
3. Update calculation method display

### Issue 3: Conditional predictions not triggering
**Cause:** Exam conditions not loaded or template type wrong

**Fix:**
1. Load exam conditions from `/api/exams?examCode=`
2. Check template.type === 'conditional'
3. Verify conditions exist in database

## DEBUGGING STEPS

1. **Check template configuration:**
   ```javascript
   console.log('Template type:', templateConfig?.type)
   console.log('AI Source:', templateConfig?.placeholders?.aiSource)
   console.log('Exam conditions:', examConditions)
   ```

2. **Verify API endpoints:**
   - Test `/api/templates?examCode=X`
   - Test `/api/exams?examCode=X`
   - Test `/api/predictions/ai`
   - Test `/api/predictions/conditional`

3. **Check prediction flow:**
   - Conditional → AI → Dataset → Default
   - Each method should have distinct calculationMethod

## TEMPLATE SETUP REQUIREMENTS

### For Conditional Templates:
- type: "conditional"
- Exam conditions stored in database
- No AI source needed

### For AI Templates:
- type: "ai"
- placeholders.aiSource: "internet" OR "dataset"
- placeholders.datasetId: (if using dataset)

### For Dataset Templates:
- type: "dataset" OR any other value
- No special configuration needed

## IMPLEMENTATION CHECKLIST

✅ Template type detection working
✅ AI source passed correctly
✅ Conditional logic working
✅ Dataset fallback working
✅ Calculation method display correct
✅ Debug logging in place
