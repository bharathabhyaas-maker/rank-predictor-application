"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { 
  TrendingUp, Users, Link2, Copy, Check, Eye, 
  ExternalLink, Settings, Brain, Database, BarChart3,
  ChevronRight, Sparkles, RefreshCw, Building2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import InstitutionNavigation from "@/components/institution-navigation"
import { useAuth } from "@/lib/auth-context"

// Helper function to format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return date.toLocaleDateString()
}

export default function InstitutionDashboardPage() {
  const { user } = useAuth()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [assignedTemplates, setAssignedTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [recentPredictions, setRecentPredictions] = useState<any[]>([])
  const [metrics, setMetrics] = useState({
    totalPredictions: 0,
    activeStudents: 0,
    activeTemplates: 0,
    avgAccuracy: "0%",
    todayPredictions: 0
  })
  
  // SSE connection state
  const [sseConnection, setSseConnection] = useState<EventSource | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    loadInstitutionData()
  }, [])

  // SSE connection for real-time updates
  useEffect(() => {
    if (!user?.institution?.id) return
    
    const connectSSE = () => {
      try {
        console.log('🔌 Connecting to SSE stream for institution:', user?.institution?.id)
        const eventSource = new EventSource(`/api/predictions/stream`)
        
        eventSource.onopen = () => {
          console.log('✅ SSE connection established')
          setIsLive(true)
          setRetryCount(0) // Reset retry count on successful connection
        }
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('📡 SSE message received:', data)
            
            if (data.type === 'connected') {
              console.log('✅ SSE connection confirmed')
            } else if (data.type === 'ping') {
              console.log('💓 SSE ping received')
            } else if (data.type === 'new_prediction') {
              console.log('🆕 New prediction received:', data.data)
              
              // Update recent predictions with new data
              setRecentPredictions(prev => [
                {
                  id: data.data.id,
                  student: data.data.studentName || data.data.studentEmail || 'Unknown',
                  template: data.data.templateName || data.data.examCode || 'Unknown',
                  score: data.data.score || data.data.predictedPercentile || 0,
                  rank: data.data.predictedRank || 0,
                  percentile: data.data.predictedPercentile || 0,
                  time: 'Just now'
                },
                ...prev.slice(0, 9) // Keep only latest 10
              ])
              
              // Update today's predictions count
              setMetrics(prev => ({
                ...prev,
                todayPredictions: prev.todayPredictions + 1
              }))
            }
          } catch (error) {
            console.error('Error parsing SSE message:', error)
          }
        }
        
        eventSource.onerror = (event) => {
          console.error('SSE connection error:', event)
          console.error('SSE error type:', (event as any)?.type)
          console.error('SSE error message:', (event as any)?.message)
          console.error('SSE readyState:', eventSource?.readyState)
          console.error('SSE URL:', `/api/predictions/stream`)
          
          setIsLive(false)
          setSseConnection(null)
          
          // Try to reconnect after 5 seconds (with max retry limit)
          setTimeout(() => {
            console.log('🔄 Attempting to reconnect SSE...')
            if (retryCount < 5) {
              connectSSE()
              setRetryCount(prev => prev + 1)
            } else {
              console.log('🔄 Max retry limit reached. Fallback to polling...')
              // Fallback to polling
              loadInstitutionData()
              setInterval(loadInstitutionData, 30000)
            }
          }, 5000)
        }
        
        setSseConnection(eventSource)
      } catch (error) {
        console.error('Error creating SSE connection:', error)
        setIsLive(false)
        setSseConnection(null)
        
        // Fallback: try to reconnect after 10 seconds
        setTimeout(() => {
          console.log('🔄 Fallback: attempting SSE reconnection...')
          connectSSE()
        }, 10000)
      }
    }
    
    connectSSE()
    
    // Cleanup on unmount
    return () => {
      if (sseConnection) {
        sseConnection.close()
      }
    }
  }, [user?.institution?.id])

  const loadInstitutionData = async () => {
  
    let institutionId = user?.institution?.id || user?.institutionId
    
    console.log('🔍 Institution Dashboard - Using institutionId:', institutionId)
    
    // TEMP DEBUG: If no institutionId, use a test one for debugging
    if (!institutionId) {
      console.log('⚠️ No institution ID found in user context, using test institution for debugging')
      institutionId = 'cmmk5bcww0006lglhjpl3h3gv' // Anwar Instituiton ID
      console.log('🔍 DEBUG: Using Anwar institutionId:', institutionId)
    }
    
    if (!institutionId) {
      console.log('❌ No institution ID found in user context')
      setLoading(false)
      return
    }


    try {
      setLoading(true)
      
      // Fetch assigned templates for this institution
      const templatesResponse = await fetch(`/api/institution-templates?institutionId=${institutionId}`)
      
      // Fetch full institution details
      const institutionResponse = await fetch(`/api/institutions/${institutionId}`)
      
      // Fetch recent predictions for this institution
      const predictionsResponse = await fetch(`/api/predictions?institutionId=${institutionId}`)
      
      if (templatesResponse.ok && institutionResponse.ok && predictionsResponse.ok) {
        const templates = await templatesResponse.json()
        const institutionData = await institutionResponse.json()
        const predictions = await predictionsResponse.json()
        
        setAssignedTemplates(templates)
        console.log('🔍 Dashboard - Templates Response:', templates)
        console.log('🔍 Dashboard - Templates Count:', templates.length)
        console.log('🔍 Dashboard - Template Predictions:', templates.map((t: any) => ({ name: t.name, predictions: t.predictions })))
    
        console.log('🔍 Dashboard - Raw Predictions:', predictions)
        console.log('🔍 Dashboard - Predictions Count:', predictions.length)
     
        
        
        // Process predictions data for display
        const processedPredictions = predictions.slice(0, 10).map((prediction: any) => ({
          id: prediction.id,
          student: prediction.studentName || prediction.studentEmail || 'Unknown',
          template: prediction.template?.name || prediction.template?.examCode || 'Unknown',
          score: prediction.score || 0,
          percentile: prediction.percentile || 'N/A',
          time: formatTimeAgo(prediction.createdAt)
        }))
        
        setRecentPredictions(processedPredictions)
        
        // Update user context with complete institution data
        if (user && institutionData) {
          const updatedUser = {
            ...user,
            institution: {
              ...user.institution,
              ...institutionData
            }
          }
          localStorage.setItem("user", JSON.stringify(updatedUser))
          // Update the user state to trigger re-render without page reload
          // Note: In a real app, you'd use a proper state management system
        }
        
        // Calculate metrics from actual predictions data
        const totalPreds = predictions.length // Use actual predictions count
        const activeTemps = templates.length // Show total assigned templates
        const avgAcc = templates.length > 0 
          ? (templates.reduce((sum: number, t: any) => sum + parseFloat(t.accuracy?.replace('%', '') || '0'), 0) / templates.length).toFixed(1) + '%'
          : '0%'
        
        // Calculate active students from predictions
        const uniqueStudents = new Set(predictions.map((p: any) => p.studentEmail || p.studentName).filter(Boolean)).size
        
        // Calculate today's predictions
        const today = new Date().toISOString().split('T')[0]
        const todayPredictions = predictions.filter((p: any) => 
          p.createdAt && p.createdAt.startsWith(today)
        ).length
        
        console.log('🔍 Dashboard Metrics Calculation:', {
          institutionId,
          templates: templates.length,
          predictions: predictions.length,
          totalPreds,
          activeTemps,
          uniqueStudents,
          todayPredictions,
          avgAcc,
          templateDetails: templates.map((t: any) => ({
            name: t.name,
            status: t.status,
            predictions: t.predictions,
            accuracy: t.accuracy
          })),
          predictionDetails: predictions.slice(0, 3).map((p: any) => ({
            id: p.id,
            studentEmail: p.studentEmail,
            templateId: p.templateId,
            institutionId: p.institutionId,
            createdAt: p.createdAt
          }))
        })
        
        setMetrics({
          totalPredictions: totalPreds, // Use actual prediction count from templates
          activeStudents: uniqueStudents, // Use actual unique student count
          activeTemplates: activeTemps, // Use total assigned templates count
          avgAccuracy: avgAcc,
          todayPredictions: todayPredictions // Add today's predictions
        })
      }
    } catch (error) {
      console.error('Failed to load institution data:', error)
    } finally {
      setLoading(false)
    }
  }

  const metricsArray = [
    { label: "TOTAL_PREDICTIONS", value: metrics.totalPredictions.toLocaleString(), change: "+12.3%", icon: TrendingUp },
    { label: "TODAY'S_PREDICTIONS", value: metrics.todayPredictions.toString(), change: "+5.1%", icon: Brain },
    { label: "ACTIVE_STUDENTS", value: metrics.activeStudents.toLocaleString(), change: "+8.2%", icon: Users },
    { label: "TEMPLATES_ACTIVE", value: metrics.activeTemplates.toString(), change: "0", icon: BarChart3 },
  ]

  const copyShareLink = (link: string, id: string) => {
    const fullUrl = `${window.location.origin}/predict/${link}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50">
      <InstitutionNavigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Institution Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your prediction templates and share links with students.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {metricsArray.map((metric: any) => {
            const Icon = metric.icon
            return (
              <div
                key={metric.label}
                className="bg-white border border-emerald-100 rounded-xl p-5 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    metric.change.startsWith("+") ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {metric.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">{metric.label}</p>
              </div>
            )
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white border-2 border-emerald-200 rounded-2xl p-12 text-center">
            <p className="text-gray-500">Loading your templates...</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/institution/links">
            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer group">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-emerald-900 mb-1">Student Links</h3>
              <p className="text-xs text-emerald-700">Generate and share prediction links</p>
            </div>
          </Link>
          <Link href="/institution/predictions">
            <div className="bg-gradient-to-br from-teal-100 to-cyan-100 border border-teal-200 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer group">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-teal-900 mb-1">View Predictions</h3>
              <p className="text-xs text-teal-700">See all student predictions</p>
            </div>
          </Link>
          <Link href="/institution/settings">
            <div className="bg-gradient-to-br from-cyan-100 to-blue-100 border border-cyan-200 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer group">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-cyan-900 mb-1">Settings</h3>
              <p className="text-xs text-cyan-700">Configure template placeholders</p>
            </div>
          </Link>
        </div>

        {/* Active Templates with Share Links */}
        {!loading && (
          <div className="bg-white border-2 border-emerald-200 rounded-2xl overflow-hidden shadow-lg mb-8">
            <div className="bg-gradient-to-r from-emerald-100 to-teal-100 px-6 py-4 border-b border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-emerald-900">Your Prediction Templates</h2>
                  <p className="text-sm text-emerald-700">Share these links with your students</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={loadInstitutionData}
                    variant="outline"
                    size="sm"
                    className="border-emerald-300 hover:bg-emerald-50 text-emerald-700"
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Link href="/institution/links">
                    <Button variant="outline" size="sm" className="bg-transparent border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                      Manage All Links
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="divide-y divide-emerald-100">
              {assignedTemplates.length > 0 ? (
                assignedTemplates.map((template: any) => (
                  <div key={template.id} className="p-5 hover:bg-emerald-50/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white ${
                          template.type === "ai" 
                            ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                            : "bg-gradient-to-br from-teal-500 to-cyan-500"
                        }`}>
                          {template.type === "ai" ? <Brain className="w-6 h-6" /> : <Database className="w-6 h-6" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900">{template.name}</h3>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              template.status === "active" 
                                ? "bg-green-100 text-green-700" 
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {template.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.predictions?.toLocaleString() || 0} predictions | {template.students?.toLocaleString() || 0} students | {template.accuracy || 'N/A'} accuracy
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Share Link Box */}
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                          <Link 
                            href={`/predict/${template.shareLink}`} 
                            target="_blank"
                            className="text-sm font-mono text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                          >
                            /predict/{template.shareLink}
                          </Link>
                          <button
                            onClick={() => copyShareLink(template.shareLink, template.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Copy link"
                          >
                            {copiedId === template.id ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                        
                        <Link href={`/predict/${template.shareLink}`} target="_blank">
                          <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                        </Link>
                        
                        <Link href={`/institution/templates/${template.id}`}>
                          <Button size="sm" variant="outline" className="bg-transparent border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                            <Settings className="w-4 h-4 mr-1" />
                            Configure
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <p className="text-gray-500">No templates assigned to your institution yet.</p>
                  <p className="text-sm text-gray-400 mt-2">Contact your administrator to get access to prediction templates.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Predictions */}
        <div className="bg-white border-2 border-emerald-200 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-emerald-100 to-teal-100 px-6 py-4 border-b border-emerald-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-xl font-bold text-emerald-900">Recent Predictions</h2>
                  <p className="text-sm text-emerald-700">Live feed of student predictions</p>
                </div>
                {isLive && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">LIVE</span>
                  </div>
                )}
              </div>
              <Link href="/institution/predictions">
                <Button variant="outline" size="sm" className="bg-transparent border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-emerald-50 border-b border-emerald-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-900 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-900 uppercase">Template</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-900 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-900 uppercase">Percentile</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-900 uppercase">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentPredictions.length > 0 ? (
                  recentPredictions.map((prediction) => (
                    <tr key={prediction.id} className="border-b border-emerald-50 hover:bg-emerald-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <code className="text-sm font-mono text-gray-700">{prediction.student}</code>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">{prediction.template}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">{prediction.score}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-lg">
                          {prediction.percentile}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">{prediction.time}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <p className="text-gray-500">No predictions yet.</p>
                      <p className="text-sm text-gray-400 mt-2">Students haven't made any predictions using your templates.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
