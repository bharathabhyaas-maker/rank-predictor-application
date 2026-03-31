"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft, Upload, FileSpreadsheet, AlertCircle, CheckCircle2,
  FileText, X, Database, Info, ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import AdminNavigation from "@/components/admin-navigation"

const EXAM_TYPES = [
  "CLAT", "JEE Main", "JEE Advanced", "NEET", "IPMAT", "EAMCET",
  "CAT", "GATE", "UPSC", "CUET", "MHT CET", "KCET", "Other",
]

type UploadStep = "form" | "mapping" | "preview" | "done"

export default function UploadDatasetPage() {
  const [step, setStep] = useState<UploadStep>("form")
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState("")
  const [fileSize, setFileSize] = useState("")
  const [examType, setExamType] = useState("")
  const [year, setYear] = useState("")
  const [description, setDescription] = useState("")

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setFileName(file.name)
      setFileSize((file.size / 1024 / 1024).toFixed(2) + " MB")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      setFileSize((file.size / 1024 / 1024).toFixed(2) + " MB")
    }
  }

  const clearFile = () => {
    setFileName("")
    setFileSize("")
  }

  const canProceed = fileName && examType && year

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/admin/datasets">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Back to Datasets
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Upload Dataset</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Add historical exam data to power AI-based rank predictions
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {(["form", "mapping", "preview", "done"] as UploadStep[]).map((s, i) => {
            const labels = ["Dataset Info", "Column Mapping", "Preview & Confirm", "Complete"]
            const isActive = step === s
            const isDone = ["form", "mapping", "preview", "done"].indexOf(step) > i
            return (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center gap-2 flex-1 ${i > 0 ? "" : ""}`}>
                  {i > 0 && <div className={`h-0.5 flex-1 ${isDone ? "bg-purple-500" : "bg-gray-200"}`} />}
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive ? "bg-purple-600 text-white" : isDone ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {isDone && !isActive ? <CheckCircle2 className="w-3 h-3" /> : <span>{i + 1}</span>}
                    {labels[i]}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Step 1: Dataset Info ── */}
        {step === "form" && (
          <div className="space-y-6">
            <div className="border-2 border-purple-200 rounded-2xl p-8 bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full" />
                <h2 className="text-lg font-bold">Dataset Information</h2>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Exam Type <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  >
                    <option value="">Select exam type</option>
                    {EXAM_TYPES.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Year <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g., 2024"
                    min="2000"
                    max="2030"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-2">
                    Dataset ID <span className="text-muted-foreground font-normal text-xs">(auto-generated if empty)</span>
                  </label>
                  <input
                    type="text"
                    placeholder={examType && year ? `${examType.toLowerCase().replace(/\s+/g, "-")}-${year}` : "e.g., clat-2024"}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the dataset, e.g., CLAT 2024 official result data with section-wise scores and ranks..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="border-2 border-purple-200 rounded-2xl p-8 bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full" />
                <h2 className="text-lg font-bold">Upload File</h2>
              </div>

              {!fileName ? (
                <div
                  className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                    dragActive
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-300 hover:border-purple-400 hover:bg-purple-50/30"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".csv,.xlsx,.json"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-800">
                        Drop your file here or{" "}
                        <span className="text-purple-600 underline underline-offset-2">browse files</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Supports CSV, XLSX, JSON — max 200 MB</p>
                    </div>
                    <div className="flex gap-3">
                      {["CSV", "XLSX", "JSON"].map((fmt) => (
                        <span key={fmt} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-mono rounded-full border border-gray-200">
                          .{fmt.toLowerCase()}
                        </span>
                      ))}
                    </div>
                  </label>
                </div>
              ) : (
                <div className="border-2 border-green-300 rounded-2xl p-5 bg-green-50 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                    <FileSpreadsheet className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-green-900 truncate">{fileName}</p>
                    <p className="text-sm text-green-700">{fileSize} · Ready to upload</p>
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="p-2 hover:bg-green-200 rounded-lg transition-colors text-green-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Format requirements */}
              <div className="mt-5 border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Required Columns in Dataset</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      {[
                        "Student ID / Roll Number",
                        "Final Rank achieved",
                        "Subject-wise scores",
                        "Total Score",
                        "Percentile",
                        "Category (if applicable)",
                        "Exam shift / session",
                        "Normalization data (optional)",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-2 text-xs text-gray-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/admin/datasets">
                <Button variant="outline" className="bg-transparent border-gray-300 px-8">Cancel</Button>
              </Link>
              <Button
                onClick={() => canProceed && setStep("mapping")}
                disabled={!canProceed}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-8 gap-2 disabled:opacity-50"
              >
                Next: Column Mapping
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Column Mapping ── */}
        {step === "mapping" && (
          <div className="space-y-6">
            <div className="border-2 border-purple-200 rounded-2xl p-8 bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full" />
                <h2 className="text-lg font-bold">Column Mapping</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6 ml-4">
                Map your dataset columns to the required fields for {examType} {year}.
              </p>

              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl flex gap-3 mb-6">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  We detected <strong>{fileName}</strong>. Map your file columns to the required fields below.
                  Unmapped optional fields will be skipped.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Student ID / Roll Number", required: true, hint: "Unique identifier for each student" },
                  { label: "Total Score", required: true, hint: "Final total marks obtained" },
                  { label: "Percentile", required: true, hint: "Percentile score (0-100)" },
                  { label: "Rank", required: true, hint: "Final rank in the exam" },
                  { label: "Category", required: false, hint: "General / OBC / SC / ST etc." },
                  { label: "Shift / Session", required: false, hint: "Morning / Afternoon shift" },
                ].map((field) => (
                  <div key={field.label} className="grid grid-cols-5 gap-4 items-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="col-span-2">
                      <p className="text-sm font-semibold text-gray-800">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{field.hint}</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <span className="text-gray-400">→</span>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Column name in your file"
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={() => setStep("form")} className="bg-transparent border-gray-300 px-8">
                Back
              </Button>
              <Button
                onClick={() => setStep("preview")}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-8 gap-2"
              >
                Next: Preview Data
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Preview ── */}
        {step === "preview" && (
          <div className="space-y-6">
            <div className="border-2 border-purple-200 rounded-2xl p-8 bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full" />
                <h2 className="text-lg font-bold">Preview & Confirm</h2>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Exam Type", value: examType, color: "purple" },
                  { label: "Year", value: year, color: "indigo" },
                  { label: "File", value: fileName.split(".").pop()?.toUpperCase() ?? "CSV", color: "blue" },
                  { label: "File Size", value: fileSize || "—", color: "violet" },
                ].map((item) => (
                  <div key={item.label} className={`p-4 bg-${item.color}-50 border-2 border-${item.color}-200 rounded-xl`}>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{item.label}</p>
                    <p className="text-lg font-bold text-gray-900 mt-1 truncate">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Sample data table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Sample Records (first 5 rows)</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {["Student ID", "Total Score", "Percentile", "Rank", "Category"].map((h) => (
                          <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["STU001", "132", "99.2", "148", "General"],
                        ["STU002", "128", "98.7", "412", "OBC"],
                        ["STU003", "119", "96.4", "1,820", "General"],
                        ["STU004", "108", "91.2", "5,430", "SC"],
                        ["STU005", "97", "82.3", "12,100", "General"],
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                          {row.map((cell, j) => (
                            <td key={j} className="px-4 py-2 font-mono text-xs">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-5 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold">Everything looks good!</p>
                  <p>Estimated records: ~45,000 · Columns mapped: 5/5 required</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={() => setStep("mapping")} className="bg-transparent border-gray-300 px-8">
                Back
              </Button>
              <Button
                onClick={() => setStep("done")}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Dataset
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 4: Done ── */}
        {step === "done" && (
          <div className="border-2 border-green-200 rounded-2xl p-12 bg-white shadow-sm text-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Dataset Uploaded Successfully!</h2>
            <p className="text-muted-foreground mb-2">{examType} {year} dataset has been added to the system.</p>
            <p className="text-sm text-muted-foreground mb-8">
              It is now available for selection in AI-based prediction tools.
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-xs text-muted-foreground">Exam</p>
                <p className="font-bold text-sm">{examType}</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-xs text-muted-foreground">Year</p>
                <p className="font-bold text-sm">{year}</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-bold text-sm text-green-700">Active</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Link href="/admin/datasets">
                <Button variant="outline" className="bg-transparent border-gray-300 gap-2">
                  <Database className="w-4 h-4" />
                  View All Datasets
                </Button>
              </Link>
              <Link href="/admin/exams/new">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white gap-2">
                  <FileText className="w-4 h-4" />
                  Create Prediction Tool
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}