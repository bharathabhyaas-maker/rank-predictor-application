// Test AI Prediction with Dataset and Internet Sources
// This demonstrates how your AI prediction system works

const testAIPrediction = async () => {
  console.log('🧪 Testing AI Prediction System...\n');

  // Test 1: Dataset-based AI Prediction
  console.log('📊 Test 1: Dataset-based AI Prediction');
  console.log('=====================================');
  
  const datasetRequest = {
    studentName: "Test Student",
    studentEmail: "test@example.com",
    institutionId: "test-institution-id",
    examId: "jee-main",
    templateId: "ai-template-id",
    totalScore: 180,
    aiSource: "dataset", // Use dataset-based prediction
    datasetId: "dataset-123" // Specific dataset to analyze
  };

  console.log('Request:', JSON.stringify(datasetRequest, null, 2));
  console.log('Expected behavior: AI will analyze the uploaded dataset patterns and predict rank based on historical data\n');

  // Test 2: Internet-based AI Prediction
  console.log('🌐 Test 2: Internet-based AI Prediction');
  console.log('=====================================');
  
  const internetRequest = {
    studentName: "Test Student",
    studentEmail: "test@example.com", 
    institutionId: "test-institution-id",
    examId: "jee-main",
    templateId: "ai-template-id",
    totalScore: 180,
    aiSource: "internet" // Use internet-based prediction
    // No datasetId needed for internet source
  };

  console.log('Request:', JSON.stringify(internetRequest, null, 2));
  console.log('Expected behavior: AI will use internet knowledge and general exam patterns to predict rank\n');

  // Test 3: Default AI Prediction (falls back to internet)
  console.log('🔄 Test 3: Default AI Prediction');
  console.log('=====================================');
  
  const defaultRequest = {
    studentName: "Test Student",
    studentEmail: "test@example.com",
    institutionId: "test-institution-id", 
    examId: "jee-main",
    templateId: "ai-template-id",
    totalScore: 180
    // No aiSource specified - will default to internet
  };

  console.log('Request:', JSON.stringify(defaultRequest, null, 2));
  console.log('Expected behavior: AI will default to internet-based prediction\n');

  console.log('🎯 How to Use in Your Application:');
  console.log('=====================================');
  console.log('1. For Dataset-based predictions:');
  console.log('   - Set aiSource: "dataset"');
  console.log('   - Provide datasetId of uploaded dataset');
  console.log('   - AI will analyze dataset patterns and score distributions');
  console.log('   - More accurate predictions based on actual historical data\n');

  console.log('2. For Internet-based predictions:');
  console.log('   - Set aiSource: "internet" or omit aiSource');
  console.log('   - No datasetId needed');
  console.log('   - AI uses general knowledge and internet data');
  console.log('   - Good for exams without historical datasets\n');

  console.log('3. In your exam creation interface:');
  console.log('   - User selects AI-based prediction');
  console.log('   - User chooses between "Dataset" or "Internet" source');
  console.log('   - If "Dataset" selected, user uploads/links dataset');
  console.log('   - System stores datasetId with template');
  console.log('   - During prediction, appropriate AI source is used');
};

// Run the test
testAIPrediction();
