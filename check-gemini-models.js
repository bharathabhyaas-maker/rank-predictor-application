// Check available Gemini models
require('dotenv').config({ path: '.env' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function checkModels() {
  try {
    console.log('🔍 Checking available Gemini models...');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    console.log('📡 Fetching models...');
    
    // List available models
    const models = await genAI.listModels();
    
    console.log('✅ Available models:');
    models.forEach(model => {
      console.log(`  - ${model.name} (${model.displayName})`);
      console.log(`    Supported methods: ${model.supportedGenerationMethods?.join(', ')}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error fetching models:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.status, error.response.data);
    }
  }
}

checkModels();
