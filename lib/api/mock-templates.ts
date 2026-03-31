// Mock data for templates - working version
export interface TemplateStats {
  id: string
  name: string
  examCode: string
  predictions: number
  status: string
  accuracy: string
  shareLink: string
}

const mockTemplates: TemplateStats[] = [
  {
    id: "1",
    name: "CLAT 2025 AI Predictor",
    examCode: "CLAT-2025",
    predictions: 8234,
    status: "ACTIVE",
    accuracy: "91.2%",
    shareLink: "clat-2025"
  },
  {
    id: "2",
    name: "JEE Main 2025 Dataset",
    examCode: "JEE-MAIN-2025",
    predictions: 12456,
    status: "ACTIVE",
    accuracy: "89.7%",
    shareLink: "jee-main-2025"
  },
  {
    id: "3",
    name: "NEET UG Conditional",
    examCode: "NEET-UG-2025",
    predictions: 2145,
    status: "INACTIVE",
    accuracy: "93.1%",
    shareLink: "neet-ug-2025"
  },
  {
    id: "4",
    name: "CAT 2025 Predictor",
    examCode: "CAT-2025",
    predictions: 1732,
    status: "ACTIVE",
    accuracy: "87.5%",
    shareLink: "cat-2025"
  }
]

export async function getTemplateStats(): Promise<TemplateStats[]> {
  return mockTemplates
}
