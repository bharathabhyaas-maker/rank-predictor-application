// app/results/[examId]/ResultsPage.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Share2, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PercentileData {
  minPercentile: number
  predictedPercentile: number
  maxPercentile: number
}

interface RankRangeData {
  minRank: number
  predictedRank: number
  maxRank: number
}

interface ResultData {
  examId: string
  examName: string
  totalScore: number
  totalCandidates: number
  calculationMethod: string
  percentile: PercentileData
  rankRange: RankRangeData
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ResultsPage({ examId }: { examId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ResultData | null>(null)

  // -------------------------------------------------------------------------
  // Fetch prediction data from API — no localStorage / sessionStorage
  // -------------------------------------------------------------------------
  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const res = await fetch(`/api/predictions`)

        if (!res.ok) {
          setError("Failed to load prediction results.")
          return
        }

        const predictions = await res.json()

        if (!Array.isArray(predictions) || predictions.length === 0) {
          setError("No prediction found for this exam. Please submit your answers first.")
          return
        }

        const latest = predictions[0]

        setData({
          examId,
          examName: latest.examName ?? examId.replace(/-/g, " ").toUpperCase(),
          totalScore: latest.metadata?.totalScore ?? 0,
          totalCandidates: latest.metadata?.totalCandidates ?? 1200000,
          calculationMethod: latest.metadata?.calculationMethod ?? "Dataset-Based Analysis",
          percentile: {
            minPercentile: latest.worstCasePercentile ?? 0, // Worst case = lowest percentile
            predictedPercentile: latest.avgPercentile ?? latest.predictedPercentile ?? 0,
            maxPercentile: latest.bestCasePercentile ?? 0, // Best case = highest percentile
          },
          rankRange: {
            minRank: latest.bestCaseRank ?? 0, // Best case = lowest rank
            predictedRank: latest.avgRank ?? latest.predictedRank ?? 0,
            maxRank: latest.worstCaseRank ?? 0, // Worst case = highest rank
          },
        })
      } catch {
        setError("Something went wrong while loading your results.")
      } finally {
        setLoading(false)
      }
    }

    fetchPrediction()
  }, [examId])

  // -------------------------------------------------------------------------
  // Share
  // -------------------------------------------------------------------------
  const handleShare = async () => {
    if (!data) return
    const text =
      `My Rank Prediction for ${data.examName}:\n` +
      `📊 Predicted Percentile: ${data.percentile.predictedPercentile.toFixed(1)}%\n` +
      `🎯 Expected Rank: ${data.rankRange.predictedRank.toLocaleString()}\n` +
      `📈 Rank Range: ${data.rankRange.minRank.toLocaleString()} – ${data.rankRange.maxRank.toLocaleString()}\n` +
      `💯 Score: ${data.totalScore}\n\n` +
      `Check your rank prediction at: ${window.location.href}`

    try {
      if (navigator.share) {
        await navigator.share({ title: `Rank Prediction – ${data.examName}`, text, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(text)
        alert("Results copied to clipboard!")
      }
    } catch {
      alert("Failed to share results.")
    }
  }

  // -------------------------------------------------------------------------
  // Download
  // -------------------------------------------------------------------------
  const handleDownload = () => {
    if (!data) return
    const content =
      `RANK PREDICTION RESULTS\n========================\n\n` +
      `Exam: ${data.examName}\n` +
      `Date: ${new Date().toLocaleDateString()}\n\n` +
      `PREDICTION DETAILS\n------------------\n` +
      `Your Score: ${data.totalScore}\n` +
      `Predicted Percentile: ${data.percentile.predictedPercentile.toFixed(1)}%\n` +
      `Expected Rank: ${data.rankRange.predictedRank.toLocaleString()}\n\n` +
      `RANK RANGE\n----------\n` +
      `Best Case:  ${data.rankRange.minRank.toLocaleString()} (${data.percentile.minPercentile.toFixed(1)}%ile)\n` +
      `Expected:   ${data.rankRange.predictedRank.toLocaleString()} (${data.percentile.predictedPercentile.toFixed(1)}%ile)\n` +
      `Worst Case: ${data.rankRange.maxRank.toLocaleString()} (${data.percentile.maxPercentile.toFixed(1)}%ile)\n\n` +
      `PREDICTION METHOD\n-----------------\n${data.calculationMethod}\n\n` +
      `Generated by RankPredict — ${window.location.href}`

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `rank-prediction-${data.examName.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // -------------------------------------------------------------------------
  // Render states
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Loading Your Results...</h2>
          <p className="text-gray-600 mt-2">Fetching your rank prediction</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {error ? "Unable to Load Results" : "No Prediction Found"}
          </h2>
          <p className="text-gray-600 mb-6">
            {error ?? "Please submit your exam answers to see your rank prediction."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push(`/predict/${examId}`)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl"
            >
              Try Prediction
            </Button>
            <Button variant="outline" onClick={() => router.push("/")} className="rounded-xl bg-transparent">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const markerLeft = Math.min(
    95,
    Math.max(
      5,
      ((data.rankRange.predictedRank - data.rankRange.minRank) /
        Math.max(data.rankRange.maxRank - data.rankRange.minRank, 1)) *
        100
    )
  )

  // -------------------------------------------------------------------------
  // Main result UI
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 bg-transparent"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Your Rank Prediction
            </h1>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="bg-transparent" onClick={handleShare} title="Share">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="bg-transparent" onClick={handleDownload} title="Download">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <div className="space-y-8">

          {/* Percentile Hero Card */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 md:p-12 shadow-xl text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="w-6 h-6" />
              <span className="text-sm font-medium opacity-90">Your Predicted Percentile</span>
            </div>
            <div className="text-6xl md:text-8xl font-bold mb-2">
              {data.percentile.predictedPercentile.toFixed(1)}%
            </div>
            <p className="text-lg opacity-90">
              You are likely to score better than{" "}
              <strong>{data.percentile.predictedPercentile.toFixed(1)}%</strong> of all candidates
            </p>

            <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold">{data.totalCandidates.toLocaleString()}</div>
                <div className="text-xs opacity-75">Expected Candidates</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{data.totalScore}</div>
                <div className="text-xs opacity-75">Your Score</div>
              </div>
              <div>
                <div className="text-sm font-bold">{data.calculationMethod}</div>
                <div className="text-xs opacity-75">Prediction Method</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-4">
              {data.calculationMethod.includes("AI") ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs text-green-300 font-medium">🤖 AI-Powered</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                  <span className="text-xs text-white/70 font-medium">📊 Statistical Analysis</span>
                </>
              )}
            </div>
          </div>

          {/* Rank Range Card */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Predicted Rank Range</h2>
            <p className="text-center text-gray-600 mb-8">
              Your rank is likely to fall between{" "}
              <span className="font-bold text-gray-800">
                {data.rankRange.minRank.toLocaleString()} – {data.rankRange.maxRank.toLocaleString()}
              </span>
            </p>

            {/* Range bar */}
            <div className="mb-12">
              <div className="relative h-12 md:h-14 bg-gradient-to-r from-emerald-400 via-blue-500 to-orange-400 rounded-full shadow-lg">
                <div
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ left: `${markerLeft}%` }}
                >
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-white rounded-full shadow-lg border-4 border-blue-600 flex items-center justify-center">
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-blue-600 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="text-4xl md:text-5xl font-bold text-blue-600">
                {data.rankRange.predictedRank.toLocaleString()}
              </div>
              <div className="text-sm font-semibold text-gray-500 mt-2">Expected Rank</div>
            </div>

            <div className="flex justify-between px-2 md:px-4">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-emerald-600">
                  {data.rankRange.minRank.toLocaleString()}
                </div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">Best Case</div>
                <div className="text-xs text-emerald-600 mt-1">
                  {data.percentile.minPercentile.toFixed(1)}%ile
                </div>
              </div>
              <div className="text-center hidden md:block">
                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Predicted Range</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-orange-600">
                  {data.rankRange.maxRank.toLocaleString()}
                </div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">Worst Case</div>
                <div className="text-xs text-orange-600 mt-1">
                  {data.percentile.maxPercentile.toFixed(1)}%ile
                </div>
              </div>
            </div>
          </div>

          {/* Percentile Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600">
                {data.percentile.minPercentile.toFixed(1)}%
              </div>
              <div className="text-sm text-emerald-700 font-medium mt-1">Best Case Percentile</div>
              <div className="text-xs text-emerald-600 mt-2">Optimistic estimate</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {data.percentile.predictedPercentile.toFixed(1)}%
              </div>
              <div className="text-sm text-blue-700 font-medium mt-1">Expected Percentile</div>
              <div className="text-xs text-blue-600 mt-2">Most likely outcome</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-orange-600">
                {data.percentile.maxPercentile.toFixed(1)}%
              </div>
              <div className="text-sm text-orange-700 font-medium mt-1">Worst Case Percentile</div>
              <div className="text-xs text-orange-600 mt-2">Conservative estimate</div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 md:p-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mt-1">
                <span className="text-white text-sm font-bold">i</span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-2">Why Percentile Format?</p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Percentile is a more accurate representation of your performance compared to raw rank. It tells you
                  what percentage of candidates you performed better than, regardless of total candidates appearing.
                  This remains consistent even if the number of applicants changes.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 rounded-xl"
              onClick={() => {
                router.push(`/predict/${examId}`)
              }}
            >
              Try Another Prediction
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push("/")} className="rounded-xl bg-transparent">
              Back to Home
            </Button>
          </div>

        </div>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-600 text-sm">
          <p>© 2026 RankPredict. This prediction is based on statistical analysis and previous year trends.</p>
        </div>
      </footer>
    </div>
  )
}