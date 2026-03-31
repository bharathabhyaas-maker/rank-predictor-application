"use client"

import Link from "next/link"
import AdminHeader from "@/components/admin-header"
import { Button } from "@/components/ui/button"
import { Copy, Check, Eye, Edit, Trash2, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { getTemplateStats, TemplateStats } from "@/lib/client-api"

export default function AllExamsPage() {
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [exams, setExams] = useState<TemplateStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const data = await getTemplateStats()
      setExams(data)
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyShareLink = (shareLink: string, examId: string) => {
    const fullUrl = `${window.location.origin}/predict/${shareLink}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedId(parseInt(examId))
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleEdit = (examId: string) => {
    window.location.href = `/admin/exams/edit?id=${examId}`
  }

  const handleDelete = async (examId: string, examName: string) => {
    if (!confirm(`Are you sure you want to delete "${examName}"? This action cannot be undone.`)) {
      return
    }

    try {
      console.log(`🗑️ Attempting to delete template: ${examId}`)
      
      const response = await fetch(`/api/templates?id=${examId}`, {
        method: 'DELETE'
      })

      console.log(`📊 Delete response status: ${response.status}`)
      
      // Get response text for better error handling
      const responseText = await response.text()
      console.log(`📊 Delete response: ${responseText}`)

      if (response.ok) {
        let result
        try {
          result = JSON.parse(responseText)
        } catch (e) {
          result = { message: 'Delete completed (parsing failed)' }
        }
        
        alert(`Template deleted successfully! ${result.message || ''}`)
        
        // Force refresh the template list
        console.log('🔄 Refreshing template list...')
        await loadTemplates()
        
      } else {
        let errorDetails
        let errorText = responseText || 'Empty response from server'
        
        try {
          errorDetails = JSON.parse(responseText)
        } catch (e) {
          errorDetails = { 
            error: 'Server error', 
            details: 'Failed to parse server response',
            rawResponse: responseText.substring(0, 200) // First 200 chars
          }
        }
        
        console.error('❌ Delete failed:', {
          status: response.status,
          statusText: response.statusText,
          errorDetails: errorDetails,
          rawResponse: responseText.substring(0, 200)
        })
        
        // Provide user-friendly error message
        let errorMessage = 'Failed to delete template'
        
        if (errorDetails.details?.includes('assigned to')) {
          errorMessage = 'Cannot delete: Template is assigned to institutions. Please unassign first.'
        } else if (errorDetails.details?.includes('foreign key')) {
          errorMessage = 'Cannot delete: Template has linked data. Contact administrator.'
 
        } else if (errorDetails.error) {
          errorMessage = `Failed to delete: ${errorDetails.error}`
        } else if (response.status === 500) {
          errorMessage = 'Server error occurred. Please try again or contact administrator.'
        } else {
          errorMessage = `Delete failed (${response.status}): ${response.statusText || 'Unknown error'}`
        }
        
        alert(errorMessage)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete template. Please try again or contact administrator.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <AdminHeader showBack={true} backLink="/admin/dashboard" title="All Exam Templates" />

      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">All Exam Templates ({exams.length})</h2>
            <p className="text-muted-foreground mt-1">Manage and view all your exam prediction templates</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={loadTemplates} 
              variant="outline" 
              disabled={loading}
              className="border-primary/20 hover:bg-primary/5"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/admin/exams/new">
              <Button className="bg-gradient-to-r from-primary to-accent">Create New Template</Button>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto bg-white border border-primary/10 rounded-2xl shadow-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">Exam Name</th>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">Predictions</th>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">Accuracy</th>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="font-semibold text-gray-900">{exam.name}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        exam.type === 'conditional' 
                          ? "bg-amber-100 text-amber-700" 
                          : exam.type === 'ai'
                            ? "bg-violet-100 text-violet-700"
                            : "bg-cyan-100 text-cyan-700"
                      }`}
                    >
                      {exam.type === 'conditional' ? 'Condition Based' : (exam.type === 'ai' ? 'AI' : 'Dataset')}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-semibold">{exam.predictions.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        exam.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {exam.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-semibold">{exam.accuracy}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <Link href={`/predict/${exam.shareLink}`} target="_blank">
                        <Button size="sm" variant="ghost" className="hover:bg-primary/10">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyShareLink(exam.shareLink, exam.id)}
                        className="hover:bg-primary/10"
                      >
                        {copiedId === parseInt(exam.id) ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEdit(exam.id)}
                        className="hover:bg-primary/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDelete(exam.id, exam.name)}
                        className="hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
