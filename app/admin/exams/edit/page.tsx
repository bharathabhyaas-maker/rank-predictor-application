"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import AdminHeader from "@/components/admin-header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { getTemplateStats, TemplateStats } from "@/lib/client-api"

export default function EditExamPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get("id")
  
  const [template, setTemplate] = useState<TemplateStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (templateId) {
      loadTemplate()
    } else {
      router.push("/admin/exams/all")
    }
  }, [templateId])

  const loadTemplate = async () => {
    try {
      setLoading(true)
      // For now, we'll use the templates API to get template details
      const response = await fetch("/api/templates")
      const templates = await response.json()
      const foundTemplate = templates.find((t: TemplateStats) => t.id === templateId)
      
      if (foundTemplate) {
        setTemplate(foundTemplate)
      } else {
        alert("Template not found")
        router.push("/admin/exams/all")
      }
    } catch (error) {
      console.error("Failed to load template:", error)
      alert("Failed to load template")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async () => {
    if (!template) return

    try {
      setSaving(true)
      const newStatus = template.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
      await updateTemplateStatus(template.id, newStatus)
      
      setTemplate({ ...template, status: newStatus })
      alert(`Template ${newStatus === "ACTIVE" ? "activated" : "deactivated"} successfully`)
    } catch (error) {
      console.error("Failed to update status:", error)
      alert("Failed to update template status")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!template) return

    if (!confirm(`Are you sure you want to delete "${template.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/templates?id=${template.id}`, {
        method: "DELETE"
      })

      const result = await response.json()

      if (response.ok) {
        alert("Template deleted successfully!")
        router.push("/admin/exams/all")
      } else {
        alert(`Failed to delete template: ${result.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete template. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
        <AdminHeader showBack={true} backLink="/admin/exams/all" title="Edit Template" />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Loading template details...</div>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
        <AdminHeader showBack={true} backLink="/admin/exams/all" title="Template Not Found" />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-destructive">Template not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <AdminHeader showBack={true} backLink="/admin/exams/all" title={`Edit ${template.name}`} />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Template Header */}
          <div className="bg-white border border-primary/10 rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{template.name}</h1>
                <div className="flex items-center gap-4">
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
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      template.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {template.status}
                  </span>
                </div>
                <p className="text-muted-foreground mt-2">{template.examCode}</p>
              </div>
            </div>

            {/* Template Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="text-3xl font-bold text-primary">{template.predictions.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Predictions</div>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600">{template.accuracy}</div>
                <div className="text-sm text-muted-foreground mt-1">Accuracy</div>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600">{template.shareLink}</div>
                <div className="text-sm text-muted-foreground mt-1">Share Link</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white border border-primary/10 rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold mb-6">Template Actions</h2>
            
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleStatusToggle}
                disabled={saving}
                className={`${
                  template.status === "ACTIVE" 
                    ? "bg-yellow-600 hover:bg-yellow-700" 
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {template.status === "ACTIVE" ? "Deactivate" : "Activate"}
              </Button>

              <Link href={`/predict/${template.shareLink}`} target="_blank">
                <Button variant="outline">View Prediction Page</Button>
              </Link>

              <Button
                onClick={handleDelete}
                disabled={saving}
                variant="destructive"
                className="hover:bg-destructive/90"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Template
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
