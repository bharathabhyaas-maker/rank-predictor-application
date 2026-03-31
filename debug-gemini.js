// Debug Gemini API setup
require('dotenv').config({ path: '.env' });

console.log('🔑 Environment Variables Check:');
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0);
console.log('GEMINI_API_KEY starts with "AIza":', process.env.GEMINI_API_KEY?.startsWith('AIza'));
console.log('GEMINI_API_KEY format:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');

// Test basic Gemini import
try {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  console.log('✅ Gemini package imported successfully');
  
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'gen-lang-client-0073202674') {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini client created successfully');
  } else {
    console.log('❌ Invalid or placeholder GEMINI_API_KEY');
    console.log('📝 Expected format: AIzaSyC... (starts with "AIza")');
    console.log('📝 Current format:', process.env.GEMINI_API_KEY);
  }
} catch (error) {
  console.error('❌ Error importing Gemini:', error.message);
}
