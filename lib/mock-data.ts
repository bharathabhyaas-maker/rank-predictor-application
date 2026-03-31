// Mock data for development when database is not available

export const mockInstitutions = [
  {
    id: 'inst-1',
    name: 'Delhi Career Academy',
    email: 'admin@delhiacademy.com',
    location: 'New Delhi',
    status: 'ACTIVE',
    currentStudents: 2450
  },
  {
    id: 'inst-2',
    name: 'Mumbai Institute of Excellence',
    email: 'info@mumbaiinstitute.edu',
    location: 'Mumbai',
    status: 'ACTIVE',
    currentStudents: 1800
  },
  {
    id: 'inst-3',
    name: 'Bangalore Study Center',
    email: 'contact@bangalorestudy.org',
    location: 'Bangalore',
    status: 'ACTIVE',
    currentStudents: 1200
  }
];

export const mockAdmin = {
  id: 'admin-1',
  email: 'admin@rankpredictor.com',
  name: 'System Admin',
  role: 'ADMIN',
  status: 'ACTIVE'
};

let mockTemplates = [
  {
    id: 'template-1',
    name: 'CLAT 2025 AI Predictor',
    examCode: 'CLAT-2025',
    type: 'ai',
    description: 'AI-powered rank prediction for CLAT 2025',
    status: 'ACTIVE',
    config: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    predictions: 1250,
    accuracy: '94.2%',
    shareLink: 'clat-2025'
  }
];

export const mockAPI = {
  getInstitutions: () => Promise.resolve(mockInstitutions),
  createExamTemplate: (data: any) => {
    const newTemplate = {
      id: `template-${Date.now()}`,
      ...data,
      status: 'DRAFT',
      config: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      predictions: 0,
      accuracy: 'N/A',
      shareLink: data.examCode.toLowerCase().replace(/\s+/g, '-')
    };
    mockTemplates.push(newTemplate);
    return Promise.resolve(newTemplate);
  },
  getAllExamTemplates: () => Promise.resolve(mockTemplates),
  assignTemplateToInstitution: (templateId: string, institutionId: string) => {
    return Promise.resolve({ templateId, institutionId, assignedAt: new Date() });
  }
};
