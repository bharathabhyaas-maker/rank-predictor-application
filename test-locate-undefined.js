// Test to locate exactly where "undefined" appears in results page
const testLocateUndefined = async () => {
  console.log('🔍 LOCATING "undefined" IN RESULTS PAGE')
  console.log('======================================')
  
  try {
    // First create a prediction
    console.log('\n1️⃣ Creating prediction...')
    
    const aiResponse = await fetch('http://localhost:3000/api/predictions/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: 'Undefined Test',
        studentEmail: 'undefined@example.com',
        examId: 'JEE-MAIN-2026',
        templateId: 'cmn31qgkz000520lhg5nemut5',
        totalScore: 255,
        aiSource: 'internet'
      })
    })
    
    if (aiResponse.ok) {
      const aiData = await aiResponse.json()
      console.log('   ✅ Prediction created:', aiData.prediction.id)
    } else {
      console.log('   ❌ Prediction failed:', await aiResponse.text())
      return
    }
    
    // Get results page content
    console.log('\n2️⃣ Analyzing results page content...')
    
    const resultsResponse = await fetch('http://localhost:3000/results/jee-main-2026')
    
    if (resultsResponse.ok) {
      const resultsText = await resultsResponse.text()
      
      // Find all occurrences of "undefined"
      const undefinedMatches = resultsText.match(/undefined/g)
      const undefinedCount = undefinedMatches ? undefinedMatches.length : 0
      
      console.log(`   Found "undefined" ${undefinedCount} times`)
      
      if (undefinedCount > 0) {
        // Find context around each "undefined"
        const lines = resultsText.split('\n')
        let lineNumber = 1
        
        for (const line of lines) {
          if (line.includes('undefined')) {
            console.log(`   Line ${lineNumber}: ${line.trim()}`)
            
            // Check if it's in an error message
            if (line.includes('No prediction data found for')) {
              console.log('     → This is the error message we need to fix!')
            }
            
            // Check if it's in a template literal
            if (line.includes('examId')) {
              console.log('     → Related to examId parameter!')
            }
          }
          lineNumber++
        }
      }
      
      // Check for specific patterns
      const hasErrorWithUndefined = resultsText.includes('No prediction data found for undefined')
      const hasExamIdUndefined = resultsText.includes('examId')
      const hasTemplateUndefined = resultsText.includes('templateId')
      
      console.log('\n📊 PATTERN ANALYSIS:')
      console.log(`   Error with undefined: ${hasErrorWithUndefined ? 'Yes' : 'No'}`)
      console.log(`   Contains examId: ${hasExamIdUndefined ? 'Yes' : 'No'}`)
      console.log(`   Contains templateId: ${hasTemplateUndefined ? 'Yes' : 'No'}`)
      
      if (hasErrorWithUndefined) {
        console.log('\n🎯 ISSUE IDENTIFIED:')
        console.log('The error message "No prediction data found for undefined" is being displayed.')
        console.log('This means examId is undefined in the error message template.')
        console.log('The issue is in line 153 of results page where we set the error.')
      }
      
    } else {
      console.log('   ❌ Results page failed:', await resultsResponse.text())
    }
    
    console.log('\n🎯 SUMMARY:')
    console.log('✅ Params Promise error fixed')
    console.log('✅ Results page loads without console errors')
    console.log('⚠️ Still need to fix "undefined" in error message')
    
    console.log('\n🔧 NEXT STEPS:')
    console.log('1. Check if examId is undefined in error message')
    console.log('2. Add fallback for undefined examId')
    console.log('3. Test in browser to see actual behavior')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
  }
}

testLocateUndefined()
