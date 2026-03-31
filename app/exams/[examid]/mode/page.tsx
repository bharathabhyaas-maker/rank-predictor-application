"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, ArrowLeft, Zap, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PredictionModePage() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null)

  const modes = [
    {
      id: "quick",
      name: "Quick Prediction",
      icon: Zap,
      description: "Fast computation using core parameters only",
      inputs: "Minimal input variables required",
      accuracy: "Standard precision",
      time: "< 2 seconds",
      algorithm: "LINEAR_REGRESSION_OPTIMIZED",
    },
    {
      id: "detailed",
      name: "Detailed Analysis",
      icon: BarChart3,
      description: "Comprehensive analysis with all available parameters",
      inputs: "Complete dataset input required",
      accuracy: "Enhanced precision with confidence intervals",
      time: "5-8 seconds",
      algorithm: "NEURAL_NETWORK_ENSEMBLE",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/exams" className="flex items-center gap-2 text-sm hover:text-foreground/80 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-mono">BACK_TO_DATASET</span>
          </Link>
          <div className="font-mono text-xs text-muted-foreground">JEE_MAIN_2025_SELECTED</div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Page Header */}
        <div className="mb-12">
          <div className="font-mono text-xs text-muted-foreground mb-2">STEP_02 / SELECT_ALGORITHM_PATH</div>
          <h1 className="text-4xl font-bold mb-3 text-balance">Choose Prediction Mode</h1>
          <p className="text-muted-foreground text-balance">
            Select the computational path for rank prediction analysis.
          </p>
        </div>

        {/* Mode Selection */}
        <div className="grid gap-6 mb-8">
          {modes.map((mode) => {
            const Icon = mode.icon
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`border rounded-lg p-8 text-left transition-all ${
                  selectedMode === mode.id
                    ? "border-foreground bg-foreground/5"
                    : "border-border/50 hover:border-border hover:bg-muted/30"
                }`}
              >
                <div className="flex items-start gap-6">
                  <div
                    className={`p-4 rounded-lg border ${
                      selectedMode === mode.id
                        ? "bg-foreground text-background border-foreground"
                        : "bg-muted border-border"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-2">{mode.name}</h3>
                    <p className="text-muted-foreground mb-6">{mode.description}</p>

                    <div className="grid grid-cols-2 gap-6 font-mono text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">INPUT_PARAMS</div>
                        <div>{mode.inputs}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">ACCURACY</div>
                        <div>{mode.accuracy}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">COMPUTE_TIME</div>
                        <div>{mode.time}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">ALGORITHM</div>
                        <div>{mode.algorithm}</div>
                      </div>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-5 h-5 transition-transform ${selectedMode === mode.id ? "translate-x-1" : ""}`}
                  />
                </div>
              </button>
            )
          })}
        </div>

        {/* Continue Button */}
        {selectedMode && (
          <div className="flex justify-end">
            <Link href={`/exams/jee-main-2025/predict?mode=${selectedMode}`}>
              <Button size="lg" className="font-mono">
                PROCEED_TO_INPUT
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
