import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  try {
    const datasets = await prisma.dataset.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the expected interface
    const formattedDatasets = datasets.map((dataset: any) => ({
      id: dataset.id,
      exam: dataset.name, // Using name as exam name
      year: new Date(dataset.createdAt).getFullYear().toString(), // Extract year from createdAt
      records: dataset.recordCount,
      size: "0.0 MB", // Default size since size field doesn't exist
      uploaded: dataset.createdAt.toISOString().split('T')[0],
      status: dataset.status,
      fileName: dataset.name, // Using name as filename
      description: dataset.description,
      uploader: "System", // Default uploader since no relation exists
      templatesUsed: 0 // Default count since no relation exists
    }))

    return NextResponse.json(formattedDatasets)
  } catch (error) {
    console.error('Failed to fetch datasets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch datasets' },
      { status: 500 }
    )
  }
}
