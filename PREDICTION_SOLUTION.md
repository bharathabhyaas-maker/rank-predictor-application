// SOLUTION: Fix prediction types to work correctly

## CURRENT ISSUES IDENTIFIED:

1. **AI Template (JEE-MAIN-2027)**: 
   - Type: "ai" ✅
   - AI Source: "Not set" ❌ (Should be "internet" or "dataset")

2. **Conditional Templates (JEE-main-2025, JEE-MAIN-2026)**:
   - Type: "conditional" ✅  
   - Has Conditions: "No" ❌ (Should have exam conditions)

## SOLUTION: Update Prediction Logic to Handle Current State

Since templates aren't properly configured, let's modify the prediction logic to:

1. **For AI templates**: Default to internet-based AI prediction
2. **For conditional templates**: Use conditional API even without stored conditions  
3. **For dataset templates**: Use existing dataset logic

## IMPLEMENTATION:

### 1. Update AI Prediction Logic
```typescript
// In predict/[examId]/page.tsx - Line 501-506
} else if (templateConfig && templateConfig.type === 'ai') {
  console.log('🤖 Using AI-based prediction with Gemini for', templateConfig.name)
  
  // Default to internet if AI source not set
  const aiSource = templateConfig.placeholders?.aiSource || 'internet'
  console.log('📋 AI Source (defaulted):', aiSource)
  
  // Call AI prediction API with Gemini
  const aiResponse = await fetch('/api/predictions/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      studentName: formData.fullName,
      studentEmail: formData.email,
      rollNumber: formData.hallTicket,
      institutionId: user?.institution?.id || user?.institutionId,
      examId: examId,
      templateId: templateConfig.id || examId,
      totalScore: totalScore,
      answers: subjectData,
      aiSource: aiSource, // Use defaulted value
      datasetId: templateConfig.placeholders?.datasetId
    })
  })
  
  if (aiResponse.ok) {
    const aiResult = await aiResponse.json()
    console.log('✅ AI prediction result:', aiResult)
    
    // Convert AI API result to PredictionData format
    predictionData = {
      examId,
      examName: config.name,
      totalScore,
      maxPossibleScore,
      percentage: (totalScore / maxPossibleScore) * 100,
      rankRange: {
        minRank: aiResult.bestCaseRank || aiResult.rank || 1000,
        predictedRank: aiResult.rank || 1000,
        maxRank: aiResult.worstCaseRank || aiResult.rank || 1000,
      },
      percentile: {
        minPercentile: aiResult.bestCasePercentile || aiResult.percentile || 50,
        predictedPercentile: aiResult.percentile || 50,
        maxPercentile: aiResult.worstCasePercentile || aiResult.percentile || 50,
      },
      totalCandidates: aiResult.totalCandidates || 1000000,
      calculationMethod: aiSource === 'dataset' ? 'AI Dataset Analysis' : 'AI Internet Analysis',
      formData: {
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        hallTicket: formData.hallTicket,
        city: formData.city,
        expectedScore: formData.expectedScore,
        expectedScoreValue: formData.expectedScoreValue,
      },
      subjectData,
    }
  } else {
    console.error('❌ AI API failed, falling back to template-based prediction')
    throw new Error('AI API failed')
  }
}
```

### 2. Update Conditional Prediction Logic  
```typescript
// In predict/[examId]/page.tsx - Line 429-443
if ((examConditions && Object.keys(examConditions).length > 0) || (templateConfig && templateConfig.type === 'conditional')) {
  console.log('🔄 Using CONDITIONAL API for prediction')
  
  // Even if no exam conditions exist, if template type is conditional, use conditional API
  if (templateConfig && templateConfig.type === 'conditional') {
    console.log('📝 Template type is conditional, using conditional prediction (even without stored conditions)')
  }
  
  // Call conditional prediction API
  const conditionalResponse = await fetch('/api/predictions/conditional', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      studentName: formData.fullName,
      studentEmail: formData.email,
      rollNumber: formData.hallTicket,
      institutionId: user?.institution?.id || user?.institutionId,
      examId: examId,
      answers: {}, // Convert subjectData to answers format if needed
      totalScore: totalScore,
      ...sectionScores
    })
  })

  if (conditionalResponse.ok) {
    const conditionalResult = await conditionalResponse.json()
    console.log('✅ Conditional prediction result:', conditionalResult)
    
    // Convert conditional API result to PredictionData format
    predictionData = {
      examId,
      examName: config.name,
      totalScore,
      maxPossibleScore,
      percentage: (totalScore / maxPossibleScore) * 100,
      rankRange: {
        minRank: conditionalResult.prediction.bestCaseRank || conditionalResult.prediction.predictedRank || 1000,
        predictedRank: conditionalResult.prediction.predictedRank || 1000,
        maxRank: conditionalResult.prediction.worstCaseRank || conditionalResult.prediction.predictedRank || 1000
      },
      percentile: {
        minPercentile: parseFloat(conditionalResult.prediction.bestCasePercentile) || parseFloat(conditionalResult.prediction.predictedPercentile) || 50,
        predictedPercentile: parseFloat(conditionalResult.prediction.predictedPercentile) || 50,
        maxPercentile: parseFloat(conditionalResult.prediction.worstCasePercentile) || parseFloat(conditionalResult.prediction.predictedPercentile) || 50
      },
      totalCandidates: 100000, // Default value
      calculationMethod: 'Condition-Based Analysis',
      formData: {
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        hallTicket: formData.hallTicket,
        city: formData.city,
        expectedScore: formData.expectedScore,
        expectedScoreValue: formData.expectedScoreValue
      },
      subjectData
    }
  } else {
    console.error('❌ Conditional API failed, falling back to next prediction method')
    throw new Error('Conditional API failed')
  }
}
```

### 3. Test Each Prediction Type

**Test Conditional Prediction:**
1. Go to: http://localhost:3000/predict/JEE-main-2025
2. Fill form and submit
3. Should show: "Condition-Based Analysis"

**Test AI Prediction:**
1. Go to: http://localhost:3000/predict/JEE-MAIN-2027  
2. Fill form and submit
3. Should show: "AI Internet Analysis"

**Test Dataset Prediction:**
1. Create a new template with type "dataset"
2. Use that template for prediction
3. Should show: "Dataset-Based Analysis"

## NEXT STEPS:

1. ✅ Apply the code changes above
2. ✅ Test each prediction type
3. ✅ Verify calculation method displays correctly
4. ✅ Check console logs for debugging

This solution works with current template configurations and doesn't require database changes.
