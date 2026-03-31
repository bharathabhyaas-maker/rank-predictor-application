const http = require('http')

async function testAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/institutions',
      method: 'GET'
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        console.log('Status:', res.statusCode)
        console.log('Response preview:', data.substring(0, 150) + '...')
        
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data)
            console.log('✅ SUCCESS! Found', json.length, 'institutions')
            resolve({ success: true, count: json.length })
          } catch (e) {
            console.error('❌ Invalid JSON response')
            resolve({ success: false, error: 'Invalid JSON' })
          }
        } else {
          console.error('❌ HTTP Error:', res.statusCode)
          resolve({ success: false, error: `HTTP ${res.statusCode}` })
        }
      })
    })

    req.on('error', (error) => {
      console.error('❌ Network Error:', error.message)
      reject(error)
    })

    req.setTimeout(5000, () => {
      req.destroy()
      reject(new Error('Timeout'))
    })

    req.end()
  })
}

testAPI()
  .then(result => {
    console.log('\n🎯 FINAL RESULT:', result)
    process.exit(result.success ? 0 : 1)
  })
  .catch(error => {
    console.error('\n❌ TEST FAILED:', error.message)
    process.exit(1)
  })
