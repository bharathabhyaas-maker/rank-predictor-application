"use client"

import { useState, useEffect } from "react"

export default function DebugAssignmentsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDebugData()
  }, [])

  const loadDebugData = async () => {
    try {
      const response = await fetch('/api/debug/assignments')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to load debug data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading debug data...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Template Assignments Debug</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Institutions ({data?.institutions?.length || 0})</h2>
        <div className="bg-gray-100 p-4 rounded">
          {data?.institutions?.map((inst: any) => (
            <div key={inst.id} className="mb-2">
              <strong>{inst.name}</strong> (ID: {inst.id}, institutionId: {inst.institutionId})
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">All Assignments ({data?.assignments?.length || 0})</h2>
        <div className="bg-gray-100 p-4 rounded">
          {data?.assignments?.map((assignment: any, index: number) => (
            <div key={index} className="mb-4 p-3 bg-white rounded border">
              <div><strong>Template:</strong> {assignment.template.name} ({assignment.template.id})</div>
              <div><strong>Institution:</strong> {assignment.institution.name} ({assignment.institution.id})</div>
              <div><strong>Status:</strong> {assignment.status}</div>
              <div><strong>Assigned:</strong> {assignment.assignedAt}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Gyanville Academy Assignments ({data?.gyanvilleAssignments?.length || 0})</h2>
        <div className="bg-yellow-100 p-4 rounded">
          {data?.gyanvilleAssignments?.length > 0 ? (
            data?.gyanvilleAssignments?.map((assignment: any, index: number) => (
              <div key={index} className="mb-2">
                <strong>{assignment.template.name}</strong> ({assignment.status})
              </div>
            ))
          ) : (
            <div className="text-red-600">No assignments found for Gyanville Academy</div>
          )}
        </div>
      </div>
    </div>
  )
}
