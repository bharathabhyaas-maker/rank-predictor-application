'use client'

import { useState } from 'react'

export default function DebugPage() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runTests = async () => {
    setLoading(true)
    setResults([])
    
    try {
      addResult('Starting comprehensive debug tests...')
      
      // Test 1: Server Health Check
      addResult('Testing server health...')
      const healthResponse = await fetch('/api/health')
      addResult(`✓ Server health status: ${healthResponse.status}`)
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json()
        addResult(`✓ Server status: ${healthData.status}`)
        addResult(`✓ Environment: ${healthData.environment}`)
      } else {
        const errorData = await healthResponse.json()
        addResult(`✗ Server health error: ${errorData.error}`)
      }
      
      // Test 2: Database Connection Test
      addResult('Testing database connection...')
      const dbResponse = await fetch('/api/test-db')
      addResult(`✓ Database test status: ${dbResponse.status}`)
      
      if (dbResponse.ok) {
        const dbData = await dbResponse.json()
        addResult(`✓ Database connection: ${dbData.success ? 'SUCCESS' : 'FAILED'}`)
        addResult(`✓ Database URL: ${dbData.databaseUrl}`)
      } else {
        const errorData = await dbResponse.json()
        addResult(`✗ Database connection error: ${errorData.error}`)
        addResult(`✗ Error details: ${errorData.details || 'No details'}`)
      }
      
      // Test 3: Basic API connectivity
      addResult('Testing basic API...')
      const testResponse = await fetch('/api/test')
      const testData = await testResponse.json()
      addResult(`✓ Basic API: ${testData.message}`)
      
      // Test 4: Institutions API (GET)
      addResult('Testing institutions GET...')
      const instResponse = await fetch('/api/institutions')
      addResult(`✓ Institutions GET status: ${instResponse.status}`)
      
      if (instResponse.ok) {
        const instData = await instResponse.json()
        addResult(`✓ Institutions data: ${Array.isArray(instData) ? instData.length : 'not array'} items`)
      } else {
        const errorData = await instResponse.json()
        addResult(`✗ Institutions GET error: ${errorData.error || errorData.details}`)
      }
      
      // Test 5: Templates API (GET)
      addResult('Testing templates GET...')
      const templateResponse = await fetch('/api/templates')
      addResult(`✓ Templates GET status: ${templateResponse.status}`)
      
      if (templateResponse.ok) {
        const templateData = await templateResponse.json()
        addResult(`✓ Templates data: ${Array.isArray(templateData) ? templateData.length : 'not array'} items`)
      } else {
        const errorData = await templateResponse.json()
        addResult(`✗ Templates GET error: ${errorData.error || errorData.details}`)
      }
      
      // Test 6: Predictions Count API
      addResult('Testing predictions count...')
      const predResponse = await fetch('/api/predictions/count')
      addResult(`✓ Predictions count status: ${predResponse.status}`)
      
      if (predResponse.ok) {
        const predData = await predResponse.json()
        addResult(`✓ Predictions count: ${predData.count}`)
      } else {
        const errorData = await predResponse.json()
        addResult(`✗ Predictions count error: ${errorData.error || errorData.details}`)
      }
      
      // Test 7: Students Count API
      addResult('Testing students count...')
      const studentsResponse = await fetch('/api/institutions/students/count')
      addResult(`✓ Students count status: ${studentsResponse.status}`)
      
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json()
        addResult(`✓ Students count: ${studentsData.count}`)
      } else {
        const errorData = await studentsResponse.json()
        addResult(`✗ Students count error: ${errorData.error || errorData.details}`)
      }
      
      // Test 8: Active Institutions Count API
      addResult('Testing active institutions count...')
      const activeResponse = await fetch('/api/institutions/active/count')
      addResult(`✓ Active institutions status: ${activeResponse.status}`)
      
      if (activeResponse.ok) {
        const activeData = await activeResponse.json()
        addResult(`✓ Active institutions: ${activeData.count}`)
      } else {
        const errorData = await activeResponse.json()
        addResult(`✗ Active institutions error: ${errorData.error || errorData.details}`)
      }
      
      // Test 9: Datasets API
      addResult('Testing datasets...')
      const datasetsResponse = await fetch('/api/datasets')
      addResult(`✓ Datasets status: ${datasetsResponse.status}`)
      
      if (datasetsResponse.ok) {
        const datasetsData = await datasetsResponse.json()
        addResult(`✓ Datasets data: ${Array.isArray(datasetsData) ? datasetsData.length : 'not array'} items`)
      } else {
        const errorData = await datasetsResponse.json()
        addResult(`✗ Datasets error: ${errorData.error || errorData.details}`)
      }
      
      addResult('✓ All tests completed!')
      
    } catch (error) {
      addResult(`✗ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      addResult(`✗ Error stack: ${error instanceof Error ? error.stack : 'No stack trace'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">API Debug Page</h1>
        
        <button
          onClick={runTests}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Running Tests...' : 'Run Debug Tests'}
        </button>
        
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Test Results:</h2>
          <div className="space-y-2 font-mono text-sm max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div key={index} className={result.includes('✓') ? 'text-green-600' : result.includes('✗') ? 'text-red-600' : 'text-gray-600'}>
                {result}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
