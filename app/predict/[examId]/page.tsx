"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  calculateScore,
  calculateMaxPossibleScore,
  predictRank,
  predictRankFromTemplate,
  type PredictionData,
  type ExamConfig,
} from "@/utils/rankPrediction"
import { useAuth } from "@/lib/auth-context"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SubjectEntry {
  name: string
  attempted: string
  correct: string
}

interface FormState {
  email: string
  fullName: string
  phone: string
  hallTicket: string
  city: string
  expectedScore: string
  expectedScoreValue: string
  provideSectionData: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDefaultSubjects(examCode: string) {
  const code = examCode.toLowerCase()
  if (code.includes("clat")) {
    return [
      { name: "English Language", totalQuestions: 24, positiveMarks: 1, negativeMarks: 0.25 },
      { name: "Current Affair Including GK", totalQuestions: 28, positiveMarks: 1, negativeMarks: 0.25 },
      { name: "Legal Reasoning", totalQuestions: 32, positiveMarks: 1, negativeMarks: 0.25 },
      { name: "Logical Reasoning", totalQuestions: 24, positiveMarks: 1, negativeMarks: 0.25 },
      { name: "Quantitative", totalQuestions: 12, positiveMarks: 1, negativeMarks: 0.25 },
    ]
  }
  if (code.includes("jee")) {
    return [
      { name: "Physics", totalQuestions: 25, positiveMarks: 4, negativeMarks: 1 },
      { name: "Chemistry", totalQuestions: 25, positiveMarks: 4, negativeMarks: 1 },
      { name: "Mathematics", totalQuestions: 25, positiveMarks: 4, negativeMarks: 1 },
    ]
  }
  if (code.includes("neet")) {
    return [
      { name: "Physics", totalQuestions: 50, positiveMarks: 4, negativeMarks: 1 },
      { name: "Chemistry", totalQuestions: 50, positiveMarks: 4, negativeMarks: 1 },
      { name: "Biology", totalQuestions: 50, positiveMarks: 4, negativeMarks: 1 },
    ]
  }
  return [
    { name: "Subject 1", totalQuestions: 25, positiveMarks: 1, negativeMarks: 0.25 },
    { name: "Subject 2", totalQuestions: 25, positiveMarks: 1, negativeMarks: 0.25 },
    { name: "Subject 3", totalQuestions: 25, positiveMarks: 1, negativeMarks: 0.25 },
  ]
}

function getSectionScore(subjectData: SubjectEntry[], subjects: ExamConfig["subjects"], keyword: string): number {
  const idx = subjects.findIndex((s) => s.name.toLowerCase().includes(keyword.toLowerCase()))
  if (idx === -1) return 0
  const subject = subjectData[idx]
  const subjectConfig = subjects[idx]
  if (!subject || !subjectConfig) return 0
  const attempted = Math.min(parseInt(subject.attempted) || 0, subjectConfig.totalQuestions)
  const correct = Math.min(parseInt(subject.correct) || 0, attempted)
  const incorrect = attempted - correct
  return Math.max(0, correct * subjectConfig.positiveMarks - incorrect * subjectConfig.negativeMarks)
}

const EMPTY_FORM: FormState = {
  email: "",
  fullName: "",
  phone: "",
  hallTicket: "",
  city: "",
  expectedScore: "no",
  expectedScoreValue: "",
  provideSectionData: "no",
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PredictRankPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = React.use(params)
  const router = useRouter()
  const { user } = useAuth()

  const [templateConfig, setTemplateConfig] = useState<ExamConfig | null>(null)
  const [examConditions, setExamConditions] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormState>(EMPTY_FORM)
  const [subjectData, setSubjectData] = useState<SubjectEntry[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const initializedConfigRef = useRef<string | null>(null)

  useEffect(() => {
    void loadTemplate(examId)
  }, [examId])

  // Timeout guard — prevent infinite loading spinner
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 5000)
    return () => clearTimeout(timer)
  }, [examId])

  const loadTemplate = async (examCode: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/templates?examCode=${examCode}`)
      if (res.ok) {
        const templates = await res.json()
        const match = templates.find(
          (t: any) => t.examCode.toLowerCase() === examCode.toLowerCase()
        )

        if (match) {
          setTemplateConfig({
            id: match.id,
            name: match.name,
            type: match.type,
            description: match.description,
            promptTemplate: match.promptTemplate,
            placeholders: match.placeholders,
            subjects: match.subjects ?? getDefaultSubjects(examCode),
            requireHallTicket: match.requireHallTicket ?? true,
            askExpectedScore: match.askExpectedScore ?? true,
            collectCity: match.collectCity ?? true,
          })
        } else {
          setTemplateConfig(buildFallback(examCode))
        }
      } else {
        setTemplateConfig(buildFallback(examCode))
      }

      // Load exam conditions separately
      try {
        const examRes = await fetch(`/api/exams?examCode=${examCode}`)
        if (examRes.ok) {
          const exams = await examRes.json()
          const exam = exams.find((e: any) => e.examCode.toLowerCase() === examCode.toLowerCase())
          if (exam?.conditions?.length) {
            setExamConditions(exam.conditions)
          }
        }
      } catch {
        // Conditions unavailable — continue without them
      }
    } catch {
      setTemplateConfig(buildFallback(examCode))
    } finally {
      setIsLoading(false)
    }
  }

  const buildFallback = (examCode: string): ExamConfig => ({
    id: examCode,
    name: examCode.replace(/-/g, " ").toUpperCase(),
    type: "dataset",
    description: "Fallback configuration",
    promptTemplate: "",
    placeholders: {},
    subjects: getDefaultSubjects(examCode),
    requireHallTicket: true,
    askExpectedScore: true,
    collectCity: true,
  })

  // -------------------------------------------------------------------------
  // Sync subjectData rows when config subjects change
  // -------------------------------------------------------------------------
  const config: ExamConfig = templateConfig ?? buildFallback(examId)

  useEffect(() => {
    if (!config.subjects?.length) return
    const key = config.subjects.map((s) => s.name).join("|")
    if (initializedConfigRef.current === key) return
    setSubjectData(config.subjects.map((s) => ({ name: s.name, attempted: "", correct: "" })))
    initializedConfigRef.current = key
  }, [config.subjects])

  // -------------------------------------------------------------------------
  // Institution ID resolution
  // -------------------------------------------------------------------------
  const getInstitutionId = async (): Promise<string | null> => {
    if (user?.institution?.id) return user.institution.id
    if (user?.institutionId) return user.institutionId
    if (templateConfig?.id) {
      try {
        const res = await fetch(`/api/templates?id=${templateConfig.id}`)
        if (res.ok) {
          const tpl = await res.json()
          if (tpl.assignments?.[0]?.institutionId) return tpl.assignments[0].institutionId
        }
      } catch {
        // Continue without institution
      }
    }
    return null
  }

  // -------------------------------------------------------------------------
  // Form handlers
  // -------------------------------------------------------------------------
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const handleSubjectChange = (index: number, field: string, value: string) => {
    setSubjectData((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.email) newErrors.email = "Email is required"
    if (!formData.fullName) newErrors.fullName = "Name is required"
    if (!formData.phone) newErrors.phone = "Phone number is required"
    if (config.requireHallTicket && !formData.hallTicket) newErrors.hallTicket = "Hall ticket number is required"
    if (config.collectCity && !formData.city) newErrors.city = "City is required"
    if (config.askExpectedScore && formData.expectedScore === "yes" && !formData.expectedScoreValue) {
      newErrors.expectedScoreValue = "Expected score is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || isSubmitting) return
    setIsSubmitting(true)

    try {
      const totalScore =
        formData.provideSectionData === "yes"
          ? calculateScore(subjectData, config.subjects)
          : parseInt(formData.expectedScoreValue) || 0

      const maxPossibleScore = calculateMaxPossibleScore(config.subjects)

      const sectionScores =
        formData.provideSectionData === "yes"
          ? {
              englishScore: getSectionScore(subjectData, config.subjects, "English"),
              reasoningScore:
                getSectionScore(subjectData, config.subjects, "Reasoning") ||
                getSectionScore(subjectData, config.subjects, "Logical"),
              legalScore: getSectionScore(subjectData, config.subjects, "Legal"),
              gkScore:
                getSectionScore(subjectData, config.subjects, "GK") ||
                getSectionScore(subjectData, config.subjects, "Current"),
              mathsScore:
                getSectionScore(subjectData, config.subjects, "Mathematics") ||
                getSectionScore(subjectData, config.subjects, "Quantitative"),
            }
          : {}

      let predictionData: PredictionData | null = null
      let predictionMethod = "default"

      // 1. Conditional API
      const hasConditions =
        (examConditions && examConditions.length > 0) ||
        templateConfig?.type === "conditional"

      if (hasConditions) {
        predictionMethod = "conditional"
        try {
          const institutionId = await getInstitutionId()
          const res = await fetch("/api/predictions/conditional", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentName: formData.fullName,
              studentEmail: formData.email,
              rollNumber: formData.hallTicket,
              institutionId,
              examId,
              answers: {},
              totalScore,
              ...sectionScores,
            }),
          })
          if (res.ok) {
            const result = await res.json()
            const p = result.prediction
            predictionData = buildPredictionData(examId, config, totalScore, maxPossibleScore, formData, subjectData, {
              minRank: p.bestCaseRank ?? p.predictedRank ?? 1000,
              predictedRank: p.predictedRank ?? 1000,
              maxRank: p.worstCaseRank ?? p.predictedRank ?? 1000,
              minPercentile: parseFloat(p.bestCasePercentile) || parseFloat(p.predictedPercentile) || 50,
              predictedPercentile: parseFloat(p.predictedPercentile) || 50,
              maxPercentile: parseFloat(p.worstCasePercentile) || parseFloat(p.predictedPercentile) || 50,
              totalCandidates: 100000,
              calculationMethod: "Condition-Based Prediction",
            })
          }
        } catch {
          predictionMethod = "ai"
        }
      }

      // 2. AI API
      if (!predictionData && templateConfig?.type === "ai") {
        predictionMethod = "ai"
        try {
          const institutionId = await getInstitutionId()
          const aiSource = templateConfig.placeholders?.aiSource || "internet"
          const res = await fetch("/api/predictions/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentName: formData.fullName,
              studentEmail: formData.email,
              rollNumber: formData.hallTicket,
              institutionId,
              examId,
              templateId: templateConfig.id ?? examId,
              totalScore,
              answers: subjectData,
              aiSource,
              datasetId: templateConfig.placeholders?.datasetId,
            }),
          })
          if (res.ok) {
            const result = await res.json()
            predictionData = buildPredictionData(examId, config, totalScore, maxPossibleScore, formData, subjectData, {
              minRank: result.bestCaseRank ?? result.rank ?? 1000,
              predictedRank: result.rank ?? 1000,
              maxRank: result.worstCaseRank ?? result.rank ?? 1000,
              minPercentile: result.bestCasePercentile ?? result.percentile ?? 50,
              predictedPercentile: result.percentile ?? 50,
              maxPercentile: result.worstCasePercentile ?? result.percentile ?? 50,
              totalCandidates: result.totalCandidates ?? 1000000,
              calculationMethod: aiSource === "dataset" ? "AI Dataset Analysis" : "AI Internet Analysis",
            })
          }
        } catch {
          predictionMethod = "template"
        }
      }

      // 3. Template-based (dataset)
      if (!predictionData && templateConfig) {
        predictionMethod = "template"
        try {
          predictionData = predictRankFromTemplate(
            examId, totalScore, maxPossibleScore,
            formData, subjectData, config, templateConfig, examConditions
          )
        } catch {
          predictionMethod = "default"
        }
      }

      // 4. Client-side fallback
      if (!predictionData) {
        predictionMethod = "default"
        predictionData = predictRank(examId, totalScore, maxPossibleScore, formData, subjectData, config)
      }

      // Ensure non-zero fallback values
      if (!predictionData.rankRange.predictedRank) predictionData.rankRange.predictedRank = 10000
      if (!predictionData.percentile.predictedPercentile) predictionData.percentile.predictedPercentile = 50

      // Save to database
      try {
        const institutionId = await getInstitutionId()

        // Resolve template ID
        let actualTemplateId = templateConfig?.id ?? null
        if (!actualTemplateId) {
          try {
            const res = await fetch(`/api/templates?examCode=${examId}`)
            if (res.ok) {
              const templates = await res.json()
              const found = templates.find((t: any) => t.examCode.toLowerCase() === examId.toLowerCase())
              if (found) actualTemplateId = found.id
            }
          } catch {
            // Save without template ID
          }
        }

        const saveResponse = await fetch("/api/predictions/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentName: predictionData.formData.fullName,
            studentEmail: predictionData.formData.email,
            rollNumber: predictionData.formData.hallTicket,
            institutionId,
            userId: user?.id ?? null,
            examId,
            templateId: actualTemplateId,
            totalScore: predictionData.totalScore,
            predictedRank: predictionData.rankRange.predictedRank,
            predictedPercentile: predictionData.percentile.predictedPercentile,
            bestCaseRank: predictionData.rankRange.minRank,
            bestCasePercentile: predictionData.percentile.minPercentile,
            worstCaseRank: predictionData.rankRange.maxRank,
            worstCasePercentile: predictionData.percentile.maxPercentile,
            avgRank: predictionData.rankRange.predictedRank,
            avgPercentile: predictionData.percentile.predictedPercentile,
            answers: subjectData,
            predictionType: predictionMethod,
            status: "completed",
            metadata: {
              calculationMethod: predictionData.calculationMethod,
              predictionMethod,
              maxPossibleScore: predictionData.maxPossibleScore,
              percentage: predictionData.percentage,
              totalCandidates: predictionData.totalCandidates,
              totalScore: predictionData.totalScore,
              templateConfig,
              examConditions,
            },
          }),
        })

        if (saveResponse.ok) {
          const savedPrediction = await saveResponse.json()
          console.log('✅ Prediction saved to database:', savedPrediction.id)
        } else {
          const errorText = await saveResponse.text()
          console.error('❌ Failed to save prediction to database:', errorText)
          console.error('❌ Save response status:', saveResponse.status)
        }
      } catch (error) {
        console.error('❌ Error saving prediction to database:', error)
      }

      router.push(`/results/${examId}`)
    } catch {
      alert("Error generating prediction. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-lg font-medium text-primary">Loading prediction form...</p>
          <p className="text-sm text-muted-foreground">
            Setting up template for {examId.replace(/-/g, " ").toUpperCase()}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-primary/10 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                RP
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                RankPredict
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{config.name}</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 border border-primary/20 mb-4">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Prediction</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              {config.name}
            </span>{" "}
            Rank Predictor
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enter your exam details below to get an accurate rank prediction powered by AI and historical data analysis.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-white border border-primary/10 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg">
                1
              </div>
              <h2 className="text-2xl font-bold">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="text-red-500">*</span> Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter Email Id"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="text-red-500">*</span> Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Enter Full Name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1.5">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="text-red-500">*</span> Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter Phone Number"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1.5">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {config.requireHallTicket && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="text-red-500">*</span> Hall Ticket Number
                  </label>
                  <input
                    type="text"
                    value={formData.hallTicket}
                    onChange={(e) => handleInputChange("hallTicket", e.target.value)}
                    placeholder="Enter Hall Ticket Number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                  {errors.hallTicket && <p className="text-red-500 text-xs mt-1.5">{errors.hallTicket}</p>}
                </div>
              )}

              {config.collectCity && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="text-red-500">*</span> City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Enter City"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1.5">{errors.city}</p>}
                </div>
              )}

              {config.askExpectedScore && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Do You Know Your Expected Score?
                  </label>
                  <div className="flex items-center gap-6 mt-4">
                    {["yes", "no"].map((val) => (
                      <label key={val} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="expectedScore"
                          value={val}
                          checked={formData.expectedScore === val}
                          onChange={(e) => handleInputChange("expectedScore", e.target.value)}
                          className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                        />
                        <span className="text-sm font-medium capitalize">{val}</span>
                      </label>
                    ))}
                  </div>

                  {formData.expectedScore === "yes" && (
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <span className="text-red-500">*</span> Enter Your Expected Score
                      </label>
                      <input
                        type="number"
                        value={formData.expectedScoreValue}
                        onChange={(e) => handleInputChange("expectedScoreValue", e.target.value)}
                        placeholder="Enter your expected score"
                        min="0"
                        className="w-full md:w-1/2 px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                      {errors.expectedScoreValue && (
                        <p className="text-red-500 text-xs mt-1.5">{errors.expectedScoreValue}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section-wise Performance */}
          <div className="bg-white border border-primary/10 rounded-2xl overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-8 py-6 border-b border-primary/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg">
                  2
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Section-wise Performance</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Do you want to provide detailed section-wise performance?
                  </p>
                </div>
              </div>
            </div>

            <div className="px-8 py-6">
              <div className="flex items-center gap-6 mb-6">
                {["yes", "no"].map((val) => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="provideSectionData"
                      value={val}
                      checked={formData.provideSectionData === val}
                      onChange={(e) => handleInputChange("provideSectionData", e.target.value)}
                      className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm font-medium">
                      {val === "yes" ? "Yes, I'll provide section-wise details" : "No, skip this section"}
                    </span>
                  </label>
                ))}
              </div>

              {formData.provideSectionData === "yes" ? (
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">Section Name</th>
                        <th className="px-8 py-4 text-center text-sm font-semibold text-gray-700">Total Questions</th>
                        <th className="px-8 py-4 text-center text-sm font-semibold text-gray-700">Attempted</th>
                        <th className="px-8 py-4 text-center text-sm font-semibold text-gray-700">Correct</th>
                      </tr>
                    </thead>
                    <tbody>
                      {config.subjects.map((subject, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="font-semibold text-gray-900">{subject.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              +{subject.positiveMarks} / -{subject.negativeMarks} marks
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="inline-flex items-center justify-center min-w-[2.5rem] h-10 rounded-full bg-gradient-to-br from-primary to-accent text-white text-sm font-bold shadow-md">
                              {subject.totalQuestions}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <input
                              type="number"
                              min="0"
                              max={subject.totalQuestions}
                              value={subjectData[index]?.attempted ?? ""}
                              onChange={(e) => handleSubjectChange(index, "attempted", e.target.value)}
                              placeholder="0"
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-center font-semibold"
                            />
                          </td>
                          <td className="px-8 py-5">
                            <input
                              type="number"
                              min="0"
                              max={subject.totalQuestions}
                              value={subjectData[index]?.correct ?? ""}
                              onChange={(e) => handleSubjectChange(index, "correct", e.target.value)}
                              placeholder="0"
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-center font-semibold"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p className="text-sm text-blue-900">
                    You've chosen to skip section-wise details. The prediction will be based on your overall score and
                    other information provided.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">Important Guidelines:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  {[
                    "Ensure all fields are filled accurately for precise rank prediction",
                    "Questions attempted cannot exceed total questions for each section",
                    "Correct answers cannot exceed questions attempted",
                    "Your data is secure and will only be used for rank prediction analysis",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-center pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-primary via-accent to-secondary hover:shadow-2xl transition-all text-lg px-12 h-14 font-semibold disabled:opacity-60"
            >
              {isSubmitting ? "Predicting..." : "Predict My Rank"}
            </Button>
          </div>
        </form>
      </div>

      <footer className="border-t bg-white py-8 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by <span className="font-semibold text-primary">RankPredict</span> — AI-Driven Rank Prediction
          </p>
        </div>
      </footer>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helper: build PredictionData from raw numbers
// ---------------------------------------------------------------------------
function buildPredictionData(
  examId: string,
  config: ExamConfig,
  totalScore: number,
  maxPossibleScore: number,
  formData: FormState,
  subjectData: SubjectEntry[],
  values: {
    minRank: number
    predictedRank: number
    maxRank: number
    minPercentile: number
    predictedPercentile: number
    maxPercentile: number
    totalCandidates: number
    calculationMethod: string
  }
): PredictionData {
  return {
    examId,
    examName: config.name,
    totalScore,
    maxPossibleScore,
    percentage: (totalScore / maxPossibleScore) * 100,
    rankRange: {
      minRank: values.minRank,
      predictedRank: values.predictedRank,
      maxRank: values.maxRank,
    },
    percentile: {
      minPercentile: values.minPercentile,
      predictedPercentile: values.predictedPercentile,
      maxPercentile: values.maxPercentile,
    },
    totalCandidates: values.totalCandidates,
    calculationMethod: values.calculationMethod,
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
}