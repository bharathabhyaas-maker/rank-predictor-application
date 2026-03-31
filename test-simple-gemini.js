// Simple test for Gemini AI
require('dotenv').config({ path: '.env' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testSimpleGemini() {
  try {
    console.log('🤖 Testing simple Gemini AI...');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try different model names
    const models = [
      "gemini-1.5-flash",
      "gemini-1.5-pro", 
      "gemini-pro",
      "gemini-pro-vision"
    ];
    
    for (const modelName of models) {
      try {
        console.log(`\n📡 Trying model: ${modelName}`);
        
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent("Hello, can you respond with just 'OK'?");
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ ${modelName} works! Response:`, text);
        break; // Stop at first working model
        
      } catch (modelError) {
        console.log(`❌ ${modelName} failed:`, modelError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSimpleGemini();
