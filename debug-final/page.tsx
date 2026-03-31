'use client'

import { useState } from 'react'

export default function DebugFinalPage() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [testData, setTestData] = useState({
    name: 'Test Institution',
    email: 'test@example.com',
    location: 'Test City',
    contactPerson: 'Test Contact',
    phone: '1234567890'
  })

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testEnvironment = async () => {
    setLoading(true)
    setResults([])
    
    try {
      addResult('Testing environment variables...')
      
      const response = await fetch('/api/debug-final')
      const data = await response.json()
      
      if (response.ok) {
        addResult(`✅ Environment test: ${data.message}`)
        addResult(`📁 .env file exists: ${data.results.envFileExists}`)
        addResult(`📡 DATABASE_URL found: ${data.results.databaseUrlFound}`)
        addResult(`📡 DATABASE_URL format: ${data.results.isPostgres ? 'CORRECT' : 'INCORRECT'}`)
        addResult(`📡 DATABASE_URL: ${data.results.databaseUrl}`)
      } else {
        addResult(`❌ Environment test failed: ${data.error}`)
      }
    } catch (error) {
      addResult(`❌ Environment test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testInstitutionCreation = async () => {
    setLoading(true)
    setResults([])
    
    try {
      addResult('Testing institution creation...')
      
      const response = await fetch('/api/debug-final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        addResult(`✅ Creation test: ${data.message}`)
        addResult(`📊 Status: ${data.results.status}`)
        addResult(`📋 Response: ${JSON.stringify(data.results.data, null, 2)}`)
      } else {
        addResult(`❌ Creation test failed: ${data.error}`)
        addResult(`📋 Details: ${data.details}`)
      }
    } catch (error) {
      addResult(`❌ Creation test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug Final Database</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Environment</h2>
          <button
            onClick={testEnvironment}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 mr-4"
          >
            {loading ? 'Testing...' : 'Test Environment'}
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Institution Creation</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Name"
              value={testData.name}
              onChange={(e) => setTestData({...testData, name: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={testData.email}
              onChange={(e) => setTestData({...testData, email: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Location"
              value={testData.location}
              onChange={(e) => setTestData({...testData, location: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Contact Person"
              value={testData.contactPerson}
              onChange={(e) => setTestData({...testData, contactPerson: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <button
            onClick={testInstitutionCreation}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test Creation'}
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Debug Results:</h2>
          <div className="space-y-2 font-mono text-sm max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div key={index} className={
                result.includes('✅') ? 'text-green-600' : 
                result.includes('❌') ? 'text-red-600' : 
                result.includes('📁') ? 'text-blue-600' : 
                result.includes('📡') ? 'text-purple-600' : 
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
