// Script to add Gemini API key to .env file
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const geminiApiKey = 'AIzaSyBMbn739hufZwUbxpIASXOLWBJ0b95FoNM';

try {
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Remove existing GEMINI_API_KEY if it exists
  const lines = envContent.split('\n');
  const filteredLines = lines.filter(line => !line.startsWith('GEMINI_API_KEY='));
  
  // Add the new API key
  filteredLines.push(`GEMINI_API_KEY=${geminiApiKey}`);
  
  // Write back to file
  fs.writeFileSync(envPath, filteredLines.join('\n'));
  
  console.log('✅ Gemini API key updated in .env file');
  console.log('🔑 GEMINI_API_KEY:', geminiApiKey);
  
} catch (error) {
  console.error('❌ Error updating .env file:', error.message);
}
