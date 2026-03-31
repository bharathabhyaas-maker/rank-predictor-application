"use client"

import Link from "next/link"
import { ArrowLeft, TrendingUp, Database, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ResultPage() {
  const factors = [
    { name: "PERCENTILE_SCORE", weight: 45, impact: "HIGH_POSITIVE" },
    { name: "CATEGORY_ADVANTAGE", weight: 25, impact: "MODERATE_POSITIVE" },
    { name: "STATE_QUOTA", weight: 15, impact: "MODERATE_POSITIVE" },
    { name: "SESSION_DIFFICULTY", weight: 10, impact: "LOW_NEGATIVE" },
    { name: "COMPETITION_INDEX", weight: 5, impact: "LOW_NEGATIVE" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/exams" className="flex items-center gap-2 text-sm hover:text-foreground/80 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-mono">NEW_PREDICTION</span>
          </Link>
          <div className="font-mono text-xs text-muted-foreground">COMPUTATION_COMPLETE</div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Page Header */}
        <div className="mb-12">
          <div className="font-mono text-xs text-muted-foreground mb-2">OUTPUT / PREDICTION_RESULT</div>
          <h1 className="text-4xl font-bold mb-3 text-balance">Prediction Analysis Complete</h1>
          <p className="text-muted-foreground text-balance">
            Computed output based on neural network ensemble algorithm.
          </p>
        </div>

        {/* Primary Result */}
        <div className="border-2 border-foreground rounded-lg p-8 mb-8 bg-foreground/5">
          <div className="font-mono text-xs text-muted-foreground mb-3">PRIMARY_DATA_POINT</div>
          <div className="flex items-baseline gap-4 mb-2">
            <div className="text-6xl font-bold">8,500</div>
            <div className="text-3xl text-muted-foreground">–</div>
            <div className="text-6xl font-bold">12,300</div>
          </div>
          <div className="text-lg text-muted-foreground font-mono">EXPECTED_RANK_RANGE</div>

          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex items-center gap-6 font-mono text-sm">
              <div>
                <div className="text-xs text-muted-foreground mb-1">CONFIDENCE</div>
                <div className="text-lg">87.3%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">MEDIAN_RANK</div>
                <div className="text-lg">10,400</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">DATASET_SIZE</div>
                <div className="text-lg">2.4M samples</div>
              </div>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="border border-border/50 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3 mb-4">
            <Brain className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="font-mono text-xs text-muted-foreground mb-2">COMPUTATION_SUMMARY</div>
              <p className="text-muted-foreground leading-relaxed">
                This prediction is generated using a neural network ensemble trained on 2.4 million historical data
                points. The model analyzed your input parameters across multiple dimensions including academic
                performance, demographic factors, and competitive indices. The rank range represents 87.3% probability
                distribution with standard deviation of ±1,900 ranks.
              </p>
            </div>
          </div>
        </div>

        {/* Contributing Factors */}
        <div className="border border-border/50 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3 mb-6">
            <Database className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="font-mono text-xs text-muted-foreground">MODEL_SUMMARY / CONTRIBUTING_FACTORS</div>
          </div>

          <div className="space-y-4">
            {factors.map((factor, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between font-mono text-sm">
                  <span>{factor.name}</span>
                  <span className="text-xs text-muted-foreground">{factor.impact}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground rounded-full transition-all duration-1000"
                      style={{ width: `${factor.weight}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-12 text-right">{factor.weight}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link href="/exams" className="flex-1">
            <Button variant="outline" className="w-full font-mono bg-transparent">
              NEW_PREDICTION
            </Button>
          </Link>
          <Button className="flex-1 font-mono">
            <TrendingUp className="w-4 h-4 mr-2" />
            SAVE_RESULT
          </Button>
        </div>
      </div>
    </div>
  )
}
