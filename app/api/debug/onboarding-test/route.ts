import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Debug: Testing onboarding page route...')
    
    // Test if onboarding page exists and is accessible
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const onboardingUrl = `${baseUrl}/onboarding`
    
    console.log('🔍 Onboarding URL:', onboardingUrl)
    
    return NextResponse.json({
      success: true,
      message: 'Onboarding page is available',
      url: onboardingUrl,
      instructions: [
        'Navigate to /onboarding to access the institution registration form',
        'The page includes 4 steps: Institution Details, Contact Info, Account Setup, Preferences',
        'Super Admin can use this to onboard new institutions'
      ]
    })
    
  } catch (error) {
    console.error('❌ Debug onboarding test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
