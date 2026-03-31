# JEE MAIN 2025 Prediction Page Debug Guide

## 🚨 Issue: Prediction Not Working

**URL:** `http://localhost:3000/predict/jee-main-2025`

## 🔍 Debug Steps

### Step 1: Check Template Data

**Visit:** `http://localhost:3000/api/debug/templates`

**What to look for:**
```json
{
  "success": true,
  "jeeTemplates": [
    {
      "id": "template-123",
      "name": "JEE MAIN 2025",
      "examCode": "JEE-MAIN-2025",
      "type": "conditional",
      "status": "ACTIVE",
      "hasConditions": true,
      "conditionsCount": 2,
      "placeholders": {
        "conditions": [...]
      }
    }
  ]
}
```

**Expected Results:**
- ✅ JEE template exists
- ✅ `type` should be "conditional"
- ✅ `hasConditions` should be true
- ✅ `conditionsCount` should be > 0
- ✅ `examCode` should match "JEE-MAIN-2025"

### Step 2: Check Prediction Page Loading

**Open Browser Console** and visit: `http://localhost:3000/predict/jee-main-2025`

**What to look for:**
```javascript
// Should see these console logs:
🔍 Prediction Page - Component mounted with examId: jee-main-2025
🔍 Loading template from database for examCode: jee-main-2025
✅ Found template: {name: "JEE MAIN 2025", type: "conditional"}
📋 Found exam conditions: {...}
```

**Error Messages to Watch For:**
- ❌ "Template not found, using fallback config"
- ❌ "Failed to fetch templates, using fallback config"
- ❌ "No exam conditions found, using template data"

### Step 3: Test Conditional Prediction API

**Test with curl or Postman:**
```bash
curl -X POST http://localhost:3000/api/predictions/conditional \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "Test Student",
    "studentEmail": "test@example.com",
    "institutionId": "cmmu45bd200007klhs7q4n8jd",
    "examId": "jee-main-2025",
    "totalScore": 180,
    "mathsScore": 60,
    "physicsScore": 60,
    "chemistryScore": 60
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "prediction": {
    "predictedRank": 20000,
    "predictedPercentile": 80,
    "bestCaseRank": 15000,
    "worstCaseRank": 25000,
    "predictionType": "conditional"
  }
}
```

**Error Responses:**
- ❌ `{"error": "Template not found for exam: jee-main-2025"}`
- ❌ `{"error": "No conditions found for this exam template"}`

### Step 4: Check Template Loading in Prediction Page

**In Browser Console:**
```javascript
// Check what template is loaded
fetch('/api/templates?examCode=jee-main-2025')
  .then(res => res.json())
  .then(templates => {
    const jeeTemplate = templates.find(t => t.examCode.toLowerCase() === 'jee-main-2025');
    console.log('JEE Template:', jeeTemplate);
    console.log('Type:', jeeTemplate?.type);
    console.log('Conditions:', jeeTemplate?.placeholders?.conditions);
  });
```

## 🔧 Common Issues & Fixes

### Issue 1: Template Not Found
**Problem:** Template examCode doesn't match URL
**Fix:** Check if template has `examCode: "JEE-MAIN-2025"` (not "jee-main-2025")

### Issue 2: No Conditions Found
**Problem:** Template exists but has no conditions
**Fix:** Add conditions to template via admin panel

### Issue 3: Wrong Template Type
**Problem:** Template type is "ai" instead of "conditional"
**Fix:** Update template type in database

### Issue 4: Case Sensitivity
**Problem:** URL uses lowercase but template uses uppercase
**Fix:** Update prediction page to handle case-insensitive matching

## 🎯 Quick Fix Commands

### Fix Template Type (if needed):
```sql
UPDATE templates 
SET type = 'conditional' 
WHERE examCode = 'JEE-MAIN-2025';
```

### Check Template Data:
```sql
SELECT id, name, examCode, type, status, placeholders 
FROM templates 
WHERE examCode LIKE '%JEE%' OR name LIKE '%JEE%';
```

## 📊 Expected Flow

1. **User visits:** `/predict/jee-main-2025`
2. **Page loads template:** Finds "JEE MAIN 2025" template
3. **Template type:** "conditional" with conditions
4. **User submits form:** Calls conditional API
5. **API evaluates:** Matches conditions and returns prediction
6. **User sees results:** Rank prediction based on conditions

## 🚀 Next Steps

1. **Run debug checks** above
2. **Identify the specific issue**
3. **Apply the appropriate fix**
4. **Test the prediction flow**
5. **Verify results page works**

---

## 🎯 If Everything Works

After fixes, you should see:

1. ✅ Template loads correctly
2. ✅ Prediction form shows JEE subjects
3. ✅ Form submission calls conditional API
4. ✅ API returns rank prediction
5. ✅ Results page shows prediction
6. ✅ Prediction based on your conditions

**Your JEE MAIN 2025 prediction should be working!** 🎉
