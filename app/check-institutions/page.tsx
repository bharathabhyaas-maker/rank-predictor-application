'use client'

import { useState } from 'react'

export default function CheckInstitutionsPage() {
  const [results, setResults] = useState<string[]>([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const checkAllInstitutions = async () => {
    setLoading(true)
    setResults([])
    
    try {
      addResult('Checking all institutions in database...')
      
      const response = await fetch('/api/check-institutions')
      const data = await response.json()
      
      if (response.ok) {
        addResult(`✅ Found ${data.totalInstitutions} institutions`)
        
        if (data.institutions.length > 0) {
          data.institutions.forEach((inst: any) => {
            addResult(`📋 ${inst.name} (${inst.email}) - ID: ${inst.institutionId}`)
          })
        } else {
          addResult('📭 No institutions found in database')
        }
      } else {
        addResult(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      addResult(`❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const checkEmail = async () => {
    if (!email) {
      addResult('❌ Please enter an email address')
      return
    }
    
    setLoading(true)
    
    try {
      addResult(`Checking email: ${email}`)
      
      const response = await fetch('/api/check-institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        if (data.exists) {
          addResult(`❌ Email already exists: ${data.institution.name}`)
          addResult(`📋 Institution ID: ${data.institution.institutionId}`)
          addResult(`📅 Created: ${data.institution.createdAt}`)
        } else {
          addResult(`✅ Email is available: ${email}`)
        }
      } else {
        addResult(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      addResult(`❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Database Institution Checker</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Check All Institutions</h2>
          <button
            onClick={checkAllInstitutions}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Checking...' : 'Check All Institutions'}
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Check Specific Email</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={checkEmail}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading ? 'Checking...' : 'Check Email'}
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Results:</h2>
          <div className="space-y-2 font-mono text-sm max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div key={index} className={
                result.includes('✅') ? 'text-green-600' : 
                result.includes('❌') ? 'text-red-600' : 
                result.includes('📋') ? 'text-blue-600' : 
                result.includes('📊') ? 'text-purple-600' : 
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
