"use client"

import AdminNavigation from "@/components/admin-navigation"
import { Button } from "@/components/ui/button"
import { Search, Building2, Users, TrendingUp, Plus, Eye, Settings, ToggleRight, ToggleLeft, Mail, X, Copy, Check, Clock, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { getInstitutionStats, createInstitution, updateInstitutionStatus, InstitutionStats } from "@/lib/client-api"

interface InstitutionOnboarding {
  id: string
  institutionName: string
  contactPerson?: string
  email: string
  mobile: string
  location?: string
  interestedCourses: string[]
  message?: string
  status: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'REJECTED'
  createdAt: string
  updatedAt: string
}

export default function InstitutionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    plan: "Standard",
    contactPerson: "",
    phone: "",
  })
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    email: string
    password: string
  } | null>(null)
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedTemplates, setSelectedTemplates] = useState<number[]>([])
  const [templates, setTemplates] = useState<any[]>([])

  const [institutionList, setInstitutionList] = useState<InstitutionStats[]>([])
  const [loading, setLoading] = useState(true)
  const [onboardingList, setOnboardingList] = useState<InstitutionOnboarding[]>([])
  const [onboardingLoading, setOnboardingLoading] = useState(true)

  useEffect(() => {
    loadInstitutions()
    loadTemplates()
    loadOnboardingData()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }

  const handleAssignTemplates = async () => {
    if (!selectedInstitution || selectedTemplates.length === 0) {
      alert('Please select at least one template')
      return
    }

    try {
      const assignments = []
      
      for (const templateId of selectedTemplates) {
        const response = await fetch('/api/exams/assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: templateId.toString(),
            institutionId: selectedInstitution.id
          })
        })
        
        if (response.ok) {
          assignments.push(templateId)
        } else {
          console.error('Failed to assign template:', templateId)
        }
      }

      if (assignments.length > 0) {
        alert(`Successfully assigned ${assignments.length} template(s) to ${selectedInstitution.name}`)
        // Refresh the institutions data to show updated assignment count
        await loadInstitutions()
      } else {
        alert('Failed to assign templates')
      }
      
      setShowAssignModal(false)
      setSelectedTemplates([])
    } catch (error) {
      console.error('Failed to assign templates:', error)
      alert('Failed to assign templates. Please try again.')
    }
  }

  const loadInstitutions = async () => {
    try {
      setLoading(true)
      const data = await getInstitutionStats()
      setInstitutionList(data)
    } catch (error) {
      console.error('Failed to load institutions:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadOnboardingData = async () => {
    try {
      setOnboardingLoading(true)
      const response = await fetch('/api/onboarding')
      if (response.ok) {
        const data = await response.json()
        setOnboardingList(data)
      }
    } catch (error) {
      console.error('Failed to load onboarding data:', error)
    } finally {
      setOnboardingLoading(false)
    }
  }

  const activeInstitutions = institutionList.filter(inst => inst.status === "active").length
  const totalStudents = institutionList.reduce((sum, inst) => sum + inst.students, 0)
  const totalPredictions = institutionList.reduce((sum, inst) => sum + inst.predictions, 0)

  const filteredInstitutions = institutionList.filter(inst => {
    const matchesSearch =
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || inst.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const generateInstitutionId = (email: string) => {
    // Extract domain from email and create ID from email prefix
    const emailPrefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `${emailPrefix}${randomSuffix}`
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleAddInstitution = async () => {
    if (!formData.name || !formData.email || !formData.location) {
      alert("Please fill all required fields")
      return
    }

    try {
      const response = await createInstitution({
        name: formData.name,
        email: formData.email,
        location: formData.location,
        plan: formData.plan,
      })
      
      // Use credentials returned from API
      if (response.credentials) {
        setGeneratedCredentials({
          email: response.credentials.email,
          password: response.credentials.password,
        })
      }
    } catch (error) {
      console.error('Failed to create institution:', error)
      
      // Show more detailed error message to the user
      let errorMessage = "Failed to create institution. Please try again."
      
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          errorMessage = "An institution with this email already exists."
        } else if (error.message.includes('Missing required fields')) {
          errorMessage = "Please fill all required fields."
        } else if (error.message.includes('Database')) {
          errorMessage = "Database connection error. Please try again later."
        } else {
          errorMessage = `Error: ${error.message}`
        }
      }
      
      alert(errorMessage)
    }
  }

  const handleSendCredentials = async () => {
    if (!generatedCredentials) return

    // Simulate sending email
    console.log("[v0] Sending credentials to:", formData.email)
    console.log("[v0] Login Email:", generatedCredentials.email)
    console.log("[v0] Password:", generatedCredentials.password)

    // Reload institutions to get the latest data
    await loadInstitutions()
    
    // Show success and reset
    alert(`Credentials sent to ${formData.email}!\n\nLogin Email: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}`)
    
    setShowAddModal(false)
    setFormData({ name: "", email: "", location: "", plan: "Standard", contactPerson: "", phone: "" })
    setGeneratedCredentials(null)
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const toggleStatus = async (id: string) => {
    const institution = institutionList.find(inst => inst.id === id)
    if (!institution) return

    try {
      const newStatus = institution.status === "active" ? "INACTIVE" : "ACTIVE"
      await updateInstitutionStatus(id, newStatus)
      
      setInstitutionList(institutionList.map(inst => 
        inst.id === id 
          ? { ...inst, status: newStatus.toLowerCase() }
          : inst
      ))
    } catch (error) {
      console.error('Failed to update institution status:', error)
    }
  }

  const updateOnboardingStatus = async (id: string, status: string) => {
    try {
      console.log(`Updating onboarding status for ${id} to ${status}`)
      const response = await fetch(`/api/onboarding/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (response.ok) {
        const updatedItem = await response.json()
        console.log('Status updated successfully:', updatedItem)
        setOnboardingList(onboardingList.map(item => 
          item.id === id 
            ? { ...item, status: status as any }
            : item
        ))
      } else {
        console.error('Failed to update status:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Failed to update onboarding status:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-indigo-50">
      <AdminNavigation />

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Manage Institutions
            </h1>
            <p className="text-muted-foreground">Institutions using your prediction templates</p>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Institution
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border-2 border-purple-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Institutions</div>
                <div className="text-2xl font-bold text-purple-900">{institutionList.length}</div>
              </div>
            </div>
          </div>
          <div className="bg-white border-2 border-green-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <ToggleRight className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Active</div>
                <div className="text-2xl font-bold text-green-700">{activeInstitutions}</div>
              </div>
            </div>
          </div>
          <div className="bg-white border-2 border-blue-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Students</div>
                <div className="text-2xl font-bold text-blue-700">{totalStudents.toLocaleString()}</div>
              </div>
            </div>
          </div>
          <div className="bg-white border-2 border-indigo-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Predictions</div>
                <div className="text-2xl font-bold text-indigo-700">{totalPredictions.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl p-5 mb-6 border-2 border-purple-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, email, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Institutions Table */}
        <div className="bg-white border-2 border-purple-200 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-purple-50 border-b-2 border-purple-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">Institution</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">Templates</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">Students</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">Predictions</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">Plan</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInstitutions.length > 0 ? (
                  filteredInstitutions.map((inst) => (
                    <tr key={inst.id} className="border-b border-purple-100 hover:bg-purple-50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{inst.name}</div>
                            <div className="text-sm text-muted-foreground">{inst.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                          {inst.templatesAssigned} templates
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-semibold">{inst.students.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-semibold">{inst.predictions.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          inst.plan === "Enterprise" 
                            ? "bg-indigo-100 text-indigo-700"
                            : inst.plan === "Premium"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {inst.plan}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            inst.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {inst.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              setSelectedInstitution(inst)
                              setShowViewModal(true)
                            }}
                            className="bg-transparent border-2 border-purple-300 text-purple-700 hover:bg-purple-50 rounded-full px-4 font-medium"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              setSelectedInstitution(inst)
                              setSelectedTemplates([])
                              setShowAssignModal(true)
                            }}
                            className="bg-transparent border-2 border-purple-300 text-purple-700 hover:bg-purple-50 rounded-full px-4 font-medium"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Assign
                          </Button>
                          <button
                            onClick={() => toggleStatus(inst.id)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            title={inst.status === "active" ? "Click to deactivate" : "Click to activate"}
                          >
                            {inst.status === "active" ? (
                              <ToggleRight className="w-6 h-6 text-green-600" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      No institutions found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Onboarding Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Institution Onboarding
              </h2>
              <p className="text-muted-foreground">Manage institution onboarding requests and status</p>
            </div>
          </div>

          {/* Onboarding Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border-2 border-purple-200 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Requests</div>
                  <div className="text-2xl font-bold text-purple-900">{onboardingList.length}</div>
                </div>
              </div>
            </div>
            <div className="bg-white border-2 border-purple-200 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">New</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {onboardingList.filter(item => item.status === 'NEW').length}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white border-2 border-purple-200 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Contacted</div>
                  <div className="text-2xl font-bold text-yellow-700">
                    {onboardingList.filter(item => item.status === 'CONTACTED').length}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white border-2 border-purple-200 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Converted</div>
                  <div className="text-2xl font-bold text-green-700">
                    {onboardingList.filter(item => item.status === 'CONVERTED').length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Onboarding Table */}
          <div className="bg-white border-2 border-purple-200 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-purple-50 border-b-2 border-purple-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">Institution</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">Contact Person</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">Mobile</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">Courses</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-purple-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {onboardingList.length > 0 ? (
                    onboardingList.map((onboarding) => (
                      <tr key={onboarding.id} className="border-b border-purple-100 hover:bg-purple-50 transition-colors">
                        <td className="px-6 py-5">
                          <div>
                            <div className="font-semibold text-gray-900">{onboarding.institutionName}</div>
                            {onboarding.location && (
                              <div className="text-sm text-muted-foreground">{onboarding.location}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-medium">{onboarding.contactPerson || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-medium text-blue-600">{onboarding.email}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-medium">{onboarding.mobile}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-1">
                            {onboarding.interestedCourses.slice(0, 2).map((course, index) => (
                              <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                {course}
                              </span>
                            ))}
                            {onboarding.interestedCourses.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                                +{onboarding.interestedCourses.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              onboarding.status === 'NEW' 
                                ? "bg-blue-100 text-blue-800"
                                : onboarding.status === 'CONTACTED'
                                ? "bg-yellow-100 text-yellow-800"
                                : onboarding.status === 'CONVERTED'
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {onboarding.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            {onboarding.status === 'NEW' && (
                              <Button
                                size="sm"
                                onClick={() => updateOnboardingStatus(onboarding.id, 'CONTACTED')}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 text-xs"
                              >
                                Mark Contacted
                              </Button>
                            )}
                            {onboarding.status === 'CONTACTED' && (
                              <Button
                                size="sm"
                                onClick={() => updateOnboardingStatus(onboarding.id, 'CONVERTED')}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-xs"
                              >
                                Mark Converted
                              </Button>
                            )}
                            {(onboarding.status === 'CONTACTED' || onboarding.status === 'CONVERTED') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateOnboardingStatus(onboarding.id, 'REJECTED')}
                                className="border-red-300 text-red-600 hover:bg-red-50 px-3 py-1 text-xs"
                              >
                                Reject
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                        {onboardingLoading ? 'Loading onboarding data...' : 'No onboarding requests found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* View Institution Modal */}
        {showViewModal && selectedInstitution && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
              <div className="sticky top-0 bg-gradient-to-r from-purple-100 to-indigo-100 px-8 py-6 border-b-2 border-purple-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-purple-900">Institution Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-purple-200 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-purple-900" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Institution Name</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{selectedInstitution.name}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Location</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{selectedInstitution.location}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Email</p>
                    <p className="text-lg font-bold text-gray-900 mt-1 break-all">{selectedInstitution.email}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Plan</p>
                    <p className="text-lg font-bold text-purple-700 mt-1">{selectedInstitution.plan}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                    <p className="text-xs text-blue-600 font-semibold">Total Students</p>
                    <p className="text-2xl font-bold text-blue-900 mt-2">{selectedInstitution.students}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                    <p className="text-xs text-green-600 font-semibold">Templates Assigned</p>
                    <p className="text-2xl font-bold text-green-900 mt-2">{selectedInstitution.templatesAssigned}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                    <p className="text-xs text-purple-600 font-semibold">Total Predictions</p>
                    <p className="text-2xl font-bold text-purple-900 mt-2">{selectedInstitution.predictions}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Joined Date</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">{new Date(selectedInstitution.joinedDate).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Status</p>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        selectedInstitution.status === "active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {selectedInstitution.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setShowViewModal(false)}
                    className="bg-transparent border-gray-300"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setShowViewModal(false)
                      setShowAssignModal(true)
                    }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Templates
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assign Templates Modal */}
        {showAssignModal && selectedInstitution && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-gradient-to-r from-purple-100 to-indigo-100 px-8 py-6 border-b-2 border-purple-200 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-purple-900">Assign Templates</h2>
                  <p className="text-sm text-purple-700 mt-1">{selectedInstitution.name}</p>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-2 hover:bg-purple-200 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-purple-900" />
                </button>
              </div>

              <div className="p-8">
                <div className="space-y-3 mb-6">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => {
                        setSelectedTemplates(prev =>
                          prev.includes(template.id)
                            ? prev.filter(id => id !== template.id)
                            : [...prev, template.id]
                        )
                      }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedTemplates.includes(template.id)
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedTemplates.includes(template.id)
                              ? "border-purple-500 bg-purple-500"
                              : "border-gray-300"
                          }`}>
                            {selectedTemplates.includes(template.id) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">{template.name}</p>
                            <p className="text-sm text-gray-600">Exam Code: {template.examCode}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 font-semibold">Predictions</p>
                          <p className="text-lg font-bold text-purple-700">{template.predictions}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Selected:</strong> {selectedTemplates.length} template{selectedTemplates.length !== 1 ? 's' : ''} will be assigned to this institution.
                  </p>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowAssignModal(false)}
                    className="bg-transparent border-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssignTemplates}
                    disabled={selectedTemplates.length === 0}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Assign Selected Templates
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Institution Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-gradient-to-r from-purple-100 to-indigo-100 px-8 py-6 border-b-2 border-purple-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-purple-900">Add New Institution</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-purple-200 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-purple-900" />
                </button>
              </div>

              <div className="p-8">
                {!generatedCredentials ? (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Institution Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., Delhi Career Academy"
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="admin@institution.com"
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Location *
                        </label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="e.g., New Delhi"
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Subscription Plan
                        </label>
                        <select
                          value={formData.plan}
                          onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="Standard">Standard</option>
                          <option value="Premium">Premium</option>
                          <option value="Enterprise">Enterprise</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Contact Person
                        </label>
                        <input
                          type="text"
                          value={formData.contactPerson}
                          onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                          placeholder="Name"
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddModal(false)}
                        className="bg-transparent border-gray-300"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddInstitution}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                      >
                        Generate Credentials
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-semibold">Credentials Generated Successfully!</p>
                      <p className="text-sm text-green-700 mt-1">Copy and send these credentials to the institution.</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Login Email
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="email"
                            readOnly
                            value={generatedCredentials.email}
                            className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50 font-mono"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(generatedCredentials.email, "email")}
                            className="bg-transparent border-purple-300"
                          >
                            {copiedField === "email" ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={generatedCredentials.password}
                            className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-gray-50 font-mono"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(generatedCredentials.password, "password")}
                            className="bg-transparent border-purple-300"
                          >
                            {copiedField === "password" ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                      <p className="text-sm text-amber-800">
                        <strong>Important:</strong> Share these credentials securely with the institution administrator. They will use the Login Email and Password to log in.
                      </p>
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddModal(false)
                          setFormData({ name: "", email: "", location: "", plan: "Standard", contactPerson: "", phone: "" })
                          setGeneratedCredentials(null)
                        }}
                        className="bg-transparent border-gray-300"
                      >
                        Close
                      </Button>
                      <Button
                        onClick={handleSendCredentials}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        Send Credentials & Confirm
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}