// Debug environment variables
const fs = require('fs')
const path = require('path')

console.log('🔍 Debugging environment variables...')

// Check .env.local
const envLocalPath = path.join(process.cwd(), '.env.local')
const envPath = path.join(process.cwd(), '.env')

console.log('📁 Looking for .env.local at:', envLocalPath)
console.log('📁 Looking for .env at:', envPath)

let envContent = ''
let fileName = ''

if (fs.existsSync(envLocalPath)) {
  envContent = fs.readFileSync(envLocalPath, 'utf8')
  fileName = '.env.local'
  console.log('✅ Found .env.local file')
} else if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8')
  fileName = '.env'
  console.log('✅ Found .env file')
} else {
  console.log('❌ No .env or .env.local file found')
  process.exit(1)
}

console.log(`📄 ${fileName} content (${envContent.length} chars):`)
console.log(envContent)

// Parse and check DATABASE_URL
const lines = envContent.split('\n')
let databaseUrl = ''
let nextauthUrl = ''
let nextauthSecret = ''

lines.forEach(line => {
  const trimmedLine = line.trim()
  if (trimmedLine.startsWith('DATABASE_URL=')) {
    databaseUrl = trimmedLine.substring('DATABASE_URL='.length)
  } else if (trimmedLine.startsWith('NEXTAUTH_URL=')) {
    nextauthUrl = trimmedLine.substring('NEXTAUTH_URL='.length)
  } else if (trimmedLine.startsWith('NEXTAUTH_SECRET=')) {
    nextauthSecret = trimmedLine.substring('NEXTAUTH_SECRET='.length)
  }
})

console.log('\n🔍 Parsed environment variables:')
console.log('DATABASE_URL:', databaseUrl ? `${databaseUrl.substring(0, 20)}... (${databaseUrl.length} chars)` : 'NOT FOUND')
console.log('NEXTAUTH_URL:', nextauthUrl || 'NOT FOUND')
console.log('NEXTAUTH_SECRET:', nextauthSecret ? 'SET' : 'NOT FOUND')

if (!databaseUrl) {
  console.log('\n❌ DATABASE_URL is missing!')
  console.log('Please add this line to your .env.local file:')
  console.log('DATABASE_URL=postgresql://postgres:Bharathteja@localhost:5432/rank_predictor')
} else {
  console.log('\n✅ DATABASE_URL is present')
}
