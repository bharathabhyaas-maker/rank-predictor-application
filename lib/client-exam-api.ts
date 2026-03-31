// Client-side API calls for exam management

export interface ExamTemplate {
  id: string
  name: string
  examCode: string
  type: 'ai' | 'dataset' | 'conditional'
  description: string
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT'
  config: {
    totalMarks?: number
    candidateCount?: number
    difficulty?: string
    historicalAvg?: number
    threshold?: number
    percentileRange?: string
    cutoff?: number
    marksColumn?: string
    percentileColumn?: string
    normalization?: string
    [key: string]: any
  }
  createdAt: string
  updatedAt: string
  predictions: number
  accuracy?: string
  shareLink: string
}

export interface Institution {
  id: string
  name: string
  email: string
  location?: string
  status: string
  currentStudents?: number
}

export async function createExamTemplate(data: {
  name: string
  examCode: string
  type: 'ai' | 'dataset' | 'conditional'
  description: string
  config: any
}): Promise<ExamTemplate> {
  const response = await fetch('/api/exams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData.error || errorData.details || 'Failed to create exam template'
    console.error('❌ Frontend error details:', errorData)
    throw new Error(errorMessage)
  }
  return response.json()
}

export async function getAllExamTemplates(): Promise<ExamTemplate[]> {
  const response = await fetch('/api/exams')
  if (!response.ok) {
    throw new Error('Failed to fetch exam templates')
  }
  return response.json()
}

export async function updateExamTemplate(id: string, data: Partial<ExamTemplate>): Promise<ExamTemplate> {
  const response = await fetch(`/api/exams/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    throw new Error('Failed to update exam template')
  }
  return response.json()
}

export async function getInstitutions(): Promise<Institution[]> {
  const response = await fetch('/api/institutions-list')
  if (!response.ok) {
    throw new Error('Failed to fetch institutions')
  }
  return response.json()
}

export async function assignTemplateToInstitution(templateId: string, institutionId: string): Promise<any> {
  const response = await fetch('/api/exams/assign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ templateId, institutionId })
  })
  if (!response.ok) {
    throw new Error('Failed to assign template to institution')
  }
  return response.json()
}
