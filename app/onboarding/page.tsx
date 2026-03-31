"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const totalSteps = 3

  // Step 1: Institution Details
  const [institutionName, setInstitutionName] = useState("")
  const [institutionType, setInstitutionType] = useState("")
  const [studentCount, setStudentCount] = useState("")

  // Step 2: Contact Information
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")

  // Step 3: Preferences (moved from Step 4)
  const [examTypes, setExamTypes] = useState<string[]>([])

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      console.log('Onboarding: Starting submission with data:', {
        institutionName,
        institutionType,
        fullName,
        email,
        phone,
        city,
        studentCount,
        examTypes
      })

      // Send notification to super admin and store onboarding data
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionName,
          institutionType,
          fullName,
          email,
          phone,
          city,
          studentCount,
          examTypes
        })
      })

      console.log('Onboarding: Response status:', response.status)
      console.log('Onboarding: Response headers:', response.headers)

      const responseText = await response.text()
      console.log('Onboarding: Response text:', responseText)

      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Onboarding: Failed to parse response:', parseError)
        responseData = { error: 'Invalid response format' }
      }

      if (response.ok && responseData.success) {
        console.log('Onboarding: Registration submitted successfully:', responseData)
        alert('🎉 Registration submitted successfully!\n\nYour institution registration has been received and stored in our system. The super admin has been notified and will review your application. You will receive login credentials via email once your account is approved.')
      } else {
        console.error('Onboarding: Failed to submit registration:', responseData)
        
        // Handle different error response formats
        let errorMessage = 'Unknown error occurred'
        if (responseData?.error) {
          errorMessage = responseData.error
        } else if (responseData?.details) {
          errorMessage = responseData.details
        } else if (typeof responseData === 'string') {
          errorMessage = responseData
        } else if (responseText && !responseText.startsWith('{')) {
          errorMessage = responseText
        }
        
        alert(`⚠️ Registration failed: ${errorMessage}\n\nPlease try again or contact support.`)
        return // Stop here on error
      }

      // Handle onboarding completion - redirect to login page
      setTimeout(() => {
        router.push("/auth/institution/login")
      }, 2000) // Delay to let user read the message
      
    } catch (error) {
      console.error('Onboarding submission error:', error)
      alert('There was an error submitting your registration. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleExamType = (exam: string) => {
    setExamTypes((prev) => (prev.includes(exam) ? prev.filter((e) => e !== exam) : [...prev, exam]))
  }

  const institutionTypes = [
    { value: "coaching", label: "Coaching Institute", icon: "📚" },
    { value: "school", label: "School", icon: "🏫" },
    { value: "college", label: "College/University", icon: "🎓" },
    { value: "other", label: "Other", icon: "🏢" },
  ]

  const examTypeOptions = [
    { value: "jee", label: "JEE", icon: "🔬" },
    { value: "neet", label: "NEET", icon: "⚕️" },
    { value: "clat", label: "CLAT", icon: "⚖️" },
    { value: "cat", label: "CAT", icon: "💼" },
    { value: "gate", label: "GATE", icon: "🔧" },
    { value: "upsc", label: "UPSC", icon: "🏛️" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-accent/10">
      {/* Header */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                RP
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                RankPredict
              </span>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">
                Exit Registration
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-full font-bold text-sm transition-all ${
                      step <= currentStep
                        ? "bg-gradient-to-br from-primary to-accent text-white shadow-lg scale-110"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                        step < currentStep ? "bg-gradient-to-r from-primary to-accent" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="text-center flex-1">Institution Info</span>
              <span className="text-center flex-1">Contact Details</span>
              <span className="text-center flex-1">Submit Registration</span>
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12">
            {/* Step 1: Institution Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent text-white text-3xl mb-4 shadow-lg">
                    🏛️
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Tell us about your institution</h2>
                  <p className="text-muted-foreground">Help us customize your experience</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Institution Name *</label>
                  <Input
                    placeholder="e.g., ABC Coaching Institute"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Institution Type *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {institutionTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setInstitutionType(type.value)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          institutionType === type.value
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-gray-200 hover:border-primary/50"
                        }`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className="font-medium text-sm">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Approximate Student Count *</label>
                  <select
                    value={studentCount}
                    onChange={(e) => setStudentCount(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="">Select range</option>
                    <option value="0-100">0-100 students</option>
                    <option value="100-500">100-500 students</option>
                    <option value="500-1000">500-1,000 students</option>
                    <option value="1000+">1,000+ students</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-accent to-secondary text-white text-3xl mb-4 shadow-lg">
                    👤
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Contact Information</h2>
                  <p className="text-muted-foreground">We'll use this to reach you</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <Input
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address *</label>
                  <Input
                    type="email"
                    placeholder="your.email@institution.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number *</label>
                  <Input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">City *</label>
                  <Input
                    placeholder="e.g., Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Final Registration */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white text-3xl mb-4 shadow-lg">
                    📋
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Final Registration Details</h2>
                  <p className="text-muted-foreground">Last step before submitting your registration</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Select Exam Types (Optional)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {examTypeOptions.map((exam) => (
                      <button
                        key={exam.value}
                        onClick={() => toggleExamType(exam.value)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          examTypes.includes(exam.value)
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-gray-200 hover:border-primary/50"
                        }`}
                      >
                        <div className="text-2xl mb-1">{exam.icon}</div>
                        <div className="text-sm font-medium">{exam.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-8 bg-transparent"
              >
                Back
              </Button>
            </div>
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </div>

              {currentStep < totalSteps ? (
                <Button onClick={handleNext} className="bg-gradient-to-r from-primary to-accent hover:shadow-lg px-8">
                  Continue
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-primary to-accent hover:shadow-lg px-8 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting Registration...' : 'Submit Registration'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
