"use client"

// Create Exam Page - Functional version

import { useState } from "react"
import Link from "next/link"
import { Plus, Trash2, Info, Brain, ListFilter, Database, Globe, ChevronDown, ChevronUp, AlertCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import AdminHeader from "@/components/admin-header"
import { createExamTemplate, ExamTemplate } from "@/lib/client-exam-api"

type PredictionType = "ai" | "conditions" | ""
type AISourceType = "dataset" | "internet"

interface Condition {
  id: number
  parameter: string
  operator: string
  value: string
  operator2: string
  value2: string
  bestCasePercentile: string
  worstCasePercentile: string
  bestCaseRank: string
  worstCaseRank: string
  avgRank: string
  avgPercentile: string
}

interface Section {
  id: number
  name: string
  totalQuestions: string
  positiveMarks: string
  negativeMarks: string
}

interface SectionalCutoff {
  id: number
  sectionName: string
  minScore: string
  maxScore: string
  description: string
}

interface FormData {
  name: string
  examCode: string
  description: string
  examDate: string
  duration: string
}

const PARAMETERS = [
  "Total Score",
  "Percentile",
  "Section Score - English",
  "Section Score - Reasoning",
  "Section Score - Legal",
  "Section Score - GK",
  "Section Score - Maths",
  "Rank Range",
  "Attempt Percentage",
  "Accuracy",
  "Category",
]

const OPERATORS = [
  { value: "gte", label: ">= (Greater than or equal)" },
  { value: "lte", label: "<= (Less than or equal)" },
  { value: "gt", label: "> (Greater than)" },
  { value: "lt", label: "< (Less than)" },
  { value: "eq", label: "= (Equal to)" },
  { value: "between", label: "Between" },
]

const AVAILABLE_DATASETS = [
  { id: "clat-2024", name: "CLAT 2024", records: 45230, size: "12.4 MB" },
  { id: "jee-2024", name: "JEE Main 2024", records: 98450, size: "28.7 MB" },
  { id: "neet-2024", name: "NEET 2024", records: 187650, size: "48.2 MB" },
  { id: "ipmat-2024", name: "IPMAT 2024", records: 12340, size: "3.1 MB" },
  { id: "eamcet-2024", name: "EAMCET 2024", records: 67890, size: "18.5 MB" },
  { id: "cat-2024", name: "CAT 2024", records: 230000, size: "62.4 MB" },
]

export default function CreateExamPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    examCode: "",
    description: "",
    examDate: "",
    duration: ""
  })
  const [sections, setSections] = useState<Section[]>([
    { id: 1, name: "", totalQuestions: "", positiveMarks: "", negativeMarks: "" },
  ])
  const [predictionType, setPredictionType] = useState<PredictionType>("")
  const [aiSource, setAISource] = useState<AISourceType>("internet")
  const [selectedDataset, setSelectedDataset] = useState<string>("")
  const [conditions, setConditions] = useState<Condition[]>([
    { id: 1, parameter: "", operator: "", value: "", operator2: "", value2: "", bestCasePercentile: "", worstCasePercentile: "", bestCaseRank: "", worstCaseRank: "", avgRank: "", avgPercentile: "" },
  ])
  const [useSectionalCutoffs, setUseSectionalCutoffs] = useState(false)
  const [sectionalCutoffs, setSectionalCutoffs] = useState<SectionalCutoff[]>([
    { id: 1, sectionName: "", minScore: "", maxScore: "", description: "" },
  ])
  const [conditionsExpanded, setConditionsExpanded] = useState<number[]>([1])
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdTemplate, setCreatedTemplate] = useState<ExamTemplate | null>(null)

  const updateSectionalCutoff = (id: number, field: keyof SectionalCutoff, value: string) => {
    setSectionalCutoffs(sectionalCutoffs.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  // Sections
  const addSection = () => {
    const newId = sections.length + 1
    setSections([...sections, { id: newId, name: "", totalQuestions: "", positiveMarks: "", negativeMarks: "" }])
  }
  const removeSection = (id: number) => setSections(sections.filter((s) => s.id !== id))
  const updateSection = (id: number, field: keyof Section, value: string) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Build config object based on prediction type
      const config: any = {
        duration: parseInt(formData.duration) || 0,
        examDate: formData.examDate
      }

      if (predictionType === "ai") {
        config.aiSource = aiSource
        if (aiSource === "dataset" && selectedDataset) {
          config.datasetId = selectedDataset
        }
      } else if (predictionType === "conditions") {
        config.conditions = conditions.filter(c => c.parameter && c.operator && c.value)
        config.sectionalCutoffs = useSectionalCutoffs ? sectionalCutoffs.filter(s => s.sectionName) : []
        console.log('🔍 Conditions being saved:', JSON.stringify(config.conditions, null, 2))
        console.log('🔍 Full config being sent:', JSON.stringify(config, null, 2))
      }

      const examData = {
        name: formData.name,
        examCode: formData.examCode,
        type: (predictionType === "conditions" ? "conditional" : predictionType === "ai" ? "ai" : "dataset") as 'ai' | 'dataset' | 'conditional',
        description: formData.description,
        config
      }

      const result = await createExamTemplate(examData)
      setCreatedTemplate(result)
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Failed to create exam:', error)
      alert('Failed to create exam. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Conditions
  const addCondition = () => {
    const newId = conditions.length + 1
    setConditions([...conditions, { id: newId, parameter: "", operator: "", value: "", operator2: "", value2: "", bestCasePercentile: "", worstCasePercentile: "", bestCaseRank: "", worstCaseRank: "", avgRank: "", avgPercentile: "" }])
    setConditionsExpanded((prev) => [...prev, newId])
  }
  const removeCondition = (id: number) => {
    setConditions(conditions.filter((c) => c.id !== id))
    setConditionsExpanded((prev) => prev.filter((e) => e !== id))
  }
  const updateCondition = (id: number, field: keyof Condition, value: string) => {
    setConditions(conditions.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  // Sectional cutoffs
  const addSectionalCutoff = () => {
    setSectionalCutoffs([...sectionalCutoffs, { id: sectionalCutoffs.length + 1, sectionName: "", minScore: "", maxScore: "", description: "" }])
  }
  const removeSectionalCutoff = (id: number) => setSectionalCutoffs(sectionalCutoffs.filter((c) => c.id !== id))

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <AdminHeader showBack={true} backLink="/admin/dashboard" title="Create New Exam" />

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Create New Prediction Tool
          </h1>
          <p className="text-muted-foreground text-base">
            Configure exam details, prediction method, and scoring rules for CLAT, JEE, IPMAT, EAMCET, or any exam.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ── Basic Information ── */}
          <div className="border-2 border-primary/20 rounded-2xl p-8 bg-card shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
              <h2 className="text-xl font-bold">Basic Information</h2>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Exam Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., CLAT 2025, JEE Main 2025, IPMAT 2025"
                  className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Exam Code <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.examCode}
                  onChange={(e) => handleInputChange('examCode', e.target.value)}
                  placeholder="e.g., CLAT-2025"
                  className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Exam Date</label>
                <input
                  type="date"
                  value={formData.examDate}
                  onChange={(e) => handleInputChange('examDate', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Total Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="120"
                  className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>
            <div className="mt-5">
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter exam description..."
                className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
              />
            </div>
          </div>

          {/* ── Sectional Configuration ── */}
          <div className="border-2 border-accent/20 rounded-2xl p-8 bg-card shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-accent to-primary rounded-full" />
                <h2 className="text-xl font-bold">Sectional Configuration</h2>
              </div>
              <Button
                type="button"
                onClick={addSection}
                className="bg-accent hover:bg-accent/90 text-white font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </Button>
            </div>
            <div className="text-sm text-muted-foreground mb-6 ml-4">
              Configure exam sections with their respective marks and scoring rules.
            </div>
            <div className="space-y-4">
              {sections.map((section, index) => (
                <div key={section.id} className="border-2 border-border rounded-xl p-5 bg-secondary/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-accent">Section {index + 1}</span>
                    {sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(section.id)}
                        className="text-destructive hover:text-destructive/80 p-1 hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold mb-1.5">
                      Section Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={section.name}
                      onChange={(e) => updateSection(section.id, 'name', e.target.value)}
                      placeholder="e.g., English Language, Legal Reasoning"
                      className="w-full px-3 py-2 text-sm border-2 border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Total Questions <span className="text-destructive">*</span></label>
                    <input 
                      type="number" 
                      value={section.totalQuestions}
                      onChange={(e) => updateSection(section.id, 'totalQuestions', e.target.value)}
                      placeholder="24" 
                      className="w-full px-3 py-2 text-sm border-2 border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Positive Marks</label>
                    <input 
                      type="number" 
                      step="0.25" 
                      value={section.positiveMarks}
                      onChange={(e) => updateSection(section.id, 'positiveMarks', e.target.value)}
                      placeholder="1" 
                      className="w-full px-3 py-2 text-sm border-2 border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent transition-all" 
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold mb-1.5">Negative Marks</label>
                    <input 
                      type="number" 
                      step="0.25" 
                      value={section.negativeMarks}
                      onChange={(e) => updateSection(section.id, 'negativeMarks', e.target.value)}
                      placeholder="0.25" 
                      className="w-full px-3 py-2 text-sm border-2 border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent transition-all" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>

          {/* ── Prediction Type Selector ── */}
          <div className="border-2 border-purple-200 rounded-2xl p-8 bg-card shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full" />
              <h2 className="text-xl font-bold">Prediction Method</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6 ml-4">
              Choose how this tool will predict ranks and percentiles for students.
            </p>

            <div className="grid grid-cols-2 gap-5">
              {/* AI-Based Card */}
              <button
                type="button"
                onClick={() => setPredictionType("ai")}
                className={`relative p-6 rounded-xl border-2 text-left transition-all ${
                  predictionType === "ai"
                    ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200"
                    : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">AI-Based Prediction</h3>
                      <span className="px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">Type 1</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      AI analyzes data to predict rank. Choose between your uploaded datasets or live internet sources.
                    </p>
                  </div>
                </div>
                {predictionType === "ai" && (
                  <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-purple-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Conditions-Based Card */}
              <button
                type="button"
                onClick={() => setPredictionType("conditions")}
                className={`relative p-6 rounded-xl border-2 text-left transition-all ${
                  predictionType === "conditions"
                    ? "border-amber-500 bg-amber-50 ring-2 ring-amber-200"
                    : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <ListFilter className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">Conditions-Based Prediction</h3>
                      <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">Type 2</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Define manual rules and score-range conditions. Prediction is based on the conditions you set.
                    </p>
                  </div>
                </div>
                {predictionType === "conditions" && (
                  <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* ── AI-Based Configuration ── */}
          {predictionType === "ai" && (
            <div className="border-2 border-purple-200 rounded-2xl p-8 bg-card shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full" />
                <h2 className="text-xl font-bold">AI Source Configuration</h2>
              </div>

              {/* Toggle: Dataset vs Internet */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setAISource("internet")}
                      className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all font-semibold text-sm ${
                        aiSource === "internet"
                          ? "border-blue-500 bg-blue-500 text-white shadow-md"
                          : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      Internet / AI Sources
                    </button>

                    {/* Toggle pill */}
                    <button
                      type="button"
                      onClick={() => setAISource(aiSource === "internet" ? "dataset" : "internet")}
                      className="relative inline-flex items-center cursor-pointer focus:outline-none"
                      aria-label="Toggle AI source"
                    >
                      <div className={`w-16 h-8 rounded-full transition-colors duration-300 ${aiSource === "dataset" ? "bg-purple-600" : "bg-blue-500"}`}>
                        <div className={`absolute top-1 h-6 w-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${aiSource === "dataset" ? "translate-x-9" : "translate-x-1"}`} />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedDataset("")}
                      className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all font-semibold text-sm ${
                        aiSource === "dataset"
                          ? "border-purple-500 bg-purple-500 text-white shadow-md"
                          : "border-gray-200 bg-white text-gray-600 hover:border-purple-300"
                      }`}
                    >
                      <Database className="w-4 h-4" />
                      Dataset-Wise
                    </button>
                  </div>
                </div>

                {/* Source description */}
                <div className={`mt-4 p-4 rounded-xl border-2 text-sm ${aiSource === "internet" ? "bg-blue-50 border-blue-200 text-blue-800" : "bg-purple-50 border-purple-200 text-purple-800"}`}>
                  {aiSource === "internet" ? (
                    <div className="flex gap-3">
                      <Globe className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">AI predicts using internet / web knowledge</p>
                        <p>The AI model will use its general knowledge, public exam data, and live sources to generate rank predictions. No dataset upload required.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Database className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">AI predicts using your uploaded dataset</p>
                        <p>The AI will analyze your historical exam data to generate highly accurate rank predictions based on past patterns.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dataset Selection (only shown when dataset mode) */}
              {aiSource === "dataset" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">Select Dataset</h3>
                      <p className="text-sm text-muted-foreground">Pick a previously uploaded dataset for this exam</p>
                    </div>
                    <Link href="/admin/datasets/upload">
                      <Button type="button" size="sm" variant="outline" className="bg-transparent border-purple-300 text-purple-700 hover:bg-purple-50">
                        <Plus className="w-4 h-4 mr-2" />
                        Upload New Dataset
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {AVAILABLE_DATASETS.map((ds) => (
                      <button
                        key={ds.id}
                        type="button"
                        onClick={() => setSelectedDataset(ds.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedDataset === ds.id
                            ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200"
                            : "border-gray-200 bg-white hover:border-purple-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedDataset === ds.id ? "bg-purple-500" : "bg-gray-100"}`}>
                            <Database className={`w-5 h-5 ${selectedDataset === ds.id ? "text-white" : "text-gray-500"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{ds.name}</p>
                            <p className="text-xs text-muted-foreground">{ds.records.toLocaleString()} records · {ds.size}</p>
                          </div>
                          {selectedDataset === ds.id && (
                            <div className="h-5 w-5 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {!selectedDataset && (
                    <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800">Please select a dataset. If none match, upload a new one or switch to Internet source.</p>
                    </div>
                  )}
                </div>
              )}

              {/* AI Prompt Config */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-bold text-gray-900 mb-1">AI Prompt Configuration</h3>
                <p className="text-sm text-muted-foreground mb-4">Customize the prompt template. Use {"{{"}<span>placeholders</span>{"}}"}  for dynamic values.</p>
                <textarea
                  rows={4}
                  placeholder="You are a rank prediction expert for {{examName}}. Given a student score of {{score}} out of {{totalMarks}}, with {{candidateCount}} total candidates and {{difficulty}} difficulty, predict the percentile and rank range."
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl bg-purple-50/30 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                />
                <div className="mt-3 flex gap-2 flex-wrap">
                  {["examName", "score", "totalMarks", "candidateCount", "difficulty", "category"].map((ph) => (
                    <code key={ph} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-mono">{`{{${ph}}}`}</code>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Conditions-Based Configuration ── */}
          {predictionType === "conditions" && (
            <div className="border-2 border-amber-200 rounded-2xl p-8 bg-card shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
                  <h2 className="text-xl font-bold">Prediction Conditions</h2>
                </div>
                <Button
                  type="button"
                  onClick={addCondition}
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-md"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Condition
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-6 ml-4">
                Define rules and score ranges for rank prediction. These conditions work independently from AI-based predictions and provide rule-based rank calculations.
              </p>

              {/* Info box */}
              <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl flex gap-3 mb-6">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">About Prediction Conditions</p>
                  <p>Define rules and conditions for rank prediction when historical data is not available. These conditions work independently from AI-based predictions and provide rule-based rank calculations based on student performance parameters.</p>
                </div>
              </div>

              {/* Condition rows */}
              <div className="space-y-4">
                {conditions.map((condition, index) => (
                  <div
                    key={condition.id}
                    className="border-2 border-amber-200 rounded-xl overflow-hidden bg-white"
                  >
                    {/* Condition header */}
                    <div className="flex items-center justify-between px-5 py-3 bg-amber-50 border-b border-amber-200">
                      <button
                        type="button"
                        onClick={() =>
                          setConditionsExpanded((prev) =>
                            prev.includes(condition.id)
                              ? prev.filter((e) => e !== condition.id)
                              : [...prev, condition.id]
                          )
                        }
                        className="flex items-center gap-2 font-bold text-amber-800 hover:text-amber-900"
                      >
                        {conditionsExpanded.includes(condition.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                        Condition {index + 1}
                        {condition.parameter && (
                          <span className="ml-2 text-xs font-normal text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                            {condition.parameter} {condition.operator} {condition.value}
                          </span>
                        )}
                      </button>
                      {conditions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCondition(condition.id)}
                          className="text-destructive hover:text-destructive/80 p-1 hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Condition fields */}
                    {conditionsExpanded.includes(condition.id) && (
                      <div className="p-5">
                        <div className="grid grid-cols-12 gap-4">
                          <div className="col-span-4">
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                              Parameter
                            </label>
                            <select
                              value={condition.parameter}
                              onChange={(e) => updateCondition(condition.id, "parameter", e.target.value)}
                              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                            >
                              <option value="">Select parameter</option>
                              {PARAMETERS.map((p) => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                              Operator
                            </label>
                            <select
                              value={condition.operator}
                              onChange={(e) => updateCondition(condition.id, "operator", e.target.value)}
                              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                            >
                              <option value="">Select</option>
                              {OPERATORS.map((op) => (
                                <option key={op.value} value={op.value}>{op.label}</option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                              Value
                            </label>
                            <input
                              type="text"
                              value={condition.value}
                              onChange={(e) => updateCondition(condition.id, "value", e.target.value)}
                              placeholder="e.g., 85"
                              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                            />
                          </div>

                          <div className="col-span-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                              Additional Operator
                            </label>
                            <select
                              value={condition.operator2}
                              onChange={(e) => updateCondition(condition.id, "operator2", e.target.value)}
                              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                            >
                              <option value="">Select</option>
                              {OPERATORS.map((op) => (
                                <option key={op.value} value={op.value}>{op.label}</option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                              Additional Value
                            </label>
                            <input
                              type="text"
                              value={condition.value2}
                              onChange={(e) => updateCondition(condition.id, "value2", e.target.value)}
                              placeholder="e.g., 90"
                              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                            />
                          </div>
                        </div>

                        {/* Best/Worst Case Fields */}
                        <div className="grid grid-cols-12 gap-4 mt-4 pt-4 border-t border-gray-200">
                          <div className="col-span-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                              Best Case Percentile
                            </label>
                            <input
                              type="number"
                              value={condition.bestCasePercentile}
                              onChange={(e) => updateCondition(condition.id, "bestCasePercentile", e.target.value)}
                              placeholder="e.g., 95"
                              min="0"
                              max="100"
                              step="0.1"
                              className="w-full px-3 py-2.5 border-2 border-green-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-green-50/40 placeholder:text-gray-400"
                            />
                          </div>

                          <div className="col-span-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                              Worst Case Percentile
                            </label>
                            <input
                              type="number"
                              value={condition.worstCasePercentile}
                              onChange={(e) => updateCondition(condition.id, "worstCasePercentile", e.target.value)}
                              placeholder="e.g., 75"
                              min="0"
                              max="100"
                              step="0.1"
                              className="w-full px-3 py-2.5 border-2 border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-red-50/40 placeholder:text-gray-400"
                            />
                          </div>

                          <div className="col-span-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                              Best Case Rank
                            </label>
                            <input
                              type="number"
                              value={condition.bestCaseRank}
                              onChange={(e) => updateCondition(condition.id, "bestCaseRank", e.target.value)}
                              placeholder="e.g., 100"
                              min="1"
                              className="w-full px-3 py-2.5 border-2 border-green-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-green-50/40 placeholder:text-gray-400"
                            />
                          </div>

                          <div className="col-span-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                              Worst Case Rank
                            </label>
                            <input
                              type="number"
                              value={condition.worstCaseRank}
                              onChange={(e) => updateCondition(condition.id, "worstCaseRank", e.target.value)}
                              placeholder="e.g., 500"
                              min="1"
                              className="w-full px-3 py-2.5 border-2 border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-red-50/40 placeholder:text-gray-400"
                            />
                          </div>

                          <div className="col-span-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                              Average Rank
                            </label>
                            <input
                              type="number"
                              value={condition.avgRank}
                              onChange={(e) => updateCondition(condition.id, "avgRank", e.target.value)}
                              placeholder="e.g., 300"
                              min="1"
                              className="w-full px-3 py-2.5 border-2 border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-blue-50/40 placeholder:text-gray-400"
                            />
                          </div>

                          <div className="col-span-3">
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                              Average Percentile
                            </label>
                            <input
                              type="number"
                              value={condition.avgPercentile}
                              onChange={(e) => updateCondition(condition.id, "avgPercentile", e.target.value)}
                              placeholder="e.g., 85"
                              min="0"
                              max="100"
                              step="0.1"
                              className="w-full px-3 py-2.5 border-2 border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-blue-50/40 placeholder:text-gray-400"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add another condition CTA */}
              <button
                type="button"
                onClick={addCondition}
                className="mt-4 w-full py-3 border-2 border-dashed border-amber-300 rounded-xl text-amber-700 text-sm font-semibold hover:border-amber-500 hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Another Condition
              </button>
            </div>
          )}

          {/* ── Overall Cutoff ── */}
          <div className="border-2 border-green-200 rounded-2xl p-8 bg-card shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full" />
              <h2 className="text-xl font-bold">Overall Cutoff Score</h2>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex gap-3 mb-6">
              <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">
                Define the minimum and maximum overall scores a student must enter to receive a rank prediction. Applies to all exam types.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Minimum Overall Score <span className="text-destructive">*</span></label>
                <input type="number" step="0.25" placeholder="e.g., 50" className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Maximum Overall Score <span className="text-destructive">*</span></label>
                <input type="number" step="0.25" placeholder="e.g., 200" className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
              </div>
            </div>
          </div>

          {/* ── Sectional Cutoffs (optional) ── */}
          <div className="border-2 border-blue-200 rounded-2xl p-8 bg-card shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">Enable Sectional Cutoffs</h3>
                <p className="text-sm text-muted-foreground">Only enable if your exam requires section-wise minimum scores (e.g., CLAT, UPSC)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={useSectionalCutoffs} onChange={(e) => setUseSectionalCutoffs(e.target.checked)} className="sr-only peer" />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            {useSectionalCutoffs && (
              <div className="pt-4 border-t border-blue-200">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="font-semibold text-blue-800">Sectional Cutoff Conditions</h4>
                  <Button type="button" onClick={addSectionalCutoff} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Cutoff
                  </Button>
                </div>
                <div className="space-y-4">
                  {sectionalCutoffs.map((cutoff, index) => (
                    <div key={cutoff.id} className="border-2 border-blue-200 rounded-xl p-5 bg-blue-50/40">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-blue-700">Cutoff {index + 1}</span>
                        {sectionalCutoffs.length > 1 && (
                          <button type="button" onClick={() => removeSectionalCutoff(cutoff.id)} className="text-destructive p-1 hover:bg-destructive/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1.5">Section Name <span className="text-destructive">*</span></label>
                          <input
                            type="text"
                            value={cutoff.sectionName}
                            onChange={(e) => updateSectionalCutoff(cutoff.id, 'sectionName', e.target.value)}
                            placeholder="e.g., English"
                            className="w-full px-3 py-2 text-sm border-2 border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1.5">Min Score <span className="text-destructive">*</span></label>
                          <input 
                            type="number" 
                            step="0.25" 
                            value={cutoff.minScore}
                            onChange={(e) => updateSectionalCutoff(cutoff.id, 'minScore', e.target.value)}
                            placeholder="15" 
                            className="w-full px-3 py-2 text-sm border-2 border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1.5">Max Score <span className="text-destructive">*</span></label>
                          <input 
                            type="number" 
                            step="0.25" 
                            value={cutoff.maxScore}
                            onChange={(e) => updateSectionalCutoff(cutoff.id, 'maxScore', e.target.value)}
                            placeholder="24" 
                            className="w-full px-3 py-2 text-sm border-2 border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1.5">Description</label>
                          <textarea
                            value={cutoff.description || ''}
                            onChange={(e) => updateSectionalCutoff(cutoff.id, 'description', e.target.value)}
                            rows={2}
                            placeholder="e.g., Students scoring between 15-24 marks in English section"
                            className="w-full px-3 py-2 border-2 border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Action Buttons ── */}
          <div className="flex items-center justify-end gap-4 pb-8">
            <Link href="/admin/dashboard">
              <Button type="button" variant="outline" className="border-2 border-border hover:bg-secondary font-semibold bg-transparent px-8">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold shadow-lg px-10"
            >
              {loading ? 'Creating...' : 'Create Exam'}
            </Button>
          </div>
        </form>

        {/* Success Modal */}
        {showSuccessModal && createdTemplate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Exam Created Successfully!</h3>
                <p className="text-muted-foreground">
                  {createdTemplate.name} has been created successfully.
                </p>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Info className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">About Prediction Methods</h4>
                      <p>Choose between AI-based predictions (using your datasets) or condition-based predictions (manual rules you define).</p>
                    </div>
                  </div>
                </div>
                <Link href={`/admin/exams/all`}>
                  <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                    View All Templates
                  </Button>
                </Link>
                <Link href="/admin/dashboard">
                  <Button variant="outline" className="w-full">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
