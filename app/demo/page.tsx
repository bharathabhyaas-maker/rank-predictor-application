"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Brain, TrendingUp, Sparkles, ArrowRight, ArrowLeft,
  CheckCircle2, Star, ChevronDown, Target, Award, BarChart3,
  Zap, Users, BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DemoPage() {
  const [score, setScore] = useState("")
  const [sectionScores, setSectionScores] = useState({
    english: "",
    currentAffairs: "",
    legalReasoning: "",
    logicalReasoning: "",
    quantitative: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [prediction, setPrediction] = useState<null | {
    percentile: number
    rank: { min: number; max: number }
    confidence: number
    category: string
    analysis: string
    sectionAnalysis: { name: string; score: number; max: number; percentile: number; status: string }[]
    tips: string[]
    collegeChances: { name: string; chance: string; color: string }[]
  }>(null)

  const maxScore = 150
  const sections = [
    { key: "english", name: "English Language", maxMarks: 28 },
    { key: "currentAffairs", name: "Current Affairs & GK", maxMarks: 35 },
    { key: "legalReasoning", name: "Legal Reasoning", maxMarks: 40 },
    { key: "logicalReasoning", name: "Logical Reasoning", maxMarks: 28 },
    { key: "quantitative", name: "Quantitative Techniques", maxMarks: 19 },
  ]

  const handlePredict = async () => {
    if (!score || Number(score) < 0 || Number(score) > maxScore) return
    
    setIsLoading(true)
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    const scoreNum = Number(score)
    const basePercentile = (scoreNum / maxScore) * 100
    const adjustedPercentile = Math.min(99.95, Math.max(40, basePercentile + (Math.random() * 8 - 2)))
    
    // Calculate rank range based on percentile (assuming 75,000 candidates)
    const totalCandidates = 75000
    const rankMin = Math.floor((100 - adjustedPercentile) / 100 * totalCandidates * 0.95)
    const rankMax = Math.floor((100 - adjustedPercentile) / 100 * totalCandidates * 1.15)
    
    // Determine category
    let category = "General"
    if (adjustedPercentile >= 99) category = "Excellent"
    else if (adjustedPercentile >= 95) category = "Very Good"
    else if (adjustedPercentile >= 85) category = "Good"
    else if (adjustedPercentile >= 70) category = "Above Average"
    else if (adjustedPercentile >= 50) category = "Average"
    else category = "Below Average"

    // Section analysis
    const sectionAnalysis = sections.map(section => {
      const sectionScore = Number(sectionScores[section.key as keyof typeof sectionScores]) || Math.floor(scoreNum * (section.maxMarks / maxScore))
      const sectionPercentile = Math.min(99, Math.max(30, (sectionScore / section.maxMarks) * 100 + (Math.random() * 15 - 5)))
      let status = "average"
      if (sectionPercentile >= 85) status = "excellent"
      else if (sectionPercentile >= 70) status = "good"
      else if (sectionPercentile < 50) status = "needs-improvement"
      
      return {
        name: section.name,
        score: sectionScore,
        max: section.maxMarks,
        percentile: Number(sectionPercentile.toFixed(1)),
        status
      }
    })

    // College chances
    const collegeChances = [
      { name: "NLSIU Bangalore", chance: adjustedPercentile >= 99.5 ? "High" : adjustedPercentile >= 98 ? "Medium" : "Low", color: adjustedPercentile >= 99.5 ? "green" : adjustedPercentile >= 98 ? "yellow" : "red" },
      { name: "NALSAR Hyderabad", chance: adjustedPercentile >= 99 ? "High" : adjustedPercentile >= 96 ? "Medium" : "Low", color: adjustedPercentile >= 99 ? "green" : adjustedPercentile >= 96 ? "yellow" : "red" },
      { name: "NLU Delhi", chance: adjustedPercentile >= 98.5 ? "High" : adjustedPercentile >= 95 ? "Medium" : "Low", color: adjustedPercentile >= 98.5 ? "green" : adjustedPercentile >= 95 ? "yellow" : "red" },
      { name: "NUJS Kolkata", chance: adjustedPercentile >= 97 ? "High" : adjustedPercentile >= 92 ? "Medium" : "Low", color: adjustedPercentile >= 97 ? "green" : adjustedPercentile >= 92 ? "yellow" : "red" },
      { name: "Other NLUs", chance: adjustedPercentile >= 85 ? "High" : adjustedPercentile >= 70 ? "Medium" : "Low", color: adjustedPercentile >= 85 ? "green" : adjustedPercentile >= 70 ? "yellow" : "red" },
    ]
    
    setPrediction({
      percentile: Number(adjustedPercentile.toFixed(2)),
      rank: { min: Math.max(1, rankMin), max: rankMax },
      confidence: 89 + Math.random() * 8,
      category,
      analysis: `Based on your score of ${score}/${maxScore}, our AI model predicts you'll be in the top ${(100 - adjustedPercentile).toFixed(2)}% of all CLAT 2025 aspirants. With approximately 75,000 expected candidates, this translates to a rank between ${Math.max(1, rankMin).toLocaleString()} and ${rankMax.toLocaleString()}. ${adjustedPercentile >= 95 ? "This is an excellent performance that puts you in a strong position for top NLUs!" : adjustedPercentile >= 80 ? "This is a good performance. With some focused preparation, you can improve further." : "There's room for improvement. Focus on your weaker sections to boost your percentile."}`,
      sectionAnalysis,
      tips: adjustedPercentile >= 90 ? [
        "Maintain your strong performance in Legal Reasoning",
        "Focus on time management during the actual exam",
        "Practice more CLAT mock tests under exam conditions",
        "Revise current affairs thoroughly before the exam"
      ] : [
        "Focus intensively on Legal Reasoning - it carries the highest weightage",
        "Improve your reading speed for English comprehension passages",
        "Stay updated with current affairs - read newspapers daily",
        "Practice more logical reasoning puzzles",
        "Work on quantitative techniques basics for quick calculations"
      ],
      collegeChances
    })
    
    setIsLoading(false)
  }

  const resetPrediction = () => {
    setPrediction(null)
    setScore("")
    setSectionScores({
      english: "",
      currentAffairs: "",
      legalReasoning: "",
      logicalReasoning: "",
      quantitative: ""
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-white">CLAT 2025 Predictor</h1>
                  <p className="text-xs text-slate-400">Live Demo</p>
                </div>
              </div>
            </Link>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              AI Powered Demo
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!prediction ? (
          /* Input Form */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-violet-500/20 text-violet-300 px-4 py-2 rounded-full mb-4">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-semibold">Try Our AI Prediction Tool</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">CLAT 2025 Rank Predictor</h2>
              <p className="text-slate-400 text-balance">
                Enter your mock test score to get an AI-powered prediction of your expected percentile and rank range.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
              {/* Score Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Enter Your Total Score
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="Enter score"
                    min={0}
                    max={maxScore}
                    className="w-full text-4xl font-bold text-center py-6 bg-slate-900/50 border-2 border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-xl">
                    / {maxScore}
                  </span>
                </div>
              </div>

              {/* Section-wise Breakdown */}
              <details className="mb-6 group">
                <summary className="flex items-center justify-between cursor-pointer bg-slate-900/50 rounded-xl px-4 py-3 border border-slate-700 hover:border-slate-600 transition-colors">
                  <span className="text-sm font-semibold text-slate-300">Section-wise Marks (Optional - for detailed analysis)</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-3 space-y-3 p-4 bg-slate-900/30 rounded-xl border border-slate-700/50">
                  {sections.map((section) => (
                    <div key={section.key} className="flex items-center gap-4">
                      <label className="flex-1 text-sm text-slate-400">{section.name}</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={sectionScores[section.key as keyof typeof sectionScores]}
                          onChange={(e) => setSectionScores({...sectionScores, [section.key]: e.target.value})}
                          placeholder="0"
                          min={0}
                          max={section.maxMarks}
                          className="w-24 text-center py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                          /{section.maxMarks}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </details>

              {/* Submit Button */}
              <Button
                onClick={handlePredict}
                disabled={!score || Number(score) < 0 || Number(score) > maxScore || isLoading}
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    AI is analyzing your score...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Get My Prediction
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>

              {/* Loading Animation */}
              {isLoading && (
                <div className="mt-6 p-4 bg-violet-500/10 border border-violet-500/30 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Brain className="w-5 h-5 text-violet-400 animate-pulse" />
                    <span className="text-sm text-violet-300 font-semibold">Processing with AI Model</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-slate-400">Analyzing score patterns...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-slate-400">Comparing with historical data...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-slate-400">Generating prediction report...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-center">
                <Users className="w-5 h-5 text-violet-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500 mb-1">Expected Candidates</p>
                <p className="text-sm font-semibold text-white">~75,000</p>
              </div>
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-center">
                <Target className="w-5 h-5 text-violet-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500 mb-1">Maximum Score</p>
                <p className="text-sm font-semibold text-white">150 Marks</p>
              </div>
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-center">
                <BookOpen className="w-5 h-5 text-violet-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500 mb-1">Exam Date</p>
                <p className="text-sm font-semibold text-white">Dec 2025</p>
              </div>
            </div>
          </div>
        ) : (
          /* Prediction Results */
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full mb-4">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-semibold">Prediction Complete</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Your CLAT 2025 Prediction</h2>
              <p className="text-slate-400">Based on your score of {score}/{maxScore}</p>
            </div>

            {/* Main Result Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Percentile */}
              <div className="bg-gradient-to-br from-violet-900/50 to-purple-900/50 border border-violet-500/30 rounded-2xl p-6 text-center">
                <TrendingUp className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-1">Predicted Percentile</p>
                <p className="text-4xl font-bold text-white">{prediction.percentile}<span className="text-lg">%</span></p>
              </div>

              {/* Rank Range */}
              <div className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 border border-amber-500/30 rounded-2xl p-6 text-center">
                <Star className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-1">Expected Rank</p>
                <p className="text-2xl font-bold text-white">{prediction.rank.min.toLocaleString()} - {prediction.rank.max.toLocaleString()}</p>
              </div>

              {/* Category */}
              <div className="bg-gradient-to-br from-emerald-900/50 to-green-900/50 border border-emerald-500/30 rounded-2xl p-6 text-center">
                <Award className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-1">Performance</p>
                <p className="text-2xl font-bold text-white">{prediction.category}</p>
              </div>

              {/* Confidence */}
              <div className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border border-cyan-500/30 rounded-2xl p-6 text-center">
                <BarChart3 className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-1">Confidence</p>
                <p className="text-2xl font-bold text-cyan-400">{prediction.confidence.toFixed(1)}%</p>
              </div>
            </div>

            {/* Analysis */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-violet-400" />
                AI Analysis
              </h3>
              <p className="text-slate-300 leading-relaxed">{prediction.analysis}</p>
            </div>

            {/* Section-wise Analysis */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-violet-400" />
                Section-wise Performance
              </h3>
              <div className="space-y-4">
                {prediction.sectionAnalysis.map((section, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-300">{section.name}</span>
                      <span className="text-sm text-slate-400">{section.score}/{section.max} ({section.percentile}%ile)</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          section.status === "excellent" ? "bg-green-500" :
                          section.status === "good" ? "bg-emerald-500" :
                          section.status === "needs-improvement" ? "bg-red-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${section.percentile}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* College Chances */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-violet-400" />
                College Admission Chances
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {prediction.collegeChances.map((college, index) => (
                  <div key={index} className="bg-slate-900/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-400 mb-1 truncate">{college.name}</p>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      college.color === "green" ? "bg-green-500/20 text-green-400" :
                      college.color === "yellow" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {college.chance}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Personalized Tips to Improve
              </h3>
              <ul className="space-y-2">
                {prediction.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-300">
                    <span className="h-6 w-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={resetPrediction}
                variant="outline" 
                className="flex-1 bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Try Another Score
              </Button>
              <Link href="/institution" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                  Get This For Your Institution
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <p className="text-xs text-amber-300">
                <strong>Disclaimer:</strong> This is a demo prediction based on historical data and AI analysis. Actual results may vary based on exam difficulty, cutoffs, and the performance of all candidates. Use this as a guide for preparation, not as a guarantee.
              </p>
            </div>

            {/* CTA */}
            <div className="mt-8 text-center bg-gradient-to-r from-violet-900/30 to-purple-900/30 border border-violet-500/30 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-2">Want This Tool For Your Students?</h3>
              <p className="text-slate-400 mb-4">Create custom prediction templates and deploy them for your institution.</p>
              <div className="flex justify-center gap-4">
                <Link href="/admin">
                  <Button className="bg-gradient-to-r from-violet-600 to-purple-600">
                    Super Admin Portal
                  </Button>
                </Link>
                <Link href="/institution">
                  <Button variant="outline" className="bg-transparent border-slate-600 text-slate-300">
                    Institution Portal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
