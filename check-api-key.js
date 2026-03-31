// Check API key permissions and try direct API call
require('dotenv').config({ path: '.env' });

async function checkAPIKey() {
  try {
    console.log('🔑 Checking API key permissions...');
    
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API Key:', apiKey.substring(0, 20) + '...');
    
    // Try direct API call to check available models
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ API Error:', response.status, errorData);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Available models:');
    data.models.forEach(model => {
      console.log(`  - ${model.name} (${model.displayName})`);
      console.log(`    Methods: ${model.supportedGenerationMethods?.join(', ')}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAPIKey();
