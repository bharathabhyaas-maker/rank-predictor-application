"use client"

import Link from "next/link"
import { Database, TrendingUp, Users, Copy, Check, Share2, Eye, FileText, Settings, Brain, ToggleLeft, ToggleRight, ChevronRight, RefreshCw, UserPlus, BarChart3, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import AdminNavigation from "@/components/admin-navigation"
import { useState, useEffect } from "react"
import { getInstitutionStats, getTotalPredictions, getTotalStudents, getActiveInstitutionCount, getInstitutionsWithTemplatesCount, getTemplateStats } from "@/lib/client-api"
import { useAuth } from "@/lib/auth-context"
import { getPermissions, hasPermission } from "@/lib/permissions"

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const userPermissions = getPermissions(user?.role || '')
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null)
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([])
  
  // Real data states
  const [templates, setTemplates] = useState<any[]>([])
  const [institutions, setInstitutions] = useState<any[]>([])
  const [totalPredictions, setTotalPredictions] = useState<number>(0)
  const [totalStudents, setTotalStudents] = useState<number>(0)
  const [activeInstitutions, setActiveInstitutions] = useState<number>(0)
  const [institutionsWithTemplates, setInstitutionsWithTemplates] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [templatesData, institutionsData, predictions, students, activeInst, institutionsWithTemplatesData] = await Promise.all([
        getTemplateStats(),
        getInstitutionStats(),
        getTotalPredictions(),
        getTotalStudents(),
        getActiveInstitutionCount(),
        getInstitutionsWithTemplatesCount()
      ])
      
      setTemplates(templatesData)
      setInstitutions(institutionsData)
      setTotalPredictions(predictions)
      setTotalStudents(students)
      setActiveInstitutions(activeInst)
      setInstitutionsWithTemplates(institutionsWithTemplatesData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTemplateStatus = async (templateId: string) => {
    try {
      const template = templates.find(t => t.id === templateId)
      if (!template) return
      
      const newStatus = template.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
      
      const response = await fetch('/api/templates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: templateId,
          status: newStatus
        })
      })

      if (response.ok) {
        setTemplates(templates.map((t: any) => 
          t.id === templateId 
            ? { ...t, status: newStatus }
            : t
        ))
      } else {
        alert('Failed to update template status')
      }
    } catch (error) {
      console.error('Failed to toggle template status:', error)
      alert('Failed to update template status')
    }
  }

  const handleEditTemplate = (template: any) => {
    // Navigate to edit page or open edit modal
    // For now, let's navigate to a new edit page
    window.location.href = `/admin/exams/${template.id}/edit`
  }

  const handleAssignTemplate = (template: any) => {
    console.log('🔍 Opening assignment modal for template:', template.name);
    console.log('🔍 Current institutions state:', institutions);
    console.log('🔍 Current selectedInstitutions state:', selectedInstitutions);
    console.log('🔍 Template assignedTo data:', template.assignedTo);
    
    setSelectedTemplate(template)
    
    // Pre-select institutions that are already assigned to this template
    const alreadyAssignedIds = template.assignedTo ? template.assignedTo.map((assignment: any) => assignment.institutionId) : [];
    console.log('🔍 Pre-selecting already assigned institutions:', alreadyAssignedIds);
    setSelectedInstitutions(alreadyAssignedIds)
    setShowAssignModal(true)
  }

  const handleAssignTemplateToInstitutions = async () => {
    if (!selectedTemplate || selectedInstitutions.length === 0) {
      alert('Please select at least one institution')
      return
    }

    try {
      const assignPromises = selectedInstitutions.map(institutionId =>
        fetch('/api/exams/assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: selectedTemplate.id,
            institutionId
          })
        })
      )

      const results = await Promise.all(assignPromises)
      
      if (results.every(r => r.ok)) {
        alert(`Template assigned to ${selectedInstitutions.length} institution(s) successfully`)
        setShowAssignModal(false)
        setSelectedTemplate(null)
        setSelectedInstitutions([])
        // Refresh template data to show updated assignment status
        await loadDashboardData()
      } else {
        alert('Failed to assign template to some institutions')
      }
    } catch (error) {
      console.error('Failed to assign template:', error)
      alert('Failed to assign template')
    }
  }

  const metrics = [
    { label: "TEMPLATES_CREATED", value: templates.length.toString(), change: "+3", icon: Database },
    { label: "INSTITUTIONS_USING", value: institutionsWithTemplates.toString(), change: "+12", icon: Users },
    { label: "TOTAL_PREDICTIONS", value: totalPredictions.toLocaleString(), change: "+12.3%", icon: TrendingUp },
    { label: "TOTAL_STUDENTS", value: totalStudents.toLocaleString(), change: "+18.7%", icon: Users },
  ]

  const exams = templates

  const copyShareLink = (shareLink: string, examId: number) => {
    const fullUrl = `${window.location.origin}/predict/${shareLink}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedId(examId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-indigo-50">
      <AdminNavigation />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {user?.role?.toUpperCase() || 'USER'}
                </span>
                <span className="text-muted-foreground">
                  {user?.name}
                </span>
              </div>
            </div>
            <Button
              onClick={loadDashboardData}
              variant="outline"
              size="sm"
              className="border-purple-300 hover:bg-purple-50 text-purple-700"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <p className="text-muted-foreground text-lg">
            Create prediction templates and manage institutions for system administration.
          </p>
        </div>

        {/* Quick Navigation Cards section - Features shown based on permissions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Show features based on user permissions */}
          {userPermissions.canCreateTemplates && (
            <Link href="/admin/exams/new">
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200 rounded-xl p-5 hover:shadow-xl transition-all cursor-pointer group">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-base font-bold mb-1 text-purple-900">Create Template</h3>
                <p className="text-xs text-purple-700">Build AI prediction templates to sell</p>
              </div>
            </Link>
          )}
          
          {userPermissions.canManageInstitutions && (
            <Link href="/admin/users">
              <div className="bg-gradient-to-br from-indigo-100 to-blue-100 border border-indigo-200 rounded-xl p-5 hover:shadow-xl transition-all cursor-pointer group">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold mb-1 text-indigo-900">Manage Institutions</h3>
                <p className="text-xs text-indigo-700">Create and manage institution accounts</p>
              </div>
            </Link>
          )}
          
          {userPermissions.canManageDatasets && (
            <Link href="/admin/datasets">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200 rounded-xl p-5 hover:shadow-xl transition-all cursor-pointer group">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold mb-1 text-green-900">Manage Datasets</h3>
                <p className="text-xs text-green-700">Upload and manage historical exam data</p>
              </div>
            </Link>
          )}
          
          {/* Show alternative features for users without certain permissions */}
          {!userPermissions.canCreateTemplates && !userPermissions.canManageInstitutions && !userPermissions.canManageDatasets && (
            <>
              <Link href="/admin/reports">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200 rounded-xl p-5 hover:shadow-xl transition-all cursor-pointer group">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base font-bold mb-1 text-purple-900">View Reports</h3>
                  <p className="text-xs text-purple-700">Access system reports and data</p>
                </div>
              </Link>
              
              <Link href="/admin/users">
                <div className="bg-gradient-to-br from-indigo-100 to-blue-100 border border-indigo-200 rounded-xl p-5 hover:shadow-xl transition-all cursor-pointer group">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base font-bold mb-1 text-indigo-900">Team Management</h3>
                  <p className="text-xs text-indigo-700">Manage team members and assignments</p>
                </div>
              </Link>
            </>
          )}
        </div>

        {/* Created Templates Section */}
        <div className="bg-white border-2 border-purple-200 rounded-2xl overflow-hidden shadow-lg mb-8">
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 px-6 py-4 border-b border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-1 text-purple-900">Your Prediction Templates</h2>
                <p className="text-sm text-purple-700">
                  Templates you created. Assign these to institutions who purchase access for their students.
                </p>
              </div>
              <Link href="/admin/exams/new">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  Create Template
                </Button>
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {templates.map((template: any) => (
              <div key={template.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-purple-500 to-indigo-500">
                      <Brain className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{template.name}</h3>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          template.status === "ACTIVE" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {template.status}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full capitalize bg-purple-100 text-purple-700">
                          {template.type === 'conditional' ? 'Condition Based' : (template.type === 'ai' ? 'AI' : 'Dataset')}
                        </span>
                        {template.assignedInstitutions > 0 && (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                            {template.assignedInstitutions} assigned
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.predictions.toLocaleString()} predictions | Accuracy: {template.accuracy}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {userPermissions.canEditTemplates && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                        className="bg-transparent border-purple-300 text-purple-700 hover:bg-purple-50"
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    {userPermissions.canAssignTemplates && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssignTemplate(template)}
                        className="bg-transparent border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Assign
                      </Button>
                    )}
                    {userPermissions.canEditTemplates && (
                      <button
                        onClick={() => toggleTemplateStatus(template.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {template.status === "ACTIVE" ? (
                          <ToggleRight className="w-6 h-6 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Template Details Preview */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs">
                    <span className="text-gray-500">Exam Code:</span>{" "}
                    <span className="font-semibold">{template.examCode}</span>
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs">
                    <span className="text-gray-500">Share Link:</span>{" "}
                    <span className="font-semibold">/{template.shareLink}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div
                key={index}
                className="bg-white border border-primary/10 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      metric.change.startsWith("+") ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {metric.change}
                  </span>
                </div>
                <div className="text-3xl font-bold mb-1">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label.replace(/_/g, " ")}</div>
              </div>
            )
          })}
        </div>

        {/* Institution Sales Table */}
        <div className="bg-white border-2 border-purple-200 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 px-8 py-6 border-b border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1 text-purple-900">Institution Assignments</h2>
                <p className="text-sm text-purple-700">
                  Track which institutions are using your templates
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/admin/users">
                  <Button variant="outline" className="border-purple-300 hover:bg-purple-50 bg-transparent text-purple-700">
                    Manage Institutions
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-purple-50 border-b border-purple-200">
                  <th className="px-8 py-4 text-left text-sm font-semibold text-purple-900">Template</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-purple-900">Institutions</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-purple-900">Total Predictions</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-purple-900">Status</th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-purple-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id} className="border-b border-purple-100 hover:bg-purple-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="font-semibold text-gray-900">{exam.name}</div>
                      <div className="text-sm text-muted-foreground">Accuracy: {exam.accuracy}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-2">
                        <span className="font-semibold text-purple-700">{exam.assignedInstitutions || 0} institutions</span>
                        {exam.assignedTo && exam.assignedTo.length > 0 && (
                          <div className="text-xs text-gray-500 max-w-xs">
                            Assigned to: {exam.assignedTo.slice(0, 2).map((assignment: any) => assignment.institutionName).join(', ')}
                            {exam.assignedTo.length > 2 && ` +${exam.assignedTo.length - 2} more`}
                          </div>
                        )}
                      </div>
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
                      <div className="flex items-center gap-2">
                        <Link href={`/predict/${exam.shareLink}`} target="_blank">
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg transition-all"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-purple-300 hover:bg-purple-50 text-purple-700 bg-transparent"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Assign
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Template Configuration Modal */}
        {showConfigModal && selectedTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Template Details</h2>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.name}</p>
                </div>
                <button 
                  onClick={() => setShowConfigModal(false)} 
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Exam Code</p>
                    <p className="font-semibold">{selectedTemplate.examCode}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-semibold">{selectedTemplate.status}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Predictions</p>
                    <p className="font-semibold">{selectedTemplate.predictions.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Accuracy</p>
                    <p className="font-semibold">{selectedTemplate.accuracy}</p>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-500">Share Link</p>
                  <p className="font-semibold text-blue-700">/predict/{selectedTemplate.shareLink}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 bg-transparent border-purple-300"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowConfigModal(false)
                    handleEditTemplate(selectedTemplate)
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600"
                >
                  Edit Template
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Template Modal */}
        {showAssignModal && selectedTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Manage Template Assignments</h2>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.name}</p>
                </div>
                <button 
                  onClick={() => setShowAssignModal(false)} 
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Select institutions to assign this template to:</p>
                  <p className="text-xs text-gray-500 mb-2">Currently assigned institutions are pre-selected. Uncheck to remove assignments.</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {institutions.map((institution: any) => {
                      const isAssigned = selectedInstitutions.includes(institution.id);
                      return (
                      <label key={institution.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isAssigned ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200 hover:border-purple-300'
                      }`}>
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={(e) => {
                            console.log('🔍 Checkbox changed:', {
                              institutionId: institution.id,
                              institutionName: institution.name,
                              checked: e.target.checked,
                              currentSelected: selectedInstitutions
                            });
                            if (e.target.checked) {
                              const newSelection = [...selectedInstitutions, institution.id];
                              console.log('🔍 Adding to selection:', newSelection);
                              setSelectedInstitutions(newSelection);
                            } else {
                              const newSelection = selectedInstitutions.filter(id => id !== institution.id);
                              console.log('🔍 Removing from selection:', newSelection);
                              setSelectedInstitutions(newSelection);
                            }
                          }}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{institution.name}</p>
                          <p className="text-sm text-gray-500">{institution.location}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          institution.plan === 'Enterprise' 
                            ? "bg-indigo-100 text-indigo-700"
                            : institution.plan === 'Premium'
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {institution.plan}
                        </span>
                        {isAssigned && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                            Assigned
                          </span>
                        )}
                      </label>
                      )
                    })}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Selected:</strong> {selectedInstitutions.length} institution{selectedInstitutions.length !== 1 ? 's' : ''} will get access to this template.
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Debug: selectedInstitutions = [{selectedInstitutions.join(', ')}]
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 bg-transparent border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignTemplateToInstitutions}
                  disabled={selectedInstitutions.length === 0}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 disabled:opacity-50"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Update Assignments ({selectedInstitutions.length} institution{selectedInstitutions.length !== 1 ? 's' : ''})
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
