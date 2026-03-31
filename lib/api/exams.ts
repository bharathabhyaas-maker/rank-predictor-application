import { prisma } from '../database'
import { mockAPI } from '../mock-data'

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
}

export async function createExamTemplate(data: {
  name: string
  examCode: string
  type: 'ai' | 'dataset' | 'conditional'
  description: string
  config: any
  createdBy?: string
}) {
  try {
    // Try database first, fallback to mock
    try {
      // Ensure we have a valid admin user
      let adminId = data.createdBy;
      if (!adminId) {
        // Try to find existing admin
        const existingAdmin = await prisma.user.findFirst({
          where: { role: 'ADMIN' }
        });
        
        if (existingAdmin) {
          adminId = existingAdmin.id;
        } else {
          // Create a default admin user
          const admin = await prisma.user.create({
            data: {
              email: 'admin@rankpredictor.com',
              name: 'System Admin',
              password: 'admin123', // In production, this should be hashed
              role: 'ADMIN'
            }
          });
          adminId = admin.id;
        }
      }

      const template = await prisma.template.create({
        data: {
          name: data.name,
          examCode: data.examCode,
          description: data.description,
          type: data.type,
          status: 'DRAFT',
          // Store conditions and config in placeholders field
          placeholders: data.config || {}
        }
      })

      return {
        id: template.id,
        name: template.name,
        examCode: template.examCode,
        type: data.type, // Use the input type directly
        description: template.description,
        status: template.status as 'ACTIVE' | 'INACTIVE' | 'DRAFT',
        config: template.placeholders || {}, // Return the stored config
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
        predictions: 0,
        accuracy: 'N/A'
      }
    } catch (dbError: any) {
      console.log('Database unavailable, using mock data:', dbError.message);
      // Fallback to mock API
      return mockAPI.createExamTemplate(data);
    }
  } catch (error) {
    console.error('Failed to create exam template:', error)
    throw error
  }
}

export async function getAllExamTemplates(): Promise<ExamTemplate[]> {
  try {
    const templates = await prisma.template.findMany({
      include: {
        exams: {
          select: {
            conditions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get prediction counts for each template
    const templateIds = templates.map((t: any) => t.id)
    const predictionCounts = await prisma.prediction.groupBy({
      by: ['templateId'],
      where: { templateId: { in: templateIds } },
      _count: true
    })

    return templates.map((template: any) => {
      const predictionCount = predictionCounts.find((pc: any) => pc.templateId === template.id)?._count || 0
      
      // Check template type based on stored type and conditions in placeholders
      let templateType: 'ai' | 'dataset' | 'conditional' = 'ai' // default
      
      // First check the explicit type field
      if (template.type === 'conditional') {
        templateType = 'conditional'
      } else if (template.type === 'ai') {
        templateType = 'ai'
      } else if (template.type === 'dataset') {
        templateType = 'dataset'
      } else {
        // Fallback: check placeholders for conditions
        const config = template.placeholders as any
        if (config && config.conditions && config.conditions.length > 0) {
          templateType = 'conditional'
        } else if (config && config.aiSource) {
          templateType = 'ai'
        } else {
          templateType = 'ai' // default fallback
        }
      }
      
      return {
        id: template.id,
        name: template.name,
        examCode: template.examCode,
        type: templateType,
        description: template.description,
        status: template.status as 'ACTIVE' | 'INACTIVE' | 'DRAFT',
        config: template.placeholders || {}, // Return the stored config
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
        predictions: predictionCount,
        accuracy: template.accuracy ? `${template.accuracy.toFixed(1)}%` : 'N/A'
      }
    })
  } catch (error) {
    console.error('Failed to fetch exam templates:', error)
    throw error
  }
}

export async function updateExamTemplate(id: string, data: Partial<ExamTemplate>) {
  try {
    const template = await prisma.template.update({
      where: { id },
      data: {
        name: data.name,
        examCode: data.examCode,
        description: data.description,
        status: data.status,
        // Note: shareLink field doesn't exist in schema, removing this line
      }
    })

    return {
      id: template.id,
      name: template.name,
      examCode: template.examCode,
      type: data.type || 'dataset', // Use the input type or default
      description: template.description,
      status: template.status,
      config: {}, // Return empty config for now since schema doesn't have it
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
      predictions: 0,
      accuracy: template.accuracy ? `${template.accuracy.toFixed(1)}%` : 'N/A'
    }
  } catch (error) {
    console.error('Failed to update exam template:', error)
    throw error
  }
}

export async function getInstitutions(): Promise<any[]> {
  try {
    return await prisma.institution.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' }
    })
  } catch (dbError: any) {
    console.log('Database unavailable, using mock institutions:', dbError.message);
    return mockAPI.getInstitutions();
  }
}

export async function assignTemplateToInstitution(templateId: string, institutionId: string) {
  try {
    const assignment = await prisma.institutionTemplate.create({
      data: {
        templateId,
        institutionId,
        assignedAt: new Date(),
        status: 'ACTIVE'
      }
    })

    return assignment
  } catch (error) {
    console.error('Failed to assign template to institution:', error)
    throw error
  }
}

export async function getTemplateAssignments(templateId: string) {
  try {
    return await prisma.institutionTemplate.findMany({
      where: { templateId },
      include: {
        institution: true
      }
    })
  } catch (error) {
    console.error('Failed to fetch template assignments:', error)
    throw error
  }
}
