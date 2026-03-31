"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Database, Users, Calendar, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ExamSelectionPage() {
  const [selectedExam, setSelectedExam] = useState<string | null>(null)

  const exams = [
    {
      id: "clat-2025",
      name: "CLAT 2025",
      category: "Law",
      sessions: 1,
      applicants: "75K",
      deadline: "2025-12-01",
      status: "active",
    },
    {
      id: "jee-main-2025",
      name: "JEE Main 2025",
      category: "Engineering",
      sessions: 2,
      applicants: "12.5L",
      deadline: "2025-03-15",
      status: "active",
    },
    {
      id: "jee-advanced-2025",
      name: "JEE Advanced 2025",
      category: "Engineering",
      sessions: 1,
      applicants: "2.5L",
      deadline: "2025-05-20",
      status: "active",
    },
    {
      id: "neet-ug-2025",
      name: "NEET UG 2025",
      category: "Medical",
      sessions: 1,
      applicants: "18.7L",
      deadline: "2025-05-05",
      status: "active",
    },
    {
      id: "cat-2025",
      name: "CAT 2025",
      category: "Management",
      sessions: 1,
      applicants: "3.2L",
      deadline: "2025-11-26",
      status: "upcoming",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm hover:text-foreground/80 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-mono">BACK_TO_HOME</span>
          </Link>
          <div className="font-mono text-xs text-muted-foreground">USER_SESSION_ACTIVE</div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Page Header */}
        <div className="mb-12">
          <div className="font-mono text-xs text-muted-foreground mb-2">STEP_01 / SELECT_DATASET</div>
          <h1 className="text-4xl font-bold mb-3 text-balance">Select Examination Dataset</h1>
          <p className="text-muted-foreground text-balance">
            Choose the examination input variable for rank prediction computation.
          </p>
        </div>

        {/* Exam List */}
        <div className="space-y-3">
          {exams.map((exam, index) => (
            <button
              key={exam.id}
              onClick={() => setSelectedExam(exam.id)}
              className={`w-full border rounded-lg p-6 text-left transition-all ${
                selectedExam === exam.id
                  ? "border-foreground bg-foreground/5"
                  : "border-border/50 hover:border-border hover:bg-muted/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Database className="w-5 h-5 text-muted-foreground" />
                    <h3 className="text-xl font-semibold">{exam.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-mono ${
                        exam.status === "active" ? "bg-foreground/10 text-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {exam.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 font-mono text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">CATEGORY</div>
                      <div>{exam.category}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">SESSIONS</div>
                      <div>{exam.sessions}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">APPLICANTS</div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {exam.applicants}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">DEADLINE</div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {exam.deadline}
                      </div>
                    </div>
                  </div>
                </div>

                <ChevronRight
                  className={`w-5 h-5 transition-transform ${selectedExam === exam.id ? "translate-x-1" : ""}`}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Continue Button */}
        {selectedExam && (
          <div className="mt-8 flex justify-end">
            <Link href={`/predict/${selectedExam}`}>
              <Button size="lg" className="font-mono">
                PROCEED_TO_PREDICTION
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}


