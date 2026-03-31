"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, Plus, Trash2, Users, Eye, RefreshCw } from "lucide-react"
import InstitutionNavigation from "@/components/institution-navigation"

interface Template {
  id: string
  name: string
  examCode: string
  description: string
  type: string
  status: string
  shareLink: string
  accuracy: string
  predictions: number
  students: number
  assignedAt: string
}

export default function InstitutionTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [institutions, setInstitutions] = useState<any[]>([])
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadInstitutions()
  }, [])

  useEffect(() => {
    if (selectedInstitutions.length > 0) {
      loadTemplatesForInstitutions(selectedInstitutions)
    }
  }, [selectedInstitutions])

  const loadInstitutions = async () => {
    try {
      const response = await fetch('/api/institutions')
      if (response.ok) {
        const institutionsData = await response.json()
        setInstitutions(institutionsData)
        if (institutionsData.length > 0) {
          setSelectedInstitutions([institutionsData[0].id]) // Default select first institution
        }
      }
    } catch (error) {
      console.error('Failed to load institutions:', error)
    }
  }

  const loadTemplates = async () => {
    if (selectedInstitutions.length === 0) return

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Loading templates for institutions:', selectedInstitutions)
      
      const templatePromises = selectedInstitutions.map(async (institutionId) => {
        const response = await fetch(`/api/institution-templates?institutionId=${institutionId}`)
        
        if (response.ok) {
          const data = await response.json()
          console.log(`✅ Templates loaded for institution ${institutionId}:`, data.length)
          return { institutionId, templates: data }
        } else {
          console.error(`❌ Failed to load templates for institution ${institutionId}:`, response.status)
          return { institutionId, templates: [] }
        }
      })
      
      const results = await Promise.all(templatePromises)
      
      // Combine all templates from all institutions
      const allTemplates = results.flatMap(result => result.templates)
      
      console.log('✅ Total combined templates loaded:', allTemplates.length)
      setTemplates(allTemplates)
      
    } catch (error) {
      console.error('Failed to load templates:', error)
      setError('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const loadTemplatesForInstitutions = async (institutionIds: string[]) => {
    console.log('🔄 Loading templates for institutions:', institutionIds)
    await loadTemplates()
  }

  const assignTemplate = async (templateId: string) => {
    if (selectedInstitutions.length === 0) {
      alert('Please select at least one institution first')
      return
    }

    try {
      console.log('🔗 Assigning template:', templateId, 'to institutions:', selectedInstitutions)
      
      setUpdating(true)
      
      const assignPromises = selectedInstitutions.map(async (institutionId) => {
        return await fetch('/api/institution-templates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            institutionId: institutionId,
            templateId: templateId
          })
        })
      })

      const responses = await Promise.all(assignPromises)
      const result = await Promise.all(responses.map(response => response.json()))

      if (responses.every(response => response.ok)) {
        console.log('✅ Template assigned successfully')
        loadTemplates() // Reload templates
      } else {
        console.error('❌ Assignment failed:', result)
        const errorMessages = result
          .filter(r => r.error)
          .map(r => r.error)
          .join(', ')
        alert(`Failed to assign template: ${errorMessages || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Assignment error:', error)
      alert('Failed to assign template. Please try again.')
    }
  }

  const unassignTemplate = async (templateId: string, templateName: string) => {
    if (!confirm(`Are you sure you want to remove "${templateName}" from selected institutions? This action cannot be undone.`)) {
      return
    }

    if (selectedInstitutions.length === 0) {
      alert('Please select at least one institution first')
      return
    }

    try {
      console.log('🗑️ Unassigning template:', templateId, 'from institutions:', selectedInstitutions)
      
      setUpdating(true)
      
      // Unassign from all selected institutions
      const unassignPromises = selectedInstitutions.map(async (institutionId) => {
        console.log(`🗑️ Unassigning from institution: ${institutionId}`)
        
        const response = await fetch(`/api/institution-templates?institutionId=${institutionId}&templateId=${templateId}`, {
          method: 'DELETE'
        })

        const result = await response.json()

        if (response.ok) {
          console.log(`✅ Successfully unassigned from institution: ${institutionId}`)
          return { institutionId, success: true, result }
        } else {
          console.error(`❌ Failed to unassign from institution: ${institutionId}`, result)
          return { institutionId, success: false, result }
        }
      })
      
      const unassignResults = await Promise.all(unassignPromises)
      
      // Show success/error messages
      const successCount = unassignResults.filter(r => r.success).length
      const failCount = unassignResults.length - successCount
      
      if (successCount > 0) {
        alert(`Template unassigned from ${successCount} institution(s) successfully!`)
        // Reload templates for all selected institutions
        await loadTemplatesForInstitutions(selectedInstitutions)
        
        // Force page refresh to clear any cached data
        console.log('🔄 Refreshing page to clear cached data...')
        window.location.reload()
      } else {
        alert(`Failed to unassign template from ${failCount} institution(s)`)
      }
      
    } catch (error) {
      console.error('Unassignment error:', error)
      alert('Failed to unassign template. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
        <InstitutionNavigation />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Loading templates...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <InstitutionNavigation />

      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Template Management</h1>
            <p className="text-muted-foreground mt-1">Assign and manage templates for your institution</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              disabled={loading}
              className="border-primary/20 hover:bg-primary/5"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Page
            </Button>
            <Link href="/admin/templates/new">
              <Button className="bg-gradient-to-r from-primary to-accent">
                <Plus className="h-4 w-4 mr-2" />
                Create New Template
              </Button>
            </Link>
          </div>
        </div>

        {/* Institution Selector */}
        <div className="bg-white border border-primary/10 rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Select Institution</h2>
          <div className="text-sm text-muted-foreground mb-4">
            Choose an institution to manage its template assignments
          </div>
          <div className="text-center">
            <Button 
              onClick={loadInstitutions}
              variant="outline"
              disabled={loading}
            >
              <Users className="h-4 w-4 mr-2" />
              Refresh Institutions
            </Button>
          </div>
        </div>
        
        {/* Update Assignments */}
        {selectedInstitutions.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Update Assignments</h3>
                <p className="text-sm text-blue-700">
                  Apply changes to {selectedInstitutions.length} selected institution(s)
                </p>
              </div>
              <Button
                onClick={() => loadTemplatesForInstitutions(selectedInstitutions)}
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updating ? 'Updating...' : 'Update Assignments'}
              </Button>
            </div>
          </div>
        )}

        {/* Templates List */}
        <div className="bg-white border border-primary/10 rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">
                Templates {templates.length > 0 && `(${templates.length})`}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage template assignments for selected institution
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {templates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
                <p className="text-sm">
                  No templates have been assigned to this institution yet.
                </p>
                <Link href="/admin/templates/all">
                  <Button variant="outline" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Browse All Templates
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Template</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Predictions</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Students</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Assigned</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => (
                    <tr key={template.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{template.name}</div>
                          <div className="text-sm text-gray-500">{template.examCode}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            template.type === 'conditional' 
                              ? "bg-amber-100 text-amber-700" 
                              : template.type === 'ai'
                                ? "bg-violet-100 text-violet-700"
                                : "bg-cyan-100 text-cyan-700"
                          }`}
                        >
                          {template.type === 'conditional' ? 'Condition Based' : (template.type === 'ai' ? 'AI' : 'Dataset')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold">{template.predictions.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold">{template.students.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            template.assignedAt ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {template.assignedAt ? 'Assigned' : 'Not Assigned'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/predict/${template.shareLink}`} target="_blank">
                            <Button size="sm" variant="ghost" className="hover:bg-primary/10">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          {!template.assignedAt ? (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => assignTemplate(template.id)}
                              className="hover:bg-primary/90"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => unassignTemplate(template.id, template.name)}
                              className="hover:bg-destructive/90"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
