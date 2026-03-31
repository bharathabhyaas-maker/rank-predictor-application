// Mock data for institutions - working version
export interface InstitutionStats {
  id: string
  institutionId: string
  name: string
  email: string
  location: string
  students: number
  templatesAssigned: number
  predictions: number
  status: string
  joinedDate: string
  plan: string
}

const mockInstitutions: InstitutionStats[] = [
  {
    id: "1",
    institutionId: "IID0001",
    name: "Delhi Career Academy",
    email: "admin@delhiacademy.com",
    location: "New Delhi",
    students: 2450,
    templatesAssigned: 3,
    predictions: 18500,
    status: "active",
    joinedDate: "2024-06-15",
    plan: "Premium"
  },
  {
    id: "2",
    institutionId: "IID0002",
    name: "Mumbai IIT Coaching",
    email: "contact@mumbaicoaching.com",
    location: "Mumbai",
    students: 3200,
    templatesAssigned: 4,
    predictions: 28900,
    status: "active",
    joinedDate: "2024-03-22",
    plan: "Enterprise"
  },
  {
    id: "3",
    institutionId: "IID0003",
    name: "Bangalore Test Prep",
    email: "info@blrtestprep.com",
    location: "Bangalore",
    students: 1800,
    templatesAssigned: 2,
    predictions: 12400,
    status: "active",
    joinedDate: "2024-08-10",
    plan: "Standard"
  },
  {
    id: "4",
    institutionId: "IID0004",
    name: "Chennai Learning Hub",
    email: "admin@chennaihub.edu",
    location: "Chennai",
    students: 950,
    templatesAssigned: 1,
    predictions: 4200,
    status: "inactive",
    joinedDate: "2024-11-05",
    plan: "Standard"
  },
  {
    id: "5",
    institutionId: "IID0005",
    name: "Kolkata Career Center",
    email: "support@kolkatacareer.com",
    location: "Kolkata",
    students: 1650,
    templatesAssigned: 3,
    predictions: 9800,
    status: "active",
    joinedDate: "2024-07-18",
    plan: "Premium"
  }
]

export async function getAllInstitutions(): Promise<InstitutionStats[]> {
  return mockInstitutions
}

export async function getInstitutionStats(): Promise<InstitutionStats[]> {
  return mockInstitutions
}

export async function createInstitution(data: any): Promise<InstitutionStats> {
  const newInstitution: InstitutionStats = {
    id: (mockInstitutions.length + 1).toString(),
    institutionId: `IID${String(mockInstitutions.length + 1).padStart(4, '0')}`,
    name: data.name,
    email: data.email,
    location: data.location || '',
    students: 0,
    templatesAssigned: 0,
    predictions: 0,
    status: "active",
    joinedDate: new Date().toISOString().split('T')[0],
    plan: data.plan || "Standard"
  }
  mockInstitutions.push(newInstitution)
  return newInstitution
}

export async function updateInstitutionStatus(id: string, status: string): Promise<InstitutionStats> {
  const institution = mockInstitutions.find(inst => inst.id === id)
  if (institution) {
    institution.status = status
  }
  return institution!
}

export async function getTotalPredictions(): Promise<number> {
  return mockInstitutions.reduce((sum, inst) => sum + inst.predictions, 0)
}

export async function getTotalStudents(): Promise<number> {
  return mockInstitutions.reduce((sum, inst) => sum + inst.students, 0)
}

export async function getActiveInstitutionCount(): Promise<number> {
  return mockInstitutions.filter(inst => inst.status === 'active').length
}
