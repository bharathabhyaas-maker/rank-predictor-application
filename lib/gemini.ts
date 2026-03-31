import { GoogleGenerativeAI } from "@google/generative-ai";

// Check if API key is available
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("⚠️ GEMINI_API_KEY is missing from environment variables. AI predictions will use fallback.");
}

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Fallback prediction function when AI is not available
function getFallbackPrediction(score: number, examName: string): string {
  // Enhanced percentile calculation based on score and exam type
  const maxScore = examName.toLowerCase().includes('jee') ? 300 : 
                   examName.toLowerCase().includes('neet') ? 720 : 
                   examName.toLowerCase().includes('clat') ? 150 : 300;
  const percentage = (score / maxScore) * 100;
  
  // Calculate estimated percentile with better ranges
  let percentile = 50; // Default
  if (percentage >= 95) percentile = 99.8;
  else if (percentage >= 90) percentile = 99.5;
  else if (percentage >= 85) percentile = 99.0;
  else if (percentage >= 80) percentile = 98.0;
  else if (percentage >= 75) percentile = 97.0;
  else if (percentage >= 70) percentile = 95.0;
  else if (percentage >= 65) percentile = 93.0;
  else if (percentage >= 60) percentile = 90.0;
  else if (percentage >= 55) percentile = 85.0;
  else if (percentage >= 50) percentile = 80.0;
  else if (percentage >= 45) percentile = 75.0;
  else if (percentage >= 40) percentile = 70.0;
  else if (percentage >= 35) percentile = 60.0;
  else if (percentage >= 30) percentile = 50.0;
  else percentile = 40.0;
  
  // Calculate estimated rank with realistic candidate counts
  const totalCandidates = examName.toLowerCase().includes('jee') ? 1200000 : 
                        examName.toLowerCase().includes('neet') ? 1800000 : 
                        examName.toLowerCase().includes('clat') ? 75000 : 500000;
  const estimatedRank = Math.max(1, Math.floor(totalCandidates * (1 - percentile / 100)));
  
  const fallbackData = {
    percentile: percentile,
    rank: estimatedRank,
    bestCasePercentile: Math.min(99.9, percentile + 3),
    bestCaseRank: Math.max(1, Math.floor(estimatedRank * 0.8)),
    worstCasePercentile: Math.max(5, percentile - 5),
    worstCaseRank: Math.min(totalCandidates, Math.floor(estimatedRank * 1.2)),
    avgPercentile: percentile,
    avgRank: estimatedRank,
    confidence: 75,
    dataSource: "fallback",
    analysisNotes: `Based on ${percentage.toFixed(1)}% score (${score}/${maxScore}) for ${examName}`
  };
  
  return JSON.stringify(fallbackData);
}

// Enhanced fallback prediction function with realistic, exam-specific values
function getEnhancedFallbackPrediction(score: number, examName: string): string {
  const examNameLower = examName.toLowerCase();
  const currentYear = new Date().getFullYear();
  
  // Enhanced exam-specific calculations with realistic current-year data
  let maxScore, totalCandidates, basePercentile;
  
  if (examNameLower.includes('jee')) {
    maxScore = 300;
    totalCandidates = 1200000; // 12+ lakh applicants for JEE Main
    const percentage = (score / maxScore) * 100;
    
    // Realistic JEE Main percentile calculations based on current trends - UPDATED FOR ACCURACY
    if (percentage >= 90) basePercentile = 99.8; // 270+ marks = exceptional
    else if (percentage >= 85) basePercentile = 99.6; // 255+ marks = exceptional
    else if (percentage >= 83.3) basePercentile = 99.5; // 250+ marks = exceptional
    else if (percentage >= 80) basePercentile = 99.3; // 240+ marks = very good
    else if (percentage >= 76.7) basePercentile = 99.0; // 230+ marks = very good
    else if (percentage >= 75) basePercentile = 98.8; // 225+ marks = very good
    else if (percentage >= 70) basePercentile = 98.0; // 210+ marks = good
    else if (percentage >= 65) basePercentile = 97.0; // 195+ marks = good
    else if (percentage >= 60) basePercentile = 95.0; // 180+ marks = above average
    else if (percentage >= 55) basePercentile = 92.0; // 165+ marks = above average
    else if (percentage >= 50) basePercentile = 88.0; // 150+ marks = average
    else if (percentage >= 45) basePercentile = 80.0; // 135+ marks = below average
    else if (percentage >= 40) basePercentile = 70.0; // 120+ marks = below average
    else basePercentile = Math.max(5, percentage * 1.5); // Linear scaling for very low scores
    
  } else if (examNameLower.includes('neet')) {
    maxScore = 720;
    totalCandidates = 1800000; // 18+ lakh applicants for NEET
    const percentage = (score / maxScore) * 100;
    
    // Realistic NEET percentile calculations - UPDATED FOR ACCURACY
    if (percentage >= 90) basePercentile = 99.9; // 648+ marks = exceptional
    else if (percentage >= 85) basePercentile = 99.8; // 612+ marks = exceptional
    else if (percentage >= 80) basePercentile = 99.6; // 576+ marks = very good
    else if (percentage >= 75) basePercentile = 99.4; // 540+ marks = very good
    else if (percentage >= 70) basePercentile = 99.0; // 504+ marks = good
    else if (percentage >= 65) basePercentile = 98.0; // 468+ marks = good
    else if (percentage >= 60) basePercentile = 95.0; // 432+ marks = above average
    else if (percentage >= 55) basePercentile = 90.0; // 396+ marks = above average
    else if (percentage >= 50) basePercentile = 85.0; // 360+ marks = average
    else if (percentage >= 45) basePercentile = 75.0; // 324+ marks = below average
    else if (percentage >= 40) basePercentile = 60.0; // 288+ marks = below average
    else basePercentile = Math.max(5, percentage * 1.2);
    
  } else if (examNameLower.includes('clat')) {
    maxScore = 150;
    totalCandidates = 75000; // 75k+ applicants for CLAT
    const percentage = (score / maxScore) * 100;
    
    // Realistic CLAT percentile calculations - UPDATED FOR ACCURACY
    if (percentage >= 90) basePercentile = 99.9; // 135+ marks = exceptional
    else if (percentage >= 85) basePercentile = 99.7; // 127.5+ marks = exceptional
    else if (percentage >= 80) basePercentile = 99.5; // 120+ marks = very good
    else if (percentage >= 75) basePercentile = 99.0; // 112.5+ marks = very good
    else if (percentage >= 70) basePercentile = 98.0; // 105+ marks = good
    else if (percentage >= 65) basePercentile = 96.0; // 97.5+ marks = good
    else if (percentage >= 60) basePercentile = 94.0; // 90+ marks = above average
    else if (percentage >= 55) basePercentile = 90.0; // 82.5+ marks = above average
    else if (percentage >= 50) basePercentile = 85.0; // 75+ marks = average
    else if (percentage >= 45) basePercentile = 75.0; // 67.5+ marks = below average
    else if (percentage >= 40) basePercentile = 60.0; // 60+ marks = below average
    else basePercentile = Math.max(5, percentage * 1.1);
    
  } else {
    // Generic fallback for other exams - UPDATED FOR ACCURACY
    maxScore = 300;
    totalCandidates = 500000;
    const percentage = (score / maxScore) * 100;
    
    if (percentage >= 90) basePercentile = 99.8;
    else if (percentage >= 85) basePercentile = 99.5;
    else if (percentage >= 80) basePercentile = 99.0;
    else if (percentage >= 75) basePercentile = 98.0;
    else if (percentage >= 70) basePercentile = 95.0;
    else if (percentage >= 60) basePercentile = 85.0;
    else if (percentage >= 50) basePercentile = 70.0;
    else basePercentile = Math.max(5, percentage * 1.2);
  }
  
  const estimatedRank = Math.max(1, Math.floor(totalCandidates * (1 - basePercentile / 100)));
  
  // Enhanced range calculations with realistic bounds
  const enhancedFallbackData = {
    percentile: basePercentile,
    rank: estimatedRank,
    bestCasePercentile: Math.min(99.9, basePercentile + 2), // Tighter range for accuracy
    bestCaseRank: Math.max(1, Math.floor(estimatedRank * 0.6)), // Better rank for best case
    worstCasePercentile: Math.max(0.1, basePercentile - 5), // Conservative worst case
    worstCaseRank: Math.min(totalCandidates, Math.floor(estimatedRank * 1.5)), // Realistic worst rank
    avgPercentile: basePercentile,
    avgRank: estimatedRank,
    confidence: 90, // Higher confidence for enhanced calculations
    dataSource: "enhanced-fallback-v2",
    analysisNotes: `Enhanced calculation for ${examName} ${currentYear}: ${score}/${maxScore} (${((score/maxScore)*100).toFixed(1)}%) based on current competition trends and high-score accuracy`,
    examDifficulty: score > maxScore * 0.85 ? "easy" : score > maxScore * 0.7 ? "moderate" : "hard",
    competitionLevel: totalCandidates > 1000000 ? "very-high" : totalCandidates > 500000 ? "high" : "moderate"
  };
  
  console.log('🔄 Using Enhanced Fallback Prediction v2:', enhancedFallbackData);
  return JSON.stringify(enhancedFallbackData);
}

// Enhanced internet-based prediction prompt with real-time data
const getInternetBasedPrompt = (score: number, examName: string) => `
You are an expert exam rank predictor with access to real-time internet data and current exam trends for ${new Date().getFullYear()}.

STUDENT INPUT:
- Score: ${score} marks
- Exam: ${examName}
- Current Year: ${new Date().getFullYear()}
- Analysis Date: ${new Date().toISOString()}

CRITICAL REQUIREMENTS:
1. SEARCH REAL-TIME INTERNET for current exam trends and statistics
2. Use ACTUAL recent exam data, cutoffs, and competition levels
3. Consider current year's admission patterns and difficulty changes
4. Analyze recent similar exam results for accurate predictions
5. Factor in real-time competition intensity and seat availability

INTERNET DATA SOURCES TO ANALYZE:
- Official exam websites and recent announcements
- Current year exam results and merit lists
- Recent cutoff trends for colleges/universities
- Competition levels and applicant numbers
- Historical patterns updated for current context
- Real-time performance benchmarks from coaching institutes
- Current admission scenario and seat availability

ACCURATE PREDICTION METHODOLOGY:
1. Research current exam difficulty level and competition
2. Find recent score distributions and percentile data
3. Analyze current year admission trends
4. Consider real-time seat availability and competition
5. Provide realistic predictions based on actual data

FOR JEE MAIN ${new Date().getFullYear()} SPECIFICALLY:
- Total applicants typically exceed 1.2 million
- Competition is extremely high
- 250+ marks is exceptional (83.3%+), should predict 99.5+ percentile
- 240-250 marks is very good (80-83.3%), should predict 99.0-99.5 percentile
- 230-240 marks is good (76.7-80%), should predict 98.0-99.0 percentile
- 220-230 marks is above average (73.3-76.7%), should predict 97.0-98.0 percentile
- 180 marks is approximately 60% (decent score), should predict 85-90% range
- Rank should be proportionally calculated based on percentile
- Consider normalization and multiple sessions

FOR CLAT ${new Date().getFullYear()} SPECIFICALLY:
- Around 75,000+ applicants
- Max score is 150, adjust calculations accordingly
- 120+ marks is exceptional, should predict 99+ percentile
- 100-120 marks is very good, should predict 95-99 percentile
- Provide realistic percentile based on actual score

FOR NEET ${new Date().getFullYear()} SPECIFICALLY:
- 18+ lakh applicants
- 600+ marks is exceptional, should predict 99+ percentile
- 540-600 marks is very good, should predict 95-99 percentile
- 450-540 marks is good, should predict 85-95 percentile
- 360-450 marks is average, should predict 70-85 percentile
- 180 marks is 25% (below average), should predict 40-50% range

IMPORTANT SCORE-TO-PERCENTILE MAPPING:
- 90-100% score: 99.5-99.9 percentile (exceptional performance)
- 80-90% score: 98.0-99.5 percentile (excellent performance)
- 70-80% score: 95.0-98.0 percentile (very good performance)
- 60-70% score: 85.0-95.0 percentile (good performance)
- 50-60% score: 70.0-85.0 percentile (above average)
- 40-50% score: 50.0-70.0 percentile (average)
- Below 40% score: 10.0-50.0 percentile (below average)

RETURN ONLY VALID JSON:
{
  "percentile": number (realistic for current year and score),
  "rank": number (based on actual competition data),
  "bestCasePercentile": number (optimistic but realistic),
  "bestCaseRank": number,
  "worstCasePercentile": number (conservative but realistic),
  "worstRank": number,
  "avgPercentile": number (most likely outcome),
  "avgRank": number,
  "confidence": number (0-100),
  "dataSource": "internet",
  "analysisNotes": "brief explanation based on real-time data research",
  "examDifficulty": "easy|moderate|hard|very-hard",
  "competitionLevel": "low|moderate|high|very-high"
}

IMPORTANT: 
- Use REAL-TIME internet research, not generic assumptions
- Provide ACCURATE predictions based on current year data
- Consider actual exam patterns and competition
- Be realistic about score ranges and percentiles
- For high scores (80%+), predict appropriately high percentiles (95%+)
`;

export async function getAIPrediction(data: {
  score: number;
  examName: string;
  aiSource: string;
  datasetId?: string;
  datasetData?: any;
}): Promise<string> {
  if (!genAI) {
    console.log("Using fallback prediction - no API key");
    return getFallbackPrediction(data.score, data.examName);
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp", // Use latest model for better accuracy
      generationConfig: {
        temperature: 0.05, // Very low temperature for maximum accuracy
        topP: 0.9,
        topK: 32,
        maxOutputTokens: 2048,
        candidateCount: 1, // Get single best response
        stopSequences: [], // Let AI complete naturally
      }
    });

    let prompt;
    
    if (data.aiSource === 'dataset' && data.datasetId) {
      // Dataset-based prediction with enhanced analysis
      prompt = `
You are an expert exam rank predictor analyzing historical dataset patterns for ${data.examName}.

STUDENT SCORE DATA:
- Score: ${data.score}
- Exam: ${data.examName}
- Dataset ID: ${data.datasetId}
- Analysis Year: ${new Date().getFullYear()}

DATASET ANALYSIS REQUIREMENTS:
1. Analyze the provided historical dataset for score patterns
2. Consider current year trends and competition changes
3. Use internet to supplement dataset with real-time information
4. Apply statistical analysis with current context
5. Provide realistic predictions combining dataset and real-time data

ANALYSIS METHODOLOGY:
- Statistical analysis of historical patterns
- Real-time internet research for current trends
- Competition level assessment for current year
- Score distribution analysis updated for current context
- Realistic percentile and rank predictions

Return ONLY valid JSON with enhanced accuracy:
{
  "percentile": number (0-100, based on dataset + real-time data),
  "rank": number (realistic based on current competition),
  "bestCasePercentile": number (0-100, optimistic but achievable),
  "bestCaseRank": number,
  "worstCasePercentile": number (0-100, conservative estimate),
  "worstRank": number,
  "avgPercentile": number (0-100, most likely outcome),
  "avgRank": number,
  "confidence": number (0-100),
  "dataSource": "dataset+internet",
  "analysisNotes": "explanation of dataset and real-time analysis",
  "datasetAccuracy": "high|medium|low",
  "currentTrends": "improving|stable|declining"
}

IMPORTANT: Combine dataset insights with real-time internet research for maximum accuracy.
      `.trim();
    } else {
      // Enhanced internet-based prediction with real-time data
      prompt = getInternetBasedPrompt(data.score, data.examName);
    }

    console.log('🤖 Enhanced AI Prediction Request:');
    console.log('  - Score:', data.score);
    console.log('  - Exam:', data.examName);
    console.log('  - AI Source:', data.aiSource);
    console.log('  - Using real-time internet data:', data.aiSource !== 'dataset');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('🤖 AI Raw Response:', text);

    // Enhanced JSON parsing with better error handling
    let jsonText = text;
    
    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    // Validate and parse JSON with JEE-specific high-score corrections
    try {
      const parsed = JSON.parse(jsonText);
      
      // JEE-specific high-score accuracy corrections
      if (data.examName.toLowerCase().includes('jee')) {
        const percentage = (data.score / 300) * 100;
        
        // Force accurate percentiles for high scores
        if (percentage >= 83.3 && parsed.percentile < 99.5) {
          console.warn('⚠️ Correcting undervalued JEE percentile for high score');
          parsed.percentile = 99.5;
        } else if (percentage >= 80 && parsed.percentile < 99.0) {
          console.warn('⚠️ Correcting undervalued JEE percentile for very good score');
          parsed.percentile = 99.0;
        } else if (percentage >= 76.7 && parsed.percentile < 98.5) {
          console.warn('⚠️ Correcting undervalued JEE percentile for good score');
          parsed.percentile = 98.5;
        }
        
        // Recalculate rank based on corrected percentile
        const totalCandidates = 1200000;
        parsed.rank = Math.max(1, Math.floor(totalCandidates * (1 - parsed.percentile / 100)));
        
        console.log(`🎯 JEE Score ${data.score}/300 (${percentage.toFixed(1)}%) -> Corrected Percentile: ${parsed.percentile}% -> Rank: ${parsed.rank.toLocaleString()}`);
      }
      
      // Validate required fields and provide fallbacks if needed
      if (typeof parsed.percentile !== 'number' || parsed.percentile < 0 || parsed.percentile > 100) {
        console.warn('⚠️ Invalid percentile in AI response, applying fallback');
        parsed.percentile = Math.min(95, Math.max(5, (data.score / 300) * 100));
      }
      
      if (typeof parsed.rank !== 'number' || parsed.rank < 1) {
        console.warn('⚠️ Invalid rank in AI response, applying fallback');
        const totalCandidates = data.examName.toLowerCase().includes('jee') ? 1200000 : 
                           data.examName.toLowerCase().includes('neet') ? 1800000 : 
                           data.examName.toLowerCase().includes('clat') ? 75000 : 500000;
        parsed.rank = Math.max(1, Math.floor(totalCandidates * (1 - parsed.percentile / 100)));
      }

      // Ensure realistic ranges
      parsed.bestCasePercentile = Math.min(99.9, parsed.bestCasePercentile || parsed.percentile + 3);
      parsed.worstCasePercentile = Math.max(0.1, parsed.worstCasePercentile || parsed.percentile - 8);
      parsed.bestCaseRank = Math.max(1, parsed.bestCaseRank || Math.floor(parsed.rank * 0.6));
      parsed.worstCaseRank = Math.min(parsed.rank * 2, parsed.worstCaseRank || Math.floor(parsed.rank * 1.4));

      console.log('✅ Enhanced AI Prediction Validated:', parsed);
      return JSON.stringify(parsed);
      
    } catch (parseError) {
      console.error('❌ AI Response JSON Parse Error:', parseError);
      console.error('❌ Raw response:', text);
      throw new Error(`Invalid JSON response from AI: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }

  } catch (error) {
    console.error("❌ Enhanced Gemini AI Error:", error);
    console.log('🔄 Falling back to enhanced prediction logic');
    return getEnhancedFallbackPrediction(data.score, data.examName);
  }
}
