# Prediction Types in Rank Predictor

This document explains the two different prediction methods available in the Rank Predictor application.

## 1. AI/Dataset-Based Prediction

**When used:** When template has `type: "ai"` (AI analyzes datasets to make predictions)

**How it works:**
- **AI analyzes historical datasets** to make predictions
- Uses AI models trained on past student data
- Considers factors like difficulty, candidate count, historical averages
- The terms "AI" and "Dataset" refer to the same process - AI analyzing datasets
- Example: CLAT 2025 AI Predictor, JEE Main 2025 AI Predictor

**Template Configuration:**
```json
{
  "type": "ai", // AI analyzes datasets to make predictions
  "promptTemplate": "Analyze student score using historical dataset patterns...",
  "placeholders": {
    "examName": "CLAT 2025",
    "candidateCount": "75000",
    "difficulty": "Moderate"
  }
}
```

**Key Point:** Whether you call it "AI" or "Dataset", it's the same underlying process - **AI analyzing historical datasets** to predict ranks.

## 2. Conditional-Based Prediction ⭐

**When used:** When exam has `conditions` configured (highest priority)

**How it works:**
- Evaluates student scores against specific conditions
- Matches conditions like "Total Score >= 200" or "Section Score - Physics >= 60"
- Provides best/worst case predictions based on matched conditions
- **Completely separate** from AI/Dataset methods
- Does NOT use historical datasets - uses rule-based conditions

**Exam Conditions Configuration:**
```json
[
  {
    "parameter": "Total Score",
    "operator": "gte",
    "value": "200",
    "bestCasePercentile": "98.5",
    "worstCasePercentile": "95.0",
    "bestCaseRank": "1500",
    "worstCaseRank": "5000"
  },
  {
    "parameter": "Section Score - Physics",
    "operator": "gte", 
    "value": "60",
    "bestCasePercentile": "90.0",
    "worstCasePercentile": "85.0"
  }
]
```

## Priority System

The application uses the following priority system:

1. **Conditional-Based** (if exam has conditions) - Highest Priority ⭐
2. **AI/Dataset-Based** (if template has `type: "ai"`) - Medium Priority  
3. **Default Client-Side** - Fallback

## How Each Prediction Type Works

### AI/Dataset Prediction Flow:
1. **Template Creation:** Admin creates template with AI prompts and dataset placeholders
2. **Student Submission:** Student submits scores via prediction form
3. **AI Analysis:** AI analyzes the score against historical dataset patterns
4. **Prediction Generation:** AI generates rank/percentile based on dataset analysis
5. **Result Storage:** Saves prediction with AI-generated metadata

### Conditional Prediction Flow:
1. **Exam Creation:** Admin creates exam with specific conditions
2. **Student Submission:** Student submits scores via prediction form
3. **Condition Matching:** System evaluates scores against all conditions
4. **Rule-Based Calculation:** Uses matched conditions to determine rank/percentile
5. **Result Storage:** Saves prediction with conditional metadata

## API Endpoints

- **Conditional:** `/api/predictions/conditional` - For conditional-based predictions
- **Standard:** `/api/predictions` - For AI/Dataset predictions
- **Debug:** `/api/debug/exam-conditions` - To check exam conditions

## Key Differences

| Feature | AI/Dataset-Based | Conditional-Based |
|---------|------------------|-------------------|
| Data Source | AI analyzing historical datasets | Score conditions/rules |
| Configuration | Template prompts + dataset placeholders | Condition rules |
| Flexibility | Medium | Very High |
| Accuracy | Good (depends on dataset quality) | Excellent (when conditions match) |
| Use Case | General predictions using historical data | Rule-based predictions with specific criteria |

## Implementation Notes

- **Conditional prediction** overrides AI/Dataset when conditions exist
- **AI/Dataset are the same thing** - AI analyzes historical datasets to make predictions
- Each conditional condition can specify best/worst case scenarios
- Multiple conditions can be applied to the same exam
- System falls back gracefully if conditional API fails

## Summary

There are only **TWO** distinct prediction types:

1. **AI/Dataset Prediction** - AI analyzes historical datasets
2. **Conditional Prediction** - Rule-based score conditions

The terms "AI" and "Dataset" refer to the same underlying process where AI models analyze historical dataset patterns to generate predictions.
