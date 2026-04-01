import { GoogleGenerativeAI } from "@google/generative-ai";

// Check if API key is available
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("⚠️ GEMINI_API_KEY is missing from environment variables. AI predictions will use fallback.");
}

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Fallback prediction function when AI is not available
function getFallbackPrediction(score: number, examName: string): string {
  // Redirect to enhanced fallback for better accuracy
  return getEnhancedFallbackPrediction(score, examName);
}

// Enhanced fallback prediction function with realistic, exam-specific values
function getEnhancedFallbackPrediction(score: number, examName: string): string {
  const examNameLower = examName.toLowerCase();
  const currentYear = new Date().getFullYear();

  let maxScore: number, totalCandidates: number, basePercentile: number;

  if (examNameLower.includes('jee')) {
    maxScore = 300;
    totalCandidates = 1200000;
    const percentage = (score / maxScore) * 100;

    if (percentage >= 90) basePercentile = 99.8;
    else if (percentage >= 85) basePercentile = 99.6;
    else if (percentage >= 83.3) basePercentile = 99.5;
    else if (percentage >= 80) basePercentile = 99.3;
    else if (percentage >= 76.7) basePercentile = 99.0;
    else if (percentage >= 75) basePercentile = 98.8;
    // FIX BUG 2: Added missing 70-76.7% band
    else if (percentage >= 73.3) basePercentile = 97.5;
    else if (percentage >= 70) basePercentile = 97.0;
    else if (percentage >= 65) basePercentile = 95.0;
    else if (percentage >= 60) basePercentile = 92.0;
    else if (percentage >= 55) basePercentile = 88.0;
    else if (percentage >= 50) basePercentile = 82.0;
    else if (percentage >= 45) basePercentile = 75.0;
    else if (percentage >= 40) basePercentile = 65.0;
    else basePercentile = Math.max(5, percentage * 1.5);

  } else if (examNameLower.includes('neet')) {
    maxScore = 720;
    totalCandidates = 1800000;
    const percentage = (score / maxScore) * 100;

    if (percentage >= 90) basePercentile = 99.9;
    else if (percentage >= 85) basePercentile = 99.8;
    else if (percentage >= 80) basePercentile = 99.6;
    else if (percentage >= 75) basePercentile = 99.4;
    else if (percentage >= 70) basePercentile = 99.0;
    else if (percentage >= 65) basePercentile = 98.0;
    else if (percentage >= 60) basePercentile = 95.0;
    else if (percentage >= 55) basePercentile = 90.0;
    else if (percentage >= 50) basePercentile = 85.0;
    else if (percentage >= 45) basePercentile = 75.0;
    else if (percentage >= 40) basePercentile = 60.0;
    else basePercentile = Math.max(5, percentage * 1.2);

  } else if (examNameLower.includes('clat')) {
    maxScore = 150;
    totalCandidates = 75000;
    const percentage = (score / maxScore) * 100;

    if (percentage >= 90) basePercentile = 99.9;
    else if (percentage >= 85) basePercentile = 99.7;
    else if (percentage >= 80) basePercentile = 99.5;
    else if (percentage >= 75) basePercentile = 99.0;
    else if (percentage >= 70) basePercentile = 98.0;
    else if (percentage >= 65) basePercentile = 96.0;
    else if (percentage >= 60) basePercentile = 94.0;
    else if (percentage >= 55) basePercentile = 90.0;
    else if (percentage >= 50) basePercentile = 85.0;
    else if (percentage >= 45) basePercentile = 75.0;
    else if (percentage >= 40) basePercentile = 60.0;
    else basePercentile = Math.max(5, percentage * 1.1);

  } else {
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

  const enhancedFallbackData = {
    percentile: basePercentile,
    rank: estimatedRank,
    bestCasePercentile: Math.min(99.9, basePercentile + 2),
    bestCaseRank: Math.max(1, Math.floor(estimatedRank * 0.6)),
    worstCasePercentile: Math.max(0.1, basePercentile - 5),
    // FIX BUG 3: Use consistent key name "worstCaseRank" everywhere
    worstCaseRank: Math.min(totalCandidates, Math.floor(estimatedRank * 1.5)),
    avgPercentile: basePercentile,
    avgRank: estimatedRank,
    confidence: 90,
    dataSource: "enhanced-fallback-v3",
    analysisNotes: `Enhanced calculation for ${examName} ${currentYear}: ${score}/${maxScore} (${((score / maxScore) * 100).toFixed(1)}%) based on current competition trends`,
    examDifficulty: score > maxScore * 0.85 ? "easy" : score > maxScore * 0.7 ? "moderate" : "hard",
    competitionLevel: totalCandidates > 1000000 ? "very-high" : totalCandidates > 500000 ? "high" : "moderate"
  };

  console.log('🔄 Using Enhanced Fallback Prediction v3:', enhancedFallbackData);
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
- 220-230 marks (73.3-76.7%) → predict 97.0-98.0 percentile
- 210-220 marks (70-73.3%) → predict 95.0-97.0 percentile
- 180 marks is approximately 60% (decent score), should predict 88-92% range
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

RETURN ONLY VALID JSON (no markdown, no backticks):
{
  "percentile": number,
  "rank": number,
  "bestCasePercentile": number,
  "bestCaseRank": number,
  "worstCasePercentile": number,
  "worstCaseRank": number,
  "avgPercentile": number,
  "avgRank": number,
  "confidence": number,
  "dataSource": "internet",
  "analysisNotes": "brief explanation based on real-time data research",
  "examDifficulty": "easy|moderate|hard|very-hard",
  "competitionLevel": "low|moderate|high|very-high"
}

IMPORTANT:
- Use REAL-TIME internet research, not generic assumptions
- Provide ACCURATE predictions based on current year data
- For high scores (80%+), predict appropriately high percentiles (95%+)
- Return ONLY the raw JSON object, nothing else
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
    // FIX BUG 2: Use enhanced fallback instead of basic fallback
    return getEnhancedFallbackPrediction(data.score, data.examName);
  }

  try {
    // FIX BUG 1: Enable Google Search grounding for real-time internet data
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      // Google Search grounding — gives the model actual internet access
      tools: data.aiSource !== 'dataset' ? [{ googleSearch: {} }] : [],
      generationConfig: {
        temperature: 0.05,
        topP: 0.9,
        topK: 32,
        maxOutputTokens: 2048,
        candidateCount: 1,
      }
    } as any); // 'as any' because googleSearch tool typing may not be in older SDK versions

    let prompt: string;

    if (data.aiSource === 'dataset' && data.datasetId) {
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
3. Apply statistical analysis with current context
4. Provide realistic predictions combining dataset insights and known trends

Return ONLY valid JSON (no markdown, no backticks):
{
  "percentile": number,
  "rank": number,
  "bestCasePercentile": number,
  "bestCaseRank": number,
  "worstCasePercentile": number,
  "worstCaseRank": number,
  "avgPercentile": number,
  "avgRank": number,
  "confidence": number,
  "dataSource": "dataset+internet",
  "analysisNotes": "explanation of dataset and real-time analysis",
  "datasetAccuracy": "high|medium|low",
  "currentTrends": "improving|stable|declining"
}
      `.trim();
    } else {
      prompt = getInternetBasedPrompt(data.score, data.examName);
    }
    console.log('🤖 Enhanced AI Prediction Request:');
    console.log('  - Score:', data.score);
    console.log('  - Exam:', data.examName);
    console.log('  - AI Source:', data.aiSource);
    console.log('  - Google Search grounding enabled:', data.aiSource !== 'dataset');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('🤖 AI Raw Response:', text);

    // Extract JSON from response — strip markdown fences if present
    let jsonText = text.trim();
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    try {
      const parsed = JSON.parse(jsonText);

      // JEE-specific high-score accuracy corrections
      if (data.examName.toLowerCase().includes('jee')) {
        const percentage = (data.score / 300) * 100;

        // FIX BUG 2: Extended correction thresholds to cover 70-76.7% band
        if (percentage >= 83.3 && parsed.percentile < 99.5) {
          console.warn('⚠️ Correcting JEE percentile for 83.3%+ score');
          parsed.percentile = 99.5;
        } else if (percentage >= 80 && parsed.percentile < 99.0) {
          console.warn('⚠️ Correcting JEE percentile for 80%+ score');
          parsed.percentile = 99.0;
        } else if (percentage >= 76.7 && parsed.percentile < 98.5) {
          console.warn('⚠️ Correcting JEE percentile for 76.7%+ score');
          parsed.percentile = 98.5;
        } else if (percentage >= 73.3 && parsed.percentile < 97.5) {
          // NEW: covers 220-230 range
          console.warn('⚠️ Correcting JEE percentile for 73.3%+ score');
          parsed.percentile = 97.5;
        } else if (percentage >= 70 && parsed.percentile < 97.0) {
          // NEW: covers 210-220 range
          console.warn('⚠️ Correcting JEE percentile for 70%+ score');
          parsed.percentile = 97.0;
        }

        const totalCandidates = 1200000;
        parsed.rank = Math.max(1, Math.floor(totalCandidates * (1 - parsed.percentile / 100)));
        console.log(`🎯 JEE ${data.score}/300 (${percentage.toFixed(1)}%) → Percentile: ${parsed.percentile}% → Rank: ${parsed.rank.toLocaleString()}`);
      }

      // Validate percentile
      if (typeof parsed.percentile !== 'number' || parsed.percentile < 0 || parsed.percentile > 100) {
        console.warn('⚠️ Invalid percentile in AI response, applying enhanced fallback');
        return getEnhancedFallbackPrediction(data.score, data.examName);
      }

      // Validate rank
      if (typeof parsed.rank !== 'number' || parsed.rank < 1) {
        console.warn('⚠️ Invalid rank in AI response, recalculating');
        const totalCandidates = data.examName.toLowerCase().includes('jee') ? 1200000 :
          data.examName.toLowerCase().includes('neet') ? 1800000 :
          data.examName.toLowerCase().includes('clat') ? 75000 : 500000;
        parsed.rank = Math.max(1, Math.floor(totalCandidates * (1 - parsed.percentile / 100)));
      }

      // Ensure realistic ranges with consistent key names
      parsed.bestCasePercentile = Math.min(99.9, parsed.bestCasePercentile ?? parsed.percentile + 3);
      parsed.worstCasePercentile = Math.max(0.1, parsed.worstCasePercentile ?? parsed.percentile - 8);
      parsed.bestCaseRank = Math.max(1, parsed.bestCaseRank ?? Math.floor(parsed.rank * 0.6));

      // FIX BUG 3: Consistently use "worstCaseRank" — handle both old key name from AI and new
      const aiWorstRank = parsed.worstCaseRank ?? parsed.worstRank ?? null;
      parsed.worstCaseRank = Math.min(
        parsed.rank * 2,
        aiWorstRank ?? Math.floor(parsed.rank * 1.4)
      );
      // Clean up old key if AI returned it
      delete parsed.worstRank;

      console.log('✅ Enhanced AI Prediction Validated:', parsed);
      return JSON.stringify(parsed);

    } catch (parseError) {
      console.error('❌ AI Response JSON Parse Error:', parseError);
      console.error('❌ Raw response:', text);
      console.log('🔄 Falling back to enhanced prediction logic');
      return getEnhancedFallbackPrediction(data.score, data.examName);
    }

  } catch (error) {
    console.error("❌ Enhanced Gemini AI Error:", error);
    console.log('🔄 Falling back to enhanced prediction logic');
    // FIX BUG 2: Always use enhanced fallback, never basic fallback
    return getEnhancedFallbackPrediction(data.score, data.examName);
  }
}
