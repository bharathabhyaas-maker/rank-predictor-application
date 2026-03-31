'use client'

import { useState } from 'react'

export default function TestFinalDbPage() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testFinalDb = async () => {
    setLoading(true)
    setResults([])
    
    try {
      addResult('Testing final database solution...')
      
      const response = await fetch('/api/test-final')
      const data = await response.json()
      
      if (response.ok) {
        addResult(`✅ Test successful: ${data.message}`)
        addResult(`📊 Endpoint status: ${data.endpointTest.status}`)
        addResult(`📋 Data is array: ${data.endpointTest.hasData}`)
        addResult(`📋 Data length: ${data.endpointTest.dataLength}`)
      } else {
        addResult(`❌ Test failed: ${data.error}`)
        addResult(`📋 Details: ${data.details}`)
      }
    } catch (error) {
      addResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Final Database Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Final Database Solution</h2>
          <button
            onClick={testFinalDb}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test Final Database'}
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Test Results:</h2>
          <div className="space-y-2 font-mono text-sm max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div key={index} className={
                result.includes('✅') ? 'text-green-600' : 
                result.includes('❌') ? 'text-red-600' : 
                result.includes('📊') ? 'text-blue-600' : 
                'text-gray-600'
              }>
                {result}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
