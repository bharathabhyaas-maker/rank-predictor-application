"use client"

import { useState, useEffect } from "react"
import { 
  BarChart3, Download, Filter, Search, ChevronDown,
  TrendingUp, TrendingDown, Users, Calendar, ArrowUpDown, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import InstitutionNavigation from "@/components/institution-navigation"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useAuth } from "@/lib/auth-context"

const Loading = () => null

function PredictionsContent() {
  const { user } = useAuth()
  const [selectedTemplate, setSelectedTemplate] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("time")
  const [predictions, setPredictions] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    let institutionId = user?.institution?.id || user?.institutionId
    
    console.log('🔍 Predictions Page - Using institutionId:', institutionId)
    
    // TEMP DEBUG: If no institutionId, use a test one for debugging
    if (!institutionId) {
      console.log('⚠️ No institution ID found in user context, using test institution for debugging')
      institutionId = 'cmmk5bcww0006lglhjpl3h3gv' // Anwar Institution ID
      console.log('🔍 DEBUG: Using Anwar institutionId:', institutionId)
    }
    
    if (!institutionId) {
      console.log('❌ No institution ID found in user context')
      setError('No institution ID found')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Fetch predictions
      const predictionsResponse = await fetch(`/api/predictions?institutionId=${institutionId}`)
      
      if (!predictionsResponse.ok) {
        throw new Error(`Failed to fetch predictions: ${predictionsResponse.status}`)
      }
      
      const predictionsData = await predictionsResponse.json()
      console.log('🔍 Predictions Page - Fetched predictions:', predictionsData)
      
      // Fetch templates for filter options
      const templatesResponse = await fetch(`/api/institution-templates?institutionId=${institutionId}`)
      
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json()
        setTemplates([
          { id: "all", name: "All Templates" },
          ...templatesData.map((t: any) => ({
            id: t.id,
            name: t.name
          }))
        ])
      } else {
        // Fallback templates
        setTemplates([
          { id: "all", name: "All Templates" },
          { id: "clat-2025", name: "CLAT 2025" },
          { id: "jee-main-2025", name: "JEE Main 2025" },
          { id: "neet-ug-2025", name: "NEET UG 2025" },
        ])
      }
      
      setPredictions(predictionsData)
    } catch (error) {
      console.error('❌ Failed to load predictions:', error)
      setError(error instanceof Error ? error.message : 'Failed to load predictions')
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalPredictions: predictions.length,
    todayPredictions: predictions.filter((p: any) => {
      const predictionDate = new Date(p.createdAt).toDateString()
      const today = new Date().toDateString()
      return predictionDate === today
    }).length,
    avgPercentile: predictions.length > 0 
      ? Math.round(predictions.reduce((sum: number, p: any) => sum + (p.predictedRank ? 100 - (p.predictedRank / 10) : 85), 0) / predictions.length)
      : 0,
    topPercentile: predictions.length > 0
      ? Math.max(...predictions.map((p: any) => p.predictedRank ? 100 - (p.predictedRank / 10) : 85))
      : 0,
  }

  const filteredPredictions = predictions.filter(p => {
    if (selectedTemplate !== "all" && p.template?.id !== selectedTemplate) {
      return false
    }
    if (searchQuery && !p.studentEmail?.toLowerCase().includes(searchQuery.toLowerCase()) && !p.studentName?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50">
        <InstitutionNavigation />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Prediction Analytics
              </h1>
              <p className="text-muted-foreground">
                View and analyze all student predictions.
              </p>
            </div>
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="text-lg text-muted-foreground">Loading predictions...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center mb-8">
            <p className="text-red-800 font-medium mb-2">Failed to load predictions</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <Button onClick={loadData} className="bg-red-600 hover:bg-red-700">
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && predictions.length === 0 && (
          <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Predictions Yet</h3>
            <p className="text-gray-600 mb-4">
              No student predictions have been made yet. Start sharing prediction links to see analytics here.
            </p>
            <Button onClick={loadData} className="bg-emerald-600 hover:bg-emerald-700">
              Refresh
            </Button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && predictions.length > 0 && (
          <>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-emerald-100 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">+12.3%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalPredictions.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Predictions</p>
          </div>
          <div className="bg-white border border-emerald-100 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-teal-600" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">+8.2%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.todayPredictions}</p>
            <p className="text-xs text-muted-foreground">Today's Predictions</p>
          </div>
          <div className="bg-white border border-emerald-100 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-cyan-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.avgPercentile}%</p>
            <p className="text-xs text-muted-foreground">Average Percentile</p>
          </div>
          <div className="bg-white border border-emerald-100 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{stats.topPercentile}%</p>
            <p className="text-xs text-muted-foreground">Top Percentile</p>
          </div>
        </div>

          {/* Filters */}
          <div className="bg-white border border-emerald-100 rounded-xl p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Template Filter */}
              <div className="relative">
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="appearance-none px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Sort */}
              <Button variant="outline" className="bg-transparent border-gray-200">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Sort by Time
              </Button>
            </div>
          </div>

          {/* Predictions Table */}
          <div className="bg-white border-2 border-emerald-200 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-emerald-50 border-b border-emerald-100">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-900 uppercase">Student ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-900 uppercase">Template</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-900 uppercase">Score</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-900 uppercase">Percentile</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-900 uppercase">Date & Time</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-900 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPredictions.map((prediction) => (
                    <tr key={prediction.id} className="border-b border-emerald-50 hover:bg-emerald-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <code className="text-sm font-mono font-semibold text-gray-900">{prediction.studentId}</code>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${
                          prediction.template.includes("CLAT") 
                            ? "bg-emerald-100 text-emerald-700"
                            : prediction.template.includes("JEE")
                            ? "bg-teal-100 text-teal-700"
                            : "bg-cyan-100 text-cyan-700"
                        }`}>
                          {prediction.template}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {prediction.score}/{prediction.totalMarks}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${
                            prediction.percentile >= 95 
                              ? "text-emerald-600" 
                              : prediction.percentile >= 85 
                              ? "text-teal-600"
                              : "text-gray-700"
                          }`}>
                            {prediction.percentile}%
                          </span>
                          {prediction.percentile >= 95 && (
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">{prediction.time}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          {prediction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-emerald-100 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredPredictions.length} of {predictions.length} predictions
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="bg-transparent" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="bg-emerald-100 border-emerald-300 text-emerald-700">
                  1
                </Button>
                <Button variant="outline" size="sm" className="bg-transparent">
                  2
                </Button>
                <Button variant="outline" size="sm" className="bg-transparent">
                  3
                </Button>
                <Button variant="outline" size="sm" className="bg-transparent">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </>
        )}
      </div>
    </div>
    </Suspense>
  )
}

export default function PredictionsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PredictionsContent />
    </Suspense>
  )
}
