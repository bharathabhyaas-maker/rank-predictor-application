// Rank prediction utility functions

export interface SubjectData {
  name: string
  attempted: string
  correct: string
}

export interface ExamConfig {
  id?: string // Optional template ID for saving predictions
  name: string
  type?: string
  description?: string
  promptTemplate?: string
  placeholders?: any
  subjects: {
    name: string
    totalQuestions: number
    positiveMarks: number
    negativeMarks: number
  }[]
  requireHallTicket: boolean
  askExpectedScore: boolean
  collectCity: boolean
}

export interface PredictionData {
  examId: string
  examName: string
  totalScore: number
  maxPossibleScore: number
  percentage: number
  rankRange: {
    minRank: number
    predictedRank: number
    maxRank: number
  }
  percentile: {
    minPercentile: number
    predictedPercentile: number
    maxPercentile: number
  }
  totalCandidates: number
  calculationMethod: string
  formData: {
    email: string
    fullName: string
    phone: string
    hallTicket: string
    city: string
    expectedScore: string
    expectedScoreValue: string
  }
  subjectData: SubjectData[]
}

// ─── Fallback exam statistics ─────────────────────────────────────────────────
// Used when DB/conditions don't supply candidateCount.
// These are real-world numbers — DB values always take priority over these.
const EXAM_DEFAULTS: Record<string, {
  totalCandidates: number
  averageScore: number
  stdDevFraction: number  // stdDev = maxScore * fraction
}> = {
  'jee':  { totalCandidates: 1200000, averageScore: 180, stdDevFraction: 0.15 },
  'neet': { totalCandidates: 1800000, averageScore: 420, stdDevFraction: 0.15 },
  'clat': { totalCandidates: 65000,   averageScore: 85,  stdDevFraction: 0.15 },
  'cat':  { totalCandidates: 350000,  averageScore: 95,  stdDevFraction: 0.15 },
}

/**
 * Case-insensitive match: "jee-25", "JEE-MAIN-2025", "jee25" → "jee"
 */
function getExamDefaults(examCode: string) {
  const lower = examCode.toLowerCase()
  for (const key of Object.keys(EXAM_DEFAULTS)) {
    if (lower.includes(key)) return { key, ...EXAM_DEFAULTS[key] }
  }
  return null
}

// ─── Normal CDF (Abramowitz & Stegun, ~7 decimal place accuracy) ─────────────
function normalCDF(z: number): number {
  const sign = z < 0 ? -1 : 1
  const absZ = Math.abs(z)
  const t = 1 / (1 + 0.2316419 * absZ)
  const poly =
    t * (0.319381530 +
    t * (-0.356563782 +
    t * (1.781477937 +
    t * (-1.821255978 +
    t * 1.330274429))))
  const pdf = Math.exp(-0.5 * absZ * absZ) / Math.sqrt(2 * Math.PI)
  const cdf = 1 - pdf * poly
  return sign === 1 ? cdf : 1 - cdf
}

function zScoreToPercentile(z: number): number {
  return Math.min(99.9, Math.max(0.1, normalCDF(z) * 100))
}
// ─────────────────────────────────────────────────────────────────────────────

export function calculateScore(
  subjectData: SubjectData[],
  subjects: ExamConfig['subjects']
): number {
  let totalScore = 0

  subjectData.forEach((subject, index) => {
    const subjectConfig = subjects[index]
    if (!subjectConfig) return

    const attempted = parseInt(subject.attempted) || 0
    const correct   = parseInt(subject.correct)   || 0

    const validAttempted = Math.min(attempted, subjectConfig.totalQuestions)
    const validCorrect   = Math.min(correct, validAttempted)
    const incorrect      = validAttempted - validCorrect

    const subjectScore =
      validCorrect * subjectConfig.positiveMarks -
      incorrect   * subjectConfig.negativeMarks
    totalScore += Math.max(0, subjectScore)
  })

  return totalScore
}

export function calculateMaxPossibleScore(subjects: ExamConfig['subjects']): number {
  return subjects.reduce((total, subject) => {
    return total + subject.totalQuestions * subject.positiveMarks
  }, 0)
}

// ─── Shared core calculation (used by both exported functions) ────────────────
function computePrediction({
  examId,
  examName,
  score,
  maxScore,
  formData,
  subjectData,
  candidateCountOverride,
  averageScoreOverride,
  stdDevOverride,
  difficulty,
  examCodeForLookup,
  calculationMethod,
}: {
  examId: string
  examName: string
  score: number
  maxScore: number
  formData: any
  subjectData: SubjectData[]
  candidateCountOverride?: number
  averageScoreOverride?: number
  stdDevOverride?: number
  difficulty?: string
  examCodeForLookup: string
  calculationMethod: string
}): PredictionData {

  const defaults = getExamDefaults(examCodeForLookup)

  // Priority: DB/conditions override → known exam defaults → last-resort fallback
  const totalCandidates =
    (candidateCountOverride && candidateCountOverride > 0
      ? candidateCountOverride
      : defaults?.totalCandidates) ?? 500000

  const averageScore =
    (averageScoreOverride && averageScoreOverride > 0
      ? averageScoreOverride
      : defaults?.averageScore) ?? maxScore * 0.5

  const stdDev =
    (stdDevOverride && stdDevOverride > 0
      ? stdDevOverride
      : defaults
        ? maxScore * defaults.stdDevFraction
        : maxScore * 0.15)

  const difficultyMultiplier = getDifficultyMultiplier(difficulty || 'Moderate')
  const percentage = (score / maxScore) * 100

  // ✅ Case-insensitive exam type check
  const isJEE = examCodeForLookup.toLowerCase().includes('jee')

  let predictedPercentile: number

  if (isJEE) {
    // Lookup table for top score bands; normal CDF for lower scores
    if      (percentage >= 99) predictedPercentile = 99.8
    else if (percentage >= 98) predictedPercentile = 99.5
    else if (percentage >= 95) predictedPercentile = 99.0
    else if (percentage >= 90) predictedPercentile = 97.5
    else if (percentage >= 85) predictedPercentile = 95.0
    else if (percentage >= 80) predictedPercentile = 92.0
    else if (percentage >= 75) predictedPercentile = 88.0
    else if (percentage >= 70) predictedPercentile = 83.0
    else {
      const jeeStdDev = maxScore * 0.12
      const z = (score - averageScore) / (jeeStdDev * difficultyMultiplier)
      predictedPercentile = zScoreToPercentile(z)
    }
  } else {
    const z = (score - averageScore) / (stdDev * difficultyMultiplier)
    predictedPercentile = zScoreToPercentile(z)
  }

  // Small additive nudge — NOT multiplicative (avoids systematic deflation)
  const adjustment =
    (formData.provideSectionData === "no" ? -1.5 : 0) +
    (formData.city ? 0.5 : 0) +
    (formData.expectedScore === "yes" ? 0.5 : 0)

  const adjustedPercentile = Math.min(99.9, Math.max(0.1,
    predictedPercentile + adjustment
  ))

  const predictedRank = Math.max(1,
    Math.floor(totalCandidates * (1 - adjustedPercentile / 100))
  )
  const bestRank  = Math.max(1, Math.floor(predictedRank * 0.7))
  const worstRank = Math.min(totalCandidates, Math.floor(predictedRank * 1.3))

  // bestRank = lowest number = highest percentile
  const bestPercentile  = ((totalCandidates - bestRank)  / totalCandidates) * 100
  const worstPercentile = ((totalCandidates - worstRank) / totalCandidates) * 100

  return {
    examId,
    examName,
    totalScore: score,
    maxPossibleScore: maxScore,
    percentage,
    rankRange: {
      minRank: bestRank,
      predictedRank,
      maxRank: worstRank,
    },
    percentile: {
      minPercentile:       Math.max(0,    worstPercentile),
      predictedPercentile: adjustedPercentile,
      maxPercentile:       Math.min(99.9, bestPercentile),
    },
    totalCandidates,
    calculationMethod,
    formData: {
      email:              formData.email,
      fullName:           formData.fullName,
      phone:              formData.phone,
      hallTicket:         formData.hallTicket,
      city:               formData.city,
      expectedScore:      formData.expectedScore,
      expectedScoreValue: formData.expectedScoreValue,
    },
    subjectData,
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export function predictRankFromTemplate(
  examId: string,
  score: number,
  maxScore: number,
  formData: any,
  subjectData: SubjectData[],
  config: ExamConfig,
  templateConfig: any,
  examConditions?: any
): PredictionData {
  const conditions   = examConditions        || {}
  const placeholders = templateConfig.placeholders || {}

  // Pass 0 when not found so computePrediction falls back to EXAM_DEFAULTS
  const candidateCount =
    parseInt(conditions.candidateCount)   ||
    parseInt(placeholders.candidateCount) ||
    0

  const averageScore =
    conditions.averageScore    ||
    conditions.historicalAvg   ||
    parseInt(placeholders.historicalAvg) ||
    0

  return computePrediction({
    examId,
    examName:              templateConfig.name || config.name,
    score,
    maxScore,
    formData,
    subjectData,
    candidateCountOverride: candidateCount,
    averageScoreOverride:   averageScore,
    difficulty:             conditions.difficulty || placeholders.difficulty,
    // ✅ Use templateConfig.examCode (e.g. "jee-25") for the lookup
    examCodeForLookup:      templateConfig.examCode || examId,
    calculationMethod:
      templateConfig.type === "ai"
        ? "AI-Based Template Analysis"
        : "Dataset-Based Analysis",
  })
}

export function predictRank(
  examId: string,
  score: number,
  maxScore: number,
  formData: any,
  subjectData: SubjectData[],
  config: ExamConfig,
  examConditions?: any
): PredictionData {
  const conditions = examConditions || {}

  return computePrediction({
    examId,
    examName:              config.name,
    score,
    maxScore,
    formData,
    subjectData,
    candidateCountOverride:  conditions.candidateCount    || 0,
    averageScoreOverride:    conditions.averageScore      || 0,
    stdDevOverride:          conditions.standardDeviation || 0,
    difficulty:              conditions.difficulty,
    examCodeForLookup:       examId,
    calculationMethod:       "AI-Based Statistical Analysis",
  })
}

function getDifficultyMultiplier(difficulty: string): number {
  switch (difficulty.toLowerCase()) {
    case 'easy':           return 0.8
    case 'moderate':       return 1.0
    case 'difficult':      return 1.2
    case 'very difficult': return 1.4
    default:               return 1.0
  }
}