"use client"

import { useState, useEffect } from "react"
import { 
  Settings, Building2, Mail, Phone, Globe, Save, Edit2, X,
  Bell, Shield, CreditCard, Users, MapPin, RefreshCw, Eye, EyeOff, Lock, Key
} from "lucide-react"
import { Button } from "@/components/ui/button"
import InstitutionNavigation from "@/components/institution-navigation"
import { useAuth, User } from "@/lib/auth-context"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"

export default function InstitutionSettingsPage() {
  const { user, setUser } = useAuth()
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [editedData, setEditedData] = useState({
    name: "",
    email: "",
    location: "",
    phone: "",
    contactPerson: ""
  })
  
  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  
  // Use body scroll lock when modal is open
  useBodyScrollLock(showPasswordModal)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")

  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: true,
    dailySummary: true,
    weeklyReport: false,
    templateAlerts: true
  })
  const [notificationLoading, setNotificationLoading] = useState(false)
  const [notificationSaved, setNotificationSaved] = useState(false)

  const refreshInstitutionData = async () => {
    if (!user?.institution?.id) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/institutions/${user.institution.id}`)
      if (response.ok) {
        const institutionData = await response.json()
        
        // Update user context
        const updatedUser = {
          ...user,
          institution: {
            ...user.institution,
            ...institutionData
          }
        }
        localStorage.setItem("user", JSON.stringify(updatedUser))
        
        // Force component re-render
        window.location.reload()
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('🔍 Settings useEffect - User data:', user)
    console.log('🔍 Settings useEffect - User institution:', user?.institution)
    console.log('🔍 Settings useEffect - User institutionId:', user?.institutionId)
    
    if (user?.institution) {
      console.log('🔍 Settings useEffect - Institution found, setting data...')
      setEditedData({
        name: user.institution.name || "",
        email: user.institution.email || "",
        location: user.institution.location || "",
        phone: user.institution.phone || "",
        contactPerson: user.name || ""
      })
      setDataLoading(false)
    } else {
      console.log('🔍 Settings useEffect - No institution data, fetching...')
      if (user?.institutionId) {
        console.log('🔍 Settings useEffect - Fetching institution data for ID:', user.institutionId)
        fetchInstitutionData(user.institutionId)
      } else {
        console.log('🔍 Settings useEffect - No institutionId available')
        setDataLoading(false)
      }
    }
  }, [user])

  const handleRefreshData = async () => {
    
    // Clear localStorage
    localStorage.removeItem("user")
    
    // Re-fetch institution data if we have the ID
    if (user?.institutionId) {
      await fetchInstitutionData(user.institutionId)
    } else {
      window.location.reload() // Fallback to full reload
    }
  }

  const fetchInstitutionData = async (institutionId: string) => {
    console.log('🔍 fetchInstitutionData - Fetching data for ID:', institutionId)
    try {
      const response = await fetch(`/api/institutions/${institutionId}`)
      console.log('🔍 fetchInstitutionData - Response status:', response.status)
      
      if (response.ok) {
        const institutionData = await response.json()
        console.log('🔍 fetchInstitutionData - Received data:', institutionData)
        
        // Verify the institution data matches the requested ID
        if (institutionData.id !== institutionId) {
          console.error('❌ MISMATCH: API returned different institution ID!')
          setDataLoading(false)
          return
        }
        
        // Update user context with correct institution data
        if (!user) {
          console.error('❌ No user data available')
          setDataLoading(false)
          return
        }
        
        const updatedUser: User = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          institutionId: user.institutionId,
          institution: {
            id: institutionData.id,
            name: institutionData.name,
            email: institutionData.email,
            location: institutionData.location,
            phone: institutionData.phone,
            plan: institutionData.plan,
            status: institutionData.status,
            institutionId: institutionData.id // Ensure this matches
          }
        }
        
        console.log('🔍 fetchInstitutionData - Updated user object:', updatedUser)
        
        // Update both user context and localStorage
        if (typeof setUser === 'function') {
          setUser(updatedUser)
        }
        localStorage.setItem("user", JSON.stringify(updatedUser))
        
        // Set the form data with the correct institution
        setEditedData({
          name: institutionData.name || "",
          email: institutionData.email || "",
          location: institutionData.location || "",
          phone: institutionData.phone || "",
          contactPerson: user?.name || ""
        })
        
        console.log('🔍 fetchInstitutionData - Set editedData:', {
          name: institutionData.name,
          email: institutionData.email,
          location: institutionData.location,
          phone: institutionData.phone,
          contactPerson: user?.name
        })
        
        setDataLoading(false)
        
      } else {
        const errorText = await response.text()
        console.error('🔍 fetchInstitutionData - Error response:', errorText)
        setDataLoading(false)
      }
    } catch (error) {
      console.error('🔍 fetchInstitutionData - Error fetching institution data:', error)
      setDataLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/institutions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user?.institution?.id,
          ...editedData
        })
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const handlePasswordChange = async () => {
    setPasswordError("")
    setPasswordSuccess("")
    
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("All fields are required")
      return
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long")
      return
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError("New password must be different from current password")
      return
    }
    
    setPasswordLoading(true)
    
    try {
      const response = await fetch('/api/auth/institution/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionId: user?.institution?.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setPasswordSuccess("Password changed successfully!")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
        setTimeout(() => {
          setShowPasswordModal(false)
          setPasswordSuccess("")
        }, 2000)
      } else {
        setPasswordError(data.error || "Failed to change password")
      }
    } catch (error) {
      setPasswordError("Network error. Please try again.")
    } finally {
      setPasswordLoading(false)
    }
  }

  // Notification preference functions
  const handleNotificationToggle = (preference: keyof typeof notificationPreferences) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference]
    }))
    setNotificationSaved(false)
  }

  const saveNotificationPreferences = async () => {
    if (!user?.institution?.id) return
    
    setNotificationLoading(true)
    try {
      const response = await fetch(`/api/institutions/${user.institution.id}/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationPreferences)
      })
      
      if (response.ok) {
        setNotificationSaved(true)
        setTimeout(() => setNotificationSaved(false), 3000)
      } else {
        console.error('Failed to save notification preferences')
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error)
    } finally {
      setNotificationLoading(false)
    }
  }

  const loadNotificationPreferences = async () => {
    if (!user?.institution?.id) return
    
    try {
      const response = await fetch(`/api/institutions/${user.institution.id}/notifications`)
      if (response.ok) {
        const preferences = await response.json()
        setNotificationPreferences(preferences)
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error)
    }
  }

  // Load notification preferences on component mount
  useEffect(() => {
    if (user?.institution?.id) {
      loadNotificationPreferences()
    }
  }, [user])

  const tabs = [
    { id: "general", label: "General", icon: Building2 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing", icon: CreditCard },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50">
      <InstitutionNavigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-muted-foreground">
                Manage your institution profile and preferences.
              </p>
            </div>
            <Button
              onClick={handleRefreshData}
              variant="outline"
              size="sm"
              className="border-emerald-300 hover:bg-emerald-50 text-emerald-700"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Profile
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-emerald-100 rounded-xl p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-emerald-100 text-emerald-900"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === "general" && (
              <div className="bg-white border-2 border-emerald-200 rounded-2xl overflow-hidden shadow-lg">
                {dataLoading ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-emerald-600">Loading institution data...</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-gradient-to-r from-emerald-100 to-teal-100 px-6 py-4 border-b border-emerald-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-bold text-emerald-900">Institution Profile</h2>
                          <p className="text-sm text-emerald-700">Update your institution information</p>
                        </div>
                        {!isEditing ? (
                          <Button
                            onClick={() => setIsEditing(true)}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              onClick={handleSave}
                              className={`transition-all ${
                                saved 
                                  ? "bg-green-600 hover:bg-green-600" 
                                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                              }`}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {saved ? "Saved!" : "Save Changes"}
                            </Button>
                            <Button
                              onClick={() => setIsEditing(false)}
                              variant="outline"
                              className="border-emerald-300 hover:bg-emerald-50 text-emerald-700"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Institution Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Institution Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedData.name}
                            onChange={(e) => setEditedData({...editedData, name: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl">
                            <p className="font-medium text-gray-900">{dataLoading ? "Loading..." : (editedData.name || "Not provided")}</p>
                          </div>
                        )}
                      </div>

                      {/* Contact Email */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Email</label>
                        {isEditing ? (
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="email"
                              value={editedData.email}
                              onChange={(e) => setEditedData({...editedData, email: e.target.value})}
                              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>
                        ) : (
                          <div className="relative px-4 py-3 bg-gray-50 rounded-xl">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <p className="font-medium text-gray-900 pl-8">{dataLoading ? "Loading..." : (editedData.email || "Not provided")}</p>
                          </div>
                        )}
                      </div>

                      {/* Location */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                        {isEditing ? (
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              value={editedData.location}
                              onChange={(e) => setEditedData({...editedData, location: e.target.value})}
                              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>
                        ) : (
                          <div className="relative px-4 py-3 bg-gray-50 rounded-xl">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <p className="font-medium text-gray-900 pl-8">{dataLoading ? "Loading..." : (editedData.location || "Not provided")}</p>
                          </div>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                        {isEditing ? (
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="tel"
                              value={editedData.phone}
                              onChange={(e) => setEditedData({...editedData, phone: e.target.value})}
                              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>
                        ) : (
                          <div className="relative px-4 py-3 bg-gray-50 rounded-xl">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <p className="font-medium text-gray-900 pl-8">{dataLoading ? "Loading..." : (editedData.phone || "Not provided")}</p>
                          </div>
                        )}
                      </div>

                      {/* Contact Person */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Person</label>
                        {isEditing ? (
                          <div className="relative">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              value={editedData.contactPerson}
                              onChange={(e) => setEditedData({...editedData, contactPerson: e.target.value})}
                              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>
                        ) : (
                          <div className="relative px-4 py-3 bg-gray-50 rounded-xl">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <p className="font-medium text-gray-900 pl-8">{dataLoading ? "Loading..." : (editedData.contactPerson || "Not provided")}</p>
                          </div>
                        )}
                      </div>

                      {/* Plan */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Plan</label>
                        <div className="px-4 py-3 bg-gray-50 rounded-xl">
                          <p className="font-medium text-gray-900 capitalize">{dataLoading ? "Loading..." : (user?.institution?.plan || "Not provided")}</p>
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                        <div className="px-4 py-3 bg-gray-50 rounded-xl">
                          <p className="font-medium text-gray-900 capitalize">{dataLoading ? "Loading..." : (user?.institution?.status?.toLowerCase() || "Not provided")}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-white border-2 border-emerald-200 rounded-2xl overflow-hidden shadow-lg">
                <div className="bg-gradient-to-r from-emerald-100 to-teal-100 px-6 py-4 border-b border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-emerald-900">Notification Preferences</h2>
                      <p className="text-sm text-emerald-700">Control how you receive updates</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {notificationSaved && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Saved!
                        </span>
                      )}
                      <Button
                        onClick={saveNotificationPreferences}
                        disabled={notificationLoading}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {notificationLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {notificationLoading ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {[
                    { 
                      key: "emailNotifications",
                      label: "Email notifications for new predictions", 
                      description: "Get notified when students make new predictions",
                      enabled: notificationPreferences.emailNotifications 
                    },
                    { 
                      key: "dailySummary",
                      label: "Daily prediction summary", 
                      description: "Receive a daily summary of all predictions made",
                      enabled: notificationPreferences.dailySummary 
                    },
                    { 
                      key: "weeklyReport",
                      label: "Weekly analytics report", 
                      description: "Get comprehensive weekly analytics and insights",
                      enabled: notificationPreferences.weeklyReport 
                    },
                    { 
                      key: "templateAlerts",
                      label: "Template usage alerts", 
                      description: "Notifications about template performance and usage",
                      enabled: notificationPreferences.templateAlerts 
                    }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{setting.label}</div>
                        <div className="text-sm text-gray-600 mt-1">{setting.description}</div>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle(setting.key as keyof typeof notificationPreferences)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          setting.enabled ? "bg-emerald-500" : "bg-gray-300"
                        }`}
                        aria-label={`Toggle ${setting.label}`}
                      >
                        <div className={`absolute inset-0 rounded-full transition-colors ${
                          setting.enabled ? "bg-emerald-500" : "bg-gray-300"
                        }`}>
                          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white transition-transform ${
                            setting.enabled ? "translate-x-6" : "translate-x-0"
                          }`} />
                        </div>
                      </button>
                    </div>
                  ))}
                  
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Notification Settings</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Your notification preferences are saved automatically. Changes will take effect immediately for new predictions and reports.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-white border-2 border-emerald-200 rounded-2xl overflow-hidden shadow-lg">
                <div className="bg-gradient-to-r from-emerald-100 to-teal-100 px-6 py-4 border-b border-emerald-200">
                  <h2 className="text-lg font-bold text-emerald-900">Security Settings</h2>
                  <p className="text-sm text-emerald-700">Manage your account security</p>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h3 className="font-medium text-gray-900">Change Password</h3>
                      <p className="text-sm text-gray-600">Update your account password</p>
                    </div>
                    <Button 
                      onClick={() => setShowPasswordModal(true)}
                      variant="outline" 
                      className="border-emerald-300 hover:bg-emerald-50 text-emerald-700"
                    >
                      Change Password
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "billing" && (
              <div className="bg-white border-2 border-emerald-200 rounded-2xl overflow-hidden shadow-lg">
                <div className="bg-gradient-to-r from-emerald-100 to-teal-100 px-6 py-4 border-b border-emerald-200">
                  <h2 className="text-lg font-bold text-emerald-900">Billing Information</h2>
                  <p className="text-sm text-emerald-700">Manage your subscription plan</p>
                </div>

                <div className="p-6 space-y-6">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <h3 className="font-bold text-emerald-900 mb-2">Current Plan</h3>
                    <p className="text-2xl font-bold text-emerald-900 capitalize">{user?.institution?.plan || "Standard"}</p>
                    <p className="text-sm text-emerald-600 mt-1">
                      {user?.institution?.plan === "premium" ? "Premium features included" : "Basic features only"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h3 className="font-medium text-gray-900">Upgrade Plan</h3>
                      <p className="text-sm text-gray-600">Get access to premium features</p>
                    </div>
                    <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                      Upgrade to Premium
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h3 className="font-medium text-gray-900">Billing History</h3>
                      <p className="text-sm text-gray-600">View past invoices and payments</p>
                    </div>
                    <Button variant="outline" className="border-emerald-300 hover:bg-emerald-50 text-emerald-700">
                      View History
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-emerald-100 to-teal-100 px-6 py-4 border-b border-emerald-200 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-emerald-700" />
                  <h2 className="text-lg font-bold text-emerald-900">Change Password</h2>
                </div>
                <Button
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswordError("")
                    setPasswordSuccess("")
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: ""
                    })
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Success Message */}
              {passwordSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm font-medium">{passwordSuccess}</p>
                </div>
              )}

              {/* Error Message */}
              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">{passwordError}</p>
                </div>
              )}

              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter current password"
                    disabled={passwordLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter new password (min. 8 characters)"
                    disabled={passwordLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Confirm new password"
                    disabled={passwordLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm font-medium mb-2">Password Requirements:</p>
                <ul className="text-blue-600 text-xs space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Different from current password</li>
                  <li>• Both new passwords must match</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswordError("")
                    setPasswordSuccess("")
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: ""
                    })
                  }}
                  variant="outline"
                  className="flex-1 border-gray-300 hover:bg-gray-50 text-gray-700"
                  disabled={passwordLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePasswordChange}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Changing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Change Password
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
