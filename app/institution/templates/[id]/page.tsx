"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { 
  ArrowLeft, Brain, Database, Save, Eye, Settings,
  Info, Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import InstitutionNavigation from "@/components/institution-navigation"

interface Placeholder {
  key: string
  label: string
  value?: string
  options?: string[]
}

interface Template {
  id: string
  name: string
  type: "ai" | "dataset"
  placeholders?: Placeholder[]
  promptTemplate?: string
}

export default function TemplateConfigPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({})

  // Load template data from database
  useEffect(() => {
    loadTemplateData()
  }, [id])

  const loadTemplateData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Loading template data for ID:', id)
      
      // Try to get template from database
      const templateResponse = await fetch(`/api/templates/${id}`)
      
      if (templateResponse.ok) {
        const templateData = await templateResponse.json()
        console.log('✅ Template data loaded:', templateData)
        setTemplate(templateData)
        
        
        // Only set placeholder values if placeholders exist
        if (templateData.placeholders && Array.isArray(templateData.placeholders)) {
          setPlaceholderValues(Object.fromEntries(templateData.placeholders.map((p: Placeholder) => [p.key, p.value])))
        } else {
          setPlaceholderValues({})
        }
      } else {
        console.error('❌ Failed to load template:', templateResponse.status)
        setError('Failed to load template data')
      }
    } catch (err) {
      console.error('❌ Error loading template:', err)
      setError('Error loading template data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaved(true)
      
      // Save template configuration to database
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placeholders: Object.entries(placeholderValues).map(([key, value]) => ({ key, value })),
        }),
      })
      
      if (response.ok) {
        console.log('✅ Template configuration saved')
        setTimeout(() => setSaved(false), 2000)
      } else {
        console.error('❌ Failed to save template configuration')
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (err) {
      console.error('❌ Error saving template:', err)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mb-4"></div>
          <h2 className="text-xl font-bold text-emerald-900">Loading Template Configuration...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl border border-red-200 max-w-md">
          <div className="h-16 w-16 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-6">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Template Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <Link href="/institution/dashboard">
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl border border-red-200 max-w-md">
          <div className="h-16 w-16 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-6">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Template Not Found</h1>
          <p className="text-gray-600 mb-6">
            The requested template could not be found or loaded.
          </p>
          <Link href="/institution/dashboard">
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50">
      <InstitutionNavigation />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/institution/dashboard" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 rounded-xl flex items-center justify-center text-white ${
              template.type === "ai" 
                ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                : "bg-gradient-to-br from-teal-500 to-cyan-500"
            }`}>
              {template.type === "ai" ? <Brain className="w-7 h-7" /> : <Database className="w-7 h-7" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                template.type === "ai" 
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-teal-100 text-teal-700"
              }`}>
                {template.type === "ai" ? "AI Prediction" : "Dataset-based"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/predict/${id}`} target="_blank">
              <Button variant="outline" className="bg-transparent border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </Link>
            <Button 
              onClick={handleSave}
              className={`transition-all ${
                saved 
                  ? "bg-green-600 hover:bg-green-600" 
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              }`}
            >
              <Save className="w-4 h-4 mr-2" />
              {saved ? "Saved!" : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white border-2 border-emerald-200 rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-emerald-100 to-teal-100 px-6 py-4 border-b border-emerald-200">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-700" />
                  <h2 className="text-lg font-bold text-emerald-900">Configure Placeholder Values</h2>
                </div>
                <p className="text-sm text-emerald-700 mt-1">
                  Customize these values to match your institution's requirements
                </p>
              </div>

              <div className="p-6 space-y-4">
                {template.placeholders && template.placeholders.length > 0 ? (
                  template.placeholders.map((placeholder) => (
                    <div key={placeholder.key} className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-900">
                          {placeholder.label}
                        </label>
                        <code className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded font-mono">
                          {`{{${placeholder.key}}}`}
                        </code>
                      </div>
                      {placeholder.options ? (
                        <select
                          value={placeholderValues[placeholder.key]}
                          onChange={(e) => setPlaceholderValues({...placeholderValues, [placeholder.key]: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          {placeholder.options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={placeholderValues[placeholder.key]}
                          onChange={(e) => setPlaceholderValues({...placeholderValues, [placeholder.key]: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <p className="text-sm text-emerald-700">
                      This template doesn't have configurable placeholders. 
                      Configuration options are managed through exam conditions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Prompt Preview (for AI templates) */}
            {template.type === "ai" && "promptTemplate" in template && template.promptTemplate && (
              <div className="bg-white border-2 border-emerald-200 rounded-2xl overflow-hidden shadow-lg">
                <div className="bg-gradient-to-r from-emerald-100 to-teal-100 px-6 py-4 border-b border-emerald-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-700" />
                    <h3 className="font-bold text-emerald-900">AI Prompt Preview</h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-700 font-mono bg-gray-50 p-4 rounded-lg leading-relaxed">
                    {template.promptTemplate}
                  </p>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Info className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-900 mb-2">How Placeholders Work</h3>
                  <ul className="space-y-2 text-sm text-emerald-800">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-0.5">1.</span>
                      <span>Values you set here are used when generating predictions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-0.5">2.</span>
                      <span>Placeholders like {"{{score}}"} are auto-filled from student input</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-0.5">3.</span>
                      <span>Changes take effect immediately for new predictions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Template Stats */}
            <div className="bg-white border border-emerald-100 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Template Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Predictions</span>
                  <span className="font-semibold text-gray-900">8,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Students</span>
                  <span className="font-semibold text-gray-900">1,245</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Accuracy Rate</span>
                  <span className="font-semibold text-emerald-600">94.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="font-semibold text-gray-900">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
