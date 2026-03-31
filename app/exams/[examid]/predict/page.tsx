"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function PredictPage() {
  const [computing, setComputing] = useState(false)

  const handlePredict = () => {
    setComputing(true)
    setTimeout(() => {
      window.location.href = "/exams/jee-main-2025/result"
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/exams/jee-main-2025/mode"
            className="flex items-center gap-2 text-sm hover:text-foreground/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-mono">BACK_TO_MODE</span>
          </Link>
          <div className="font-mono text-xs text-muted-foreground">DETAILED_ANALYSIS_MODE</div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Page Header */}
        <div className="mb-12">
          <div className="font-mono text-xs text-muted-foreground mb-2">STEP_03 / INPUT_PARAMETERS</div>
          <h1 className="text-4xl font-bold mb-3 text-balance">Enter Prediction Parameters</h1>
          <p className="text-muted-foreground text-balance">Provide the input variables for computational analysis.</p>
        </div>

        {/* Input Form */}
        <div className="space-y-8">
          {/* Academic Performance Block */}
          <div className="border border-border/50 rounded-lg p-6">
            <div className="font-mono text-xs text-muted-foreground mb-4">BLOCK_01 / ACADEMIC_PERFORMANCE</div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-mono text-xs mb-2">PERCENTILE</Label>
                  <Input type="number" placeholder="85.5" className="font-mono" />
                </div>
                <div>
                  <Label className="font-mono text-xs mb-2">CATEGORY_RANK</Label>
                  <Input type="number" placeholder="12500" className="font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-mono text-xs mb-2">12TH_PERCENTAGE</Label>
                  <Input type="number" placeholder="92.3" className="font-mono" />
                </div>
                <div>
                  <Label className="font-mono text-xs mb-2">10TH_PERCENTAGE</Label>
                  <Input type="number" placeholder="89.7" className="font-mono" />
                </div>
              </div>
            </div>
          </div>

          {/* Demographic Parameters Block */}
          <div className="border border-border/50 rounded-lg p-6">
            <div className="font-mono text-xs text-muted-foreground mb-4">BLOCK_02 / DEMOGRAPHIC_PARAMETERS</div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-mono text-xs mb-2">CATEGORY</Label>
                  <select className="w-full px-3 py-2 border border-input rounded-md font-mono text-sm bg-background">
                    <option>GENERAL</option>
                    <option>OBC</option>
                    <option>SC</option>
                    <option>ST</option>
                  </select>
                </div>
                <div>
                  <Label className="font-mono text-xs mb-2">STATE</Label>
                  <select className="w-full px-3 py-2 border border-input rounded-md font-mono text-sm bg-background">
                    <option>MAHARASHTRA</option>
                    <option>DELHI</option>
                    <option>KARNATAKA</option>
                    <option>OTHER</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-mono text-xs mb-2">GENDER</Label>
                  <select className="w-full px-3 py-2 border border-input rounded-md font-mono text-sm bg-background">
                    <option>MALE</option>
                    <option>FEMALE</option>
                    <option>OTHER</option>
                  </select>
                </div>
                <div>
                  <Label className="font-mono text-xs mb-2">PWD_STATUS</Label>
                  <select className="w-full px-3 py-2 border border-input rounded-md font-mono text-sm bg-background">
                    <option>NO</option>
                    <option>YES</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Attempt Details Block */}
          <div className="border border-border/50 rounded-lg p-6">
            <div className="font-mono text-xs text-muted-foreground mb-4">BLOCK_03 / ATTEMPT_DETAILS</div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-mono text-xs mb-2">SESSION</Label>
                  <select className="w-full px-3 py-2 border border-input rounded-md font-mono text-sm bg-background">
                    <option>SESSION_1</option>
                    <option>SESSION_2</option>
                  </select>
                </div>
                <div>
                  <Label className="font-mono text-xs mb-2">ATTEMPT_NUMBER</Label>
                  <Input type="number" placeholder="1" className="font-mono" />
                </div>
              </div>
            </div>
          </div>

          {/* Compute Button */}
          <div className="flex justify-end pt-4">
            <Button size="lg" className="font-mono" onClick={handlePredict} disabled={computing}>
              {computing ? (
                <>COMPUTING...</>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  RUN_PREDICTION
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
