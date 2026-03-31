"use client"

import { useState } from "react"
import { Download, FileText, Book } from "lucide-react"
import { Button } from "@/components/ui/button"
import AdminNavigation from "@/components/admin-navigation"

export default function DocumentationPage() {
  const [downloading, setDownloading] = useState<string | null>(null)

  const downloadDocument = async (format: "pdf" | "markdown") => {
    setDownloading(format)
    try {
      const response = await fetch(`/api/download-documentation?format=${format}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `rank-prediction-documentation.${format === "pdf" ? "pdf" : "md"}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download failed:", error)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      <AdminNavigation />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Documentation & Reports
          </h1>
          <p className="text-muted-foreground text-lg">
            Download comprehensive technical documentation about rank prediction logics and conditions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Markdown Documentation */}
          <div className="bg-white border border-primary/10 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Book className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Markdown Report</h2>
                <p className="text-sm text-muted-foreground">Detailed technical documentation</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Includes:</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>✓ AI-powered prediction logic</li>
                  <li>✓ Conditional rule system</li>
                  <li>✓ Sectional & overall cutoff conditions</li>
                  <li>✓ Confidence scoring methodology</li>
                  <li>✓ Special cases & edge handling</li>
                  <li>✓ Complete system workflow</li>
                </ul>
              </div>
            </div>

            <Button
              onClick={() => downloadDocument("markdown")}
              disabled={downloading === "markdown"}
              className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              {downloading === "markdown" ? "Downloading..." : "Download Markdown"}
            </Button>
          </div>

          {/* PDF Documentation */}
          <div className="bg-white border border-primary/10 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">PDF Report</h2>
                <p className="text-sm text-muted-foreground">Formatted professional document</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Features:</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>✓ Professional formatting</li>
                  <li>✓ Table of contents</li>
                  <li>✓ Logic flowcharts</li>
                  <li>✓ Example predictions</li>
                  <li>✓ Condition matrices</li>
                  <li>✓ Easy to share & print</li>
                </ul>
              </div>
            </div>

            <Button
              onClick={() => downloadDocument("pdf")}
              disabled={downloading === "pdf"}
              className="w-full bg-gradient-to-r from-accent to-blue-500 hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              {downloading === "pdf" ? "Downloading..." : "Download PDF"}
            </Button>
          </div>
        </div>

        {/* Documentation Preview */}
        <div className="mt-12 bg-white border border-primary/10 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Documentation Preview</h2>
          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-semibold mb-3">Rank Prediction System Overview</h3>
            <p className="text-muted-foreground mb-4">This system predicts student ranks based on two approaches:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-6">
                <h4 className="font-semibold mb-3">AI-Powered Predictions</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  When enabled, uses historical datasets and AI to calculate rank predictions with percentile-based
                  ranking.
                </p>
                <ul className="text-sm space-y-2">
                  <li>• Analyzes historical data patterns</li>
                  <li>• Calculates percentile scores</li>
                  <li>• Generates confidence intervals</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-primary/10 rounded-lg p-6">
                <h4 className="font-semibold mb-3">Conditional Logic Predictions</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  When AI is disabled, uses admin-defined conditions and cutoffs to predict ranks.
                </p>
                <ul className="text-sm space-y-2">
                  <li>• Overall score cutoffs</li>
                  <li>• Sectional performance rules</li>
                  <li>• Custom condition logic</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}