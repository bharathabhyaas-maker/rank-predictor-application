// Final test after server restart
const testFinalFlow = async () => {
  console.log('🧪 Final test after server restart...')
  
  const tests = [
    { 
      name: 'Predict Page', 
      url: 'http://localhost:3000/predict/jee-main-2026' 
    },
    { 
      name: 'Results Page', 
      url: 'http://localhost:3000/results/jee-main-2026' 
    },
    { 
      name: 'AI Prediction API', 
      url: 'http://localhost:3000/api/predictions/ai', 
      method: 'POST', 
      body: JSON.stringify({
        studentName: 'Test User',
        studentEmail: 'test@example.com',
        examId: 'JEE-MAIN-2026',
        templateId: 'cmn31qgkz000520lhg5nemut5',
        totalScore: 150,
        aiSource: 'internet'
      })
    }
  ]
  
  for (const test of tests) {
    try {
      const options = {
        method: test.method || 'GET',
        headers: test.body ? { 'Content-Type': 'application/json' } : {},
        body: test.body
      }
      
      const res = await fetch(test.url, options)
      console.log(`${test.name}: ${res.status} ${res.ok ? '✅' : '❌'}`)
      
      if (!res.ok && !test.body) {
        const errorText = await res.text()
        console.log('Error:', errorText.substring(0, 100))
      }
      
      if (test.body && res.ok) {
        const data = await res.json()
        console.log(`  Result: ${data.prediction?.id || 'Success'}`)
      }
      
    } catch (error) {
      console.log(`${test.name}: ❌ ${error.message}`)
    }
  }
}

testFinalFlow()
