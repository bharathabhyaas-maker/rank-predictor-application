// Test template loading by simulating different scenarios

// Test 1: Direct template access
console.log('🧪 Test 1: Direct template access');
const testDirectAccess = async () => {
  try {
    const response = await fetch('http://localhost:3000/predict/jee-main-2025');
    console.log('Direct access response:', response.status);
    if (response.ok) {
      const html = await response.text();
      console.log('Page contains prediction form:', html.includes('prediction form'));
      console.log('Page contains loading:', html.includes('Loading prediction form'));
    }
  } catch (error) {
    console.error('Direct access error:', error);
  }
};

// Test 2: Template preview from institution
console.log('🧪 Test 2: Template preview simulation');
const testTemplatePreview = async () => {
  try {
    // Simulate coming from institution templates
    const response = await fetch('http://localhost:3000/predict/jee-main-2025', {
      headers: {
        'Referer': 'http://localhost:3000/institution/templates'
      }
    });
    console.log('Template preview response:', response.status);
    if (response.ok) {
      const html = await response.text();
      console.log('Page contains prediction form:', html.includes('prediction form'));
      console.log('Page contains loading:', html.includes('Loading prediction form'));
    }
  } catch (error) {
    console.error('Template preview error:', error);
  }
};

// Test 3: Check API endpoints
console.log('🧪 Test 3: Check API endpoints');
const testAPIEndpoints = async () => {
  try {
    // Test templates API
    const templatesResponse = await fetch('http://localhost:3000/api/templates?examCode=jee-main-2025');
    console.log('Templates API status:', templatesResponse.status);
    if (templatesResponse.ok) {
      const templates = await templatesResponse.json();
      console.log('Available templates:', templates.length);
      console.log('Template IDs:', templates.map(t => t.id));
    }
    
    // Check if specific template exists
    const templateResponse = await fetch('http://localhost:3000/api/templates?examCode=clat-2025');
    console.log('CLAT template API status:', templateResponse.status);
    if (templateResponse.ok) {
      const clatTemplates = await templateResponse.json();
      console.log('CLAT templates found:', clatTemplates.length);
    }
  } catch (error) {
    console.error('API test error:', error);
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('🚀 Starting template loading tests...\n');
  
  await testAPIEndpoints();
  await new Promise(resolve => setTimeout(resolve, 1000));
  await testDirectAccess();
  await new Promise(resolve => setTimeout(resolve, 1000));
  await testTemplatePreview();
  
  console.log('\n✅ All tests completed!');
  console.log('📋 Check browser console for detailed debugging info');
};

runAllTests();
