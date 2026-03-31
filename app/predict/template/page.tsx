"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { 
  Brain, Database, TrendingUp, Sparkles, ArrowRight,
  CheckCircle2, Star, ChevronDown, User, Mail
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Template {
  id: string
  name: string
  examCode: string
  description?: string
  status: string
  accuracy?: number
  type?: string
  config?: any
  conditions?: {
    minScore?: number
    maxScore?: number
    subjects?: {
      [subject: string]: {
        weight: number
        minScore?: number
        maxScore?: number
      }
    }
    difficulty?: 'easy' | 'medium' | 'hard'
    passingCriteria?: {
      percentage: number
      subjects: string[]
    }
  }
  createdAt: string
}

export default function StudentPredictionPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const templateId = params.template as string
  const institutionId = searchParams.get('institutionId')
  
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [prediction, setPrediction] = useState<null | {
    percentile: number
    rank: string
    confidence: number
    analysis: string
    tips: string[]
  }>(null)
  
  // Student information
  const [studentData, setStudentData] = useState({
    name: "",
    email: "",
    rollNumber: ""
  })
  
  const [error, setError] = useState("")

  useEffect(() => {
    if (templateId) {
      fetchTemplate()
    }
  }, [templateId])

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/templates/${templateId}`)
      if (response.ok) {
        const data = await response.json()
        setTemplate(data)
      } else {
        setError("Template not found")
      }
    } catch (error) {
      setError("Failed to load template")
    } finally {
      setLoading(false)
    }
  }

  const handlePredict = async () => {
    if (!studentData.name || !studentData.email) {
      setError("Please fill in your name and email")
      return
    }
    
    if (!score || Number(score) < 0) {
      setError("Please enter a valid score")
      return
    }
    
    setIsLoading(true)
    setError("")
    
    try {
      // Check if template uses conditions-based prediction
      console.log('🔍 Full template object:', JSON.stringify(template, null, 2))
      
      const isConditional = template?.type === 'conditional' || 
                           template?.config?.conditions || 
                           (template?.config && template.config.conditions && Object.keys(template.config.conditions).length > 0)
      
      console.log('🔍 Template type:', template?.type)
      console.log('🔍 Template config:', template?.config)
      console.log('🔍 Template conditions:', template?.conditions)
      console.log('🔍 Config conditions:', template?.config?.conditions)
      console.log('🔍 Is conditional:', isConditional)
      
      if (isConditional) {
        // Use conditional prediction API
        const response = await fetch('/api/predictions/conditional', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            studentName: studentData.name,
            studentEmail: studentData.email,
            rollNumber: studentData.rollNumber,
            institutionId: institutionId || 'default',
            examId: templateId,
            totalScore: Number(score),
            answers: {}
          })
        })
        
        if (response.ok) {
          const result = await response.json()
          
          // Display conditional prediction results
          setPrediction({
            percentile: Number(result.prediction.predictedPercentile),
            rank: result.prediction.predictedRank,
            confidence: 90,
            analysis: `Based on your score of ${score} and the specific conditions defined for this exam, you're predicted to achieve rank #${result.prediction.predictedRank}. This prediction uses rule-based conditions rather than dataset analysis.`,
            tips: [
              "This prediction is based on predefined conditions for this exam",
              "Your best case rank: " + (result.prediction.bestCaseRank || 'N/A'),
              "Your worst case rank: " + (result.prediction.worstCaseRank || 'N/A'),
              "Your average rank: " + (result.prediction.avgRank || 'N/A'),
              "Focus on improving your score to achieve better rankings"
            ]
          })
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Failed to create prediction')
        }
      } else {
        // Use original dataset-based prediction API
        const answers = {
          totalScore: Number(score),
          maxScore: 100 // Default max score
        }
        
        const response = await fetch('/api/predictions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            studentName: studentData.name,
            studentEmail: studentData.email,
            rollNumber: studentData.rollNumber,
            templateId: templateId,
            institutionId: institutionId || 'default',
            answers: answers
          })
        })
        
        if (response.ok) {
          const result = await response.json()
          
          // Convert the API response to match the expected format
          const scoreNum = result.score || Number(score)
          const predictedRank = result.predictedRank || 1000
          const accuracy = parseFloat(result.accuracy) || 85
          
          // Calculate percentile based on rank
          const percentile = Math.max(50, Math.min(99.9, 100 - (predictedRank / 20)))
          
          setPrediction({
            percentile: Number(percentile.toFixed(2)),
            rank: `${Math.max(1, predictedRank - 100).toLocaleString()} - ${Math.max(1, predictedRank + 100).toLocaleString()}`,
            confidence: accuracy,
            analysis: `Based on your score of ${scoreNum}/100 and the specific conditions of this exam, you're predicted to achieve rank #${predictedRank}. This puts you in the top ${(100 - percentile).toFixed(1)}% of students. ${template?.conditions ? 'The prediction considers specific exam conditions and requirements.' : ''}`,
            tips: [
              "Focus on improving your weaker sections to push your percentile higher",
              "Practice more mock tests to improve time management",
              "Review previous year questions for better preparation",
              template?.conditions?.passingCriteria ? 
                `Ensure you meet the passing criteria of ${template.conditions.passingCriteria.percentage}% in ${template.conditions.passingCriteria.subjects.join(', ')}` :
                "Maintain consistent performance across all sections"
            ]
          })
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Failed to create prediction')
        }
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetPrediction = () => {
    setPrediction(null)
    setScore("")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-400">Loading template...</p>
        </div>
      </div>
    )
  }

  if (error && !template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-red-400 text-xl font-bold mb-4">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <Button 
            onClick={() => window.history.back()} 
            className="w-full"
            variant="outline"
          >
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white ${
                template?.accuracy 
                  ? "bg-gradient-to-br from-violet-500 to-purple-600"
                  : "bg-gradient-to-br from-cyan-500 to-blue-600"
              }`}>
                {template?.accuracy ? <Brain className="w-5 h-5" /> : <Database className="w-5 h-5" />}
              </div>
              <div>
                <h1 className="font-bold text-white">{template?.name || "Exam Predictor"}</h1>
                <p className="text-xs text-slate-400">Exam Code: {template?.examCode || "Unknown"}</p>
              </div>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              template?.type === 'conditional' 
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : template?.accuracy 
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
            }`}>
              {template?.type === 'conditional' ? "Condition Based" : (template?.accuracy ? "AI Powered" : "Dataset Based")}
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!prediction ? (
          /* Input Form */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-3">{template?.name || "Exam Predictor"}</h2>
              <p className="text-slate-400 text-balance">{template?.description || "Get your rank prediction based on your performance"}</p>
              {template?.conditions && (
                <div className="mt-4 text-sm text-slate-400">
                  <span className="bg-slate-700/50 px-2 py-1 rounded">
                    Conditions Applied: {template.conditions.difficulty || 'Standard'} difficulty
                    {template.conditions.minScore && `, Min Score: ${template.conditions.minScore}`}
                    {template.conditions.maxScore && `, Max Score: ${template.conditions.maxScore}`}
                  </span>
                </div>
              )}
            </div>

            {/* Student Information */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Student Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-slate-300">Name *</Label>
                  <Input
                    id="name"
                    value={studentData.name}
                    onChange={(e) => setStudentData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                    className="bg-slate-900/50 border-slate-700 text-white placeholder-slate-600"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-slate-300">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={studentData.email}
                    onChange={(e) => setStudentData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    className="bg-slate-900/50 border-slate-700 text-white placeholder-slate-600"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="rollNumber" className="text-slate-300">Roll Number (Optional)</Label>
                  <Input
                    id="rollNumber"
                    value={studentData.rollNumber}
                    onChange={(e) => setStudentData(prev => ({ ...prev, rollNumber: e.target.value }))}
                    placeholder="Enter roll number"
                    className="bg-slate-900/50 border-slate-700 text-white placeholder-slate-600"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
              {/* Score Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Enter Your Score
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      placeholder="0"
                      min={0}
                      className="w-full text-4xl font-bold text-center py-6 bg-slate-900/50 border-2 border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                      / 100
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handlePredict}
                disabled={!score || Number(score) < 0 || !studentData.name || !studentData.email || isLoading}
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Get My Prediction
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
              {error && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Template Status</p>
                <p className="text-sm font-semibold text-white">{template?.status || 'Active'}</p>
              </div>
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Maximum Score</p>
                <p className="text-sm font-semibold text-white">100 Marks</p>
              </div>
            </div>
          </div>
        ) : (
          /* Prediction Results */
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full mb-4">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-semibold">Prediction Complete</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Your {template?.name?.split(" ")[0] || "Exam"} Prediction</h2>
              <p className="text-slate-400">Based on your score of {score}/100</p>
            </div>

            {/* Main Result Card */}
            <div className="bg-gradient-to-br from-violet-900/50 to-purple-900/50 border border-violet-500/30 rounded-2xl p-8 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                {/* Percentile */}
                <div className="bg-slate-900/50 rounded-xl p-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-violet-400" />
                    <span className="text-sm text-slate-400">Predicted Percentile</span>
                  </div>
                  <p className="text-5xl font-bold text-white">{prediction.percentile}%</p>
                </div>

                {/* Expected Rank */}
                <div className="bg-slate-900/50 rounded-xl p-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-amber-400" />
                    <span className="text-sm text-slate-400">Expected Rank Range</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{prediction.rank}</p>
                </div>

                {/* Confidence */}
                <div className="bg-slate-900/50 rounded-xl p-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-slate-400">Confidence Level</span>
                  </div>
                  <p className="text-3xl font-bold text-green-400">{prediction.confidence.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Analysis */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-3">Analysis</h3>
              <p className="text-slate-300 leading-relaxed">{prediction.analysis}</p>
            </div>

            {/* Tips */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-3">Tips to Improve</h3>
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
                Try Another Score
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600">
                Share Result
              </Button>
            </div>

            {/* Powered By */}
            <div className="text-center mt-8">
              <p className="text-xs text-slate-500">
                Powered by {template?.name || 'RankPredict'} | Prediction by RankPredict
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
