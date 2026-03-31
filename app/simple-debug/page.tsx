'use client'

import { useState } from 'react'

export default function SimpleDebugPage() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runSimpleTest = async () => {
    setLoading(true)
    setResults([])
    
    try {
      addResult('Starting simple API test...')
      
      // Test 1: Simple API endpoint
      addResult('Testing simple API endpoint...')
      try {
        const response = await fetch('/api/simple-test')
        const data = await response.json()
        addResult(`✓ Simple API working: ${data.message}`)
        addResult(`✓ Timestamp: ${data.timestamp}`)
      } catch (error) {
        addResult(`✗ Simple API failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      
      // Test 2: Try institutions API
      addResult('Testing institutions API...')
      try {
        const response = await fetch('/api/institutions')
        addResult(`✓ Institutions API status: ${response.status}`)
        
        if (response.ok) {
          const data = await response.json()
          addResult(`✓ Institutions data: ${Array.isArray(data) ? data.length : 'not array'} items`)
          
          if (Array.isArray(data) && data.length > 0) {
            addResult(`✓ First institution: ${data[0]?.name || 'No name'}`)
          } else {
            addResult(`⚠️ No institutions found in database`)
          }
        } else {
          const errorData = await response.json().catch(() => ({}))
          addResult(`✗ Institutions API error: ${errorData.error || 'No error details'}`)
        }
      } catch (error) {
        addResult(`✗ Institutions API failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      
      addResult('Simple test completed!')
      
    } catch (error) {
      addResult(`✗ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Simple API Debug</h1>
        <p className="text-gray-600 mb-4">
          This page tests basic API connectivity without complex database operations.
        </p>
        
        <button
          onClick={runSimpleTest}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 mb-4"
        >
          {loading ? 'Testing...' : 'Run Simple Test'}
        </button>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Test Results:</h2>
          <div className="space-y-2 font-mono text-sm max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div key={index} className={
                result.includes('✓') ? 'text-green-600' : 
                result.includes('✗') ? 'text-red-600' : 
                result.includes('⚠️') ? 'text-yellow-600' : 
                'text-gray-600'
              }>
                {result}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Next Steps:</h3>
          <ol className="list-decimal list-decimal text-sm text-blue-700 space-y-1">
            <li>If simple test works but institutions fail → Database connection issue</li>
            <li>If both fail → Server not running or routing issue</li>
            <li>If both work → Check database tables and data</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
