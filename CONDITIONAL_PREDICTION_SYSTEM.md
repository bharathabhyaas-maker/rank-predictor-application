# Conditional Prediction System - Complete Implementation

## 🎯 Overview

Your conditional prediction system allows you to **define manual rules and conditions** for rank prediction. When users select "Conditions-Based Prediction" in the exam creation page, the system evaluates student scores against your predefined conditions to predict ranks.

## 🔧 How It Works

### 1. Exam Creation Phase
```
Admin creates exam → Selects "Conditions-Based Prediction" → Defines conditions → Conditions stored in template
```

### 2. Prediction Phase  
```
Student takes exam → Scores submitted → Conditional API evaluates → Conditions matched → Rank predicted
```

### 3. Results Phase
```
Results page shows → Predicted rank based on conditions → Clear explanation of prediction logic
```

## 📋 Condition Structure

Each condition has the following fields:

```typescript
interface Condition {
  parameter: string           // "Total Score", "Section Score - Maths", etc.
  operator: string           // "gte", "lte", "gt", "lt", "eq", "between"
  value: string             // Numeric threshold value
  operator2?: string         // Second operator for "between"
  value2?: string           // Second value for "between"
  bestCasePercentile: string   // Best case percentile
  worstCasePercentile: string  // Worst case percentile  
  bestCaseRank: string          // Best case rank
  worstCaseRank: string         // Worst case rank
  avgRank: string               // Average rank
  avgPercentile: string         // Average percentile
}
```

## 🎨 UI Implementation

### Exam Creation Page
```tsx
// Conditions selection card
<button onClick={() => setPredictionType("conditions")}>
  <h3>Conditions-Based Prediction</h3>
  <p>Define manual rules and score-range conditions</p>
</button>

// Condition configuration section
{predictionType === "conditions" && (
  <div>
    <h2>Prediction Conditions</h2>
    {conditions.map((condition) => (
      <ConditionRow 
        condition={condition}
        onChange={updateCondition}
        onRemove={removeCondition}
      />
    ))}
    <Button onClick={addCondition}>Add Condition</Button>
  </div>
)}
```

### Condition Fields Available
- **Total Score**: Overall exam score
- **Percentile**: Calculated percentile from total score
- **Section Score - English**: English section score
- **Section Score - Reasoning**: Reasoning section score  
- **Section Score - Legal**: Legal aptitude score
- **Section Score - GK**: General knowledge score
- **Section Score - Maths**: Mathematics section score

### Operators Available
- **gte**: Greater than or equal to (≥)
- **lte**: Less than or equal to (≤)
- **gt**: Greater than (>)
- **lt**: Less than (<)
- **eq**: Equal to (=)
- **between**: Between two values (inclusive)

## 🔍 Evaluation Logic

### Condition Matching Process
```typescript
function evaluateCondition(condition, studentData) {
  // 1. Get student value based on parameter
  let studentValue = getStudentValue(condition.parameter, studentData)
  
  // 2. Evaluate condition based on operator
  let matches = false
  switch (condition.operator) {
    case "gte":
      matches = studentValue >= parseFloat(condition.value)
      break
    case "between":
      matches = studentValue >= parseFloat(condition.value) && 
                studentValue <= parseFloat(condition.value2)
      break
    // ... other operators
  }
  
  return { matches }
}
```

### Priority System
1. **First Match Wins**: System evaluates conditions in order
2. **Multiple Matches**: Uses the first matching condition
3. **No Matches**: Falls back to score-based calculation

### Fallback Calculation
If no conditions match:
```typescript
function calculateFallbackPrediction(studentData) {
  const totalScore = studentData.totalScore || 0
  const maxScore = 500 // Assumed maximum score
  
  const percentile = (totalScore / maxScore) * 100
  const rank = Math.round((100 - percentile) * 100)
  
  return { percentile, rank }
}
```

## 🗄️ Data Storage

### Template Creation
```typescript
// Conditions stored in template.placeholders
const template = await prisma.template.create({
  data: {
    name: "JEE Conditional Predictor",
    type: "conditional",
    placeholders: {
      conditions: [
        {
          parameter: "Total Score",
          operator: "gte", 
          value: "150",
          bestCasePercentile: "85",
          worstCasePercentile: "75",
          bestCaseRank: "15000",
          worstCaseRank: "25000",
          avgRank: "20000",
          avgPercentile: "80"
        }
      ]
    }
  }
})
```

### Prediction Request
```typescript
// API endpoint: POST /api/predictions/conditional
const prediction = await fetch('/api/predictions/conditional', {
  method: 'POST',
  body: JSON.stringify({
    studentName: "Alice Johnson",
    studentEmail: "alice@example.com",
    institutionId: "inst-123",
    examId: "jee-main",
    totalScore: 180,
    englishScore: 45,
    reasoningScore: 50,
    mathsScore: 85
  })
})
```

## 📊 Prediction Results

### Response Format
```json
{
  "success": true,
  "prediction": {
    "id": "pred-123",
    "studentName": "Alice Johnson", 
    "predictedRank": 20000,
    "predictedPercentile": 80,
    "bestCaseRank": 15000,
    "worstCaseRank": 25000,
    "avgRank": 20000,
    "bestCasePercentile": 85,
    "worstCasePercentile": 75,
    "avgPercentile": 80,
    "examName": "JEE Main",
    "examCode": "JEE-MAIN",
    "status": "completed",
    "predictionType": "conditional",
    "createdAt": "2026-03-18T16:30:00.000Z"
  }
}
```

### Metadata Tracking
The system tracks:
```typescript
metadata: {
  conditions: matchedConditions,
  studentScores: {
    totalScore: 180,
    englishScore: 45,
    reasoningScore: 50,
    mathsScore: 85
  }
}
```

## 🎯 Example Scenarios

### Scenario 1: High Score Student
**Conditions:**
- Total Score ≥ 150 → Rank: 15,000-25,000

**Student:** Total Score = 180
**Result:** Matches condition → Predicted Rank: 20,000

### Scenario 2: Medium Score Student  
**Conditions:**
- Total Score between 100-149 → Rank: 35,000-50,000

**Student:** Total Score = 125
**Result:** Matches condition → Predicted Rank: 42,500

### Scenario 3: Section Score Focus
**Conditions:**
- Section Score - Maths ≥ 40 → Rank: 30,000-45,000

**Student:** Maths Score = 45, Total Score = 110
**Result:** Matches condition → Predicted Rank: 37,500

### Scenario 4: No Match (Fallback)
**Conditions:** None match student scores

**Student:** Total Score = 80
**Result:** Fallback calculation → (80/500) * 100 = 16th percentile

## ✅ Benefits

### 🎯 **Control & Transparency**
- **Full Control**: You define the prediction logic
- **Transparent**: Clear rules for how ranks are calculated
- **Explainable**: Can show users which condition matched

### 🚀 **Consistency & Reliability**
- **Consistent**: Same score range always gets similar prediction
- **Reliable**: No dependency on external AI or data quality
- **Predictable**: Results based on your expertise

### 💡 **Flexibility**
- **Multiple Parameters**: Total score, section scores, percentiles
- **Complex Logic**: Between ranges, multiple operators
- **Expert Knowledge**: Incorporate your domain expertise

### 🎨 **User-Friendly**
- **Easy Setup**: Simple form interface in exam creation
- **Clear Results**: Shows prediction ranges and explanations
- **No Data Required**: Works without historical datasets

## 🔧 Implementation Status

✅ **Completed Features:**
- Condition definition interface in exam creation
- Multiple parameter support (total score, sections)
- All operators (gte, lte, gt, lt, eq, between)
- Condition evaluation logic
- Fallback calculation for no matches
- Metadata tracking and storage
- API endpoint for predictions
- Response with prediction ranges

✅ **Database Integration:**
- Conditions stored in template.placeholders
- Predictions saved with condition metadata
- Template type marked as "conditional"

✅ **UI Components:**
- Conditions selection card
- Dynamic condition rows
- Add/remove condition functionality
- Expandable condition details
- Parameter and operator dropdowns

## 🎉 Ready for Production

Your conditional prediction system is **fully implemented and ready**:

- ✅ **Exam Creation**: Define conditions with intuitive UI
- ✅ **Evaluation Logic**: Smart condition matching with fallback
- ✅ **API Integration**: RESTful endpoint for predictions
- ✅ **Data Storage**: Proper database persistence
- ✅ **Results Display**: Clear prediction outputs
- ✅ **Metadata Tracking**: Full audit trail

**Users can now create exams with conditional prediction rules and get accurate, rule-based rank predictions on the results page!** 🎉

---

## 📝 Quick Start Guide

1. **Create Conditional Exam:**
   - Go to exam creation page
   - Select "Conditions-Based Prediction"
   - Add conditions with parameters and score ranges
   - Set prediction ranges for each condition

2. **Student Takes Exam:**
   - Student completes exam with scores
   - System evaluates against conditions
   - First matching condition determines prediction

3. **View Results:**
   - Results page shows predicted rank
   - Clear explanation of prediction logic
   - Shows which condition was applied

Perfect implementation for rule-based rank predictions! ✨
