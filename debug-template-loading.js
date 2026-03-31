// Debug template loading issue
const debugTemplateLoading = async () => {
  console.log('🔍 DEBUGGING TEMPLATE LOADING ISSUE')
  console.log('=====================================')
  
  try {
    // Test 1: Check if templates API works
    console.log('\n1️⃣ Testing templates API...')
    const templatesRes = await fetch('http://localhost:3000/api/templates?examCode=jee-main-2026')
    console.log(`   Status: ${templatesRes.status}`)
    
    if (templatesRes.ok) {
      const templates = await templatesRes.json()
      console.log(`   Templates found: ${templates.length}`)
      
      if (templates.length === 0) {
        console.log('   ⚠️ No templates found - will use fallback config')
        console.log('   📋 This should trigger fallback config in the prediction page')
      }
    } else {
      console.log('   ❌ Templates API failed:', await templatesRes.text())
    }
    
    // Test 2: Check if prediction page loads the fallback correctly
    console.log('\n2️⃣ Testing prediction page with fallback...')
    const predictRes = await fetch('http://localhost:3000/predict/jee-main-2026')
    console.log(`   Status: ${predictRes.status}`)
    
    if (predictRes.ok) {
      const pageText = await predictRes.text()
      console.log('   ✅ Prediction page loads')
      
      // Check for specific elements that indicate fallback config
      const hasForm = pageText.includes('<form')
      const hasLoading = pageText.includes('Loading') || pageText.includes('loading')
      const hasSubjects = pageText.includes('Physics') || pageText.includes('Chemistry') || pageText.includes('Mathematics')
      
      console.log(`   Has form: ${hasForm ? 'Yes' : 'No'}`)
      console.log(`   Has loading indicator: ${hasLoading ? 'Yes' : 'No'}`)
      console.log(`   Has default subjects: ${hasSubjects ? 'Yes' : 'No'}`)
      
      if (hasForm && hasSubjects) {
        console.log('   ✅ Fallback config appears to be working')
      } else {
        console.log('   ⚠️ Fallback config might have issues')
      }
    }
    
    // Test 3: Check if there are any redirects happening
    console.log('\n3️⃣ Checking for redirects...')
    const redirectTest = await fetch('http://localhost:3000/predict/jee-main-2026', {
      redirect: 'manual' // Don't follow redirects
    })
    console.log(`   Redirect status: ${redirectTest.status}`)
    
    if (redirectTest.status >= 300 && redirectTest.status < 400) {
      console.log('   ⚠️ Redirect detected!')
      console.log('   Location:', redirectTest.headers.get('location'))
    } else {
      console.log('   ✅ No redirects detected')
    }
    
    console.log('\n🎯 DEBUG SUMMARY:')
    console.log('The "No Prediction Yet" error appearing during template loading')
    console.log('might be caused by:')
    console.log('1. JavaScript error in browser during template loading')
    console.log('2. Unexpected redirect to results page')
    console.log('3. SessionStorage issue in browser')
    console.log('\n💡 Recommendation: Check browser console for JavaScript errors')
    
  } catch (error) {
    console.error('\n❌ Debug failed:', error.message)
  }
}

debugTemplateLoading()
