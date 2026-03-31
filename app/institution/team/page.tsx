'use client'

import InstitutionNavigation from "@/components/institution-navigation"
import { Button } from "@/components/ui/button"
import { Search, Plus, Edit2, Trash2, X, Check, Mail, UserCheck, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"

interface InstitutionUser {
  id: number
  name: string
  email: string
  role: "coordinator" | "faculty" | "member"
  status: "active" | "inactive"
  joinedDate: string
  department?: string
  adminId?: string
}

const INSTITUTION_PERMISSIONS = {
  coordinator: ["manage_student_links", "view_predictions", "export_data", "manage_team"],
  faculty: ["view_predictions", "view_student_performance"],
  member: [],
}

export default function InstitutionTeamPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<"all" | "coordinator" | "faculty" | "member">("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Use body scroll lock when any modal is open
  useBodyScrollLock(showAddModal || showEditModal)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "member" as "coordinator" | "faculty" | "member",
    department: "",
    phone: "",
    adminId: "", // Required field for admin login
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    loadTeamMembers()
  }, [user])

  const loadTeamMembers = async () => {
    let institutionId = user?.institution?.id || user?.institutionId
    
    console.log('🔍 Team Page - Using institutionId:', institutionId)
    
    if (!institutionId) {
      console.log('❌ No institution ID found in user context')
      setError('No institution ID found')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/team-members?institutionId=${institutionId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch team members: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('🔍 Team Page - Fetched team members:', data)
      
      setUsers(data)
    } catch (error) {
      console.error('❌ Failed to load team members:', error)
      setError(error instanceof Error ? error.message : 'Failed to load team members')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    return matchesSearch && matchesRole
  })

  console.log('📊 Current team members:', users.length)
  console.log('📊 Filtered team members:', filteredUsers.length)

  const handleAddUser = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.adminId) {
      alert("Please fill all required fields")
      return
    }

    let institutionId = user?.institution?.id || user?.institutionId
    
    if (!institutionId) {
      alert('No institution ID found. Please log in again.')
      return
    }

    try {
      const response = await fetch(`/api/team-members?institutionId=${institutionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role.toUpperCase(),
          department: formData.department,
          phone: formData.phone,
          adminId: formData.adminId,
          password: formData.password,
          institutionId: institutionId
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add user')
      }

      await loadTeamMembers()
      setFormData({ name: "", email: "", role: "member", department: "", phone: "", adminId: "", password: "", confirmPassword: "" })
      setShowAddModal(false)
      alert(`Admin ${formData.name} added! ID: ${formData.adminId}. Invitation sent to ${formData.email}`)
    } catch (error) {
      console.error('❌ Failed to add user:', error)
      alert(error instanceof Error ? error.message : 'Failed to add user')
    }
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase() as "coordinator" | "faculty" | "member",
      department: user.department || "",
      phone: user.phone || "",
      adminId: user.adminId || "",
      password: "",
      confirmPassword: "",
    })
    setShowEditModal(true)
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch('/api/team-members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedUser.id,
          role: formData.role.toUpperCase(),
          department: formData.department,
          phone: formData.phone
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update user')
      }

      await loadTeamMembers()
      setShowEditModal(false)
      setSelectedUser(null)
      setFormData({ name: "", email: "", role: "member", department: "", phone: "", adminId: "", password: "", confirmPassword: "" })
      alert("User updated successfully!")
    } catch (error) {
      console.error('❌ Failed to update user:', error)
      alert(error instanceof Error ? error.message : 'Failed to update user')
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (confirm("Are you sure you want to remove this user?")) {
      try {
        const response = await fetch(`/api/team-members?id=${id}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to delete user')
        }

        await loadTeamMembers()
        alert("User removed successfully!")
      } catch (error) {
        console.error('❌ Failed to delete user:', error)
        alert(error instanceof Error ? error.message : 'Failed to delete user')
      }
    }
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'INACTIVE' : 'ACTIVE'
      
      const response = await fetch('/api/team-members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id,
          status: newStatus
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update status')
      }

      await loadTeamMembers()
    } catch (error) {
      console.error('❌ Failed to update status:', error)
      alert(error instanceof Error ? error.message : 'Failed to update status')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "coordinator":
        return "bg-red-100 text-red-800"
      case "faculty":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <InstitutionNavigation />

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Management</h1>
          <p className="text-muted-foreground">Manage team members for your institution portal and student predictions</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="text-lg text-muted-foreground">Loading team members...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center mb-8">
            <p className="text-red-800 font-medium mb-2">Failed to load team members</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <Button onClick={loadTeamMembers} className="bg-red-600 hover:bg-red-700">
              Try Again
            </Button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-emerald-200 shadow-sm">
            <p className="text-xs text-gray-500 font-semibold uppercase">Total Members</p>
            <p className="text-3xl font-bold text-emerald-900 mt-2">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
            <p className="text-xs text-gray-500 font-semibold uppercase">Active</p>
            <p className="text-3xl font-bold text-green-900 mt-2">{users.filter(u => u.status === "active").length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-red-200 shadow-sm">
            <p className="text-xs text-gray-500 font-semibold uppercase">Coordinators</p>
            <p className="text-3xl font-bold text-red-900 mt-2">{users.filter(u => u.role === "coordinator").length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
            <p className="text-xs text-gray-500 font-semibold uppercase">Faculty</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">{users.filter(u => u.role === "faculty").length}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg p-6 border border-emerald-200/50 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium"
              >
                <option value="all">All Roles</option>
                <option value="coordinator">Coordinator</option>
                <option value="faculty">Faculty</option>
                <option value="student">Student</option>
              </select>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-emerald-200/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-emerald-900 uppercase">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-emerald-900 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-emerald-900 uppercase">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-emerald-900 uppercase">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-emerald-900 uppercase">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-emerald-900 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-emerald-900 uppercase">Joined</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-emerald-900 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.department || "-"}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-mono rounded-full">
                        {user.adminId || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(user.id, user.status)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        }`}
                      >
                        {user.status.toUpperCase()}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.joinedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(user)}
                          className="bg-transparent border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(user.id)}
                          className="bg-transparent border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              <div className="bg-gradient-to-r from-emerald-100 to-teal-100 px-6 py-4 border-b-2 border-emerald-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-emerald-900">Add Team Member</h2>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-emerald-200 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="member">Member</option>
                    <option value="faculty">Faculty Member</option>
                    <option value="coordinator">Coordinator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department (Optional)</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g., Law, Commerce"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ID *</label>
                  <input
                    type="text"
                    value={formData.adminId}
                    onChange={(e) => setFormData({ ...formData, adminId: e.target.value })}
                    placeholder="e.g., IId001"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {formData.role !== 'member' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <p className="text-xs text-emerald-800 font-semibold flex items-center gap-2">
                      <UserCheck className="w-3 h-3" />
                      {formData.role} permissions
                    </p>
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1 bg-transparent border-gray-300">
                    Cancel
                  </Button>
                  <Button onClick={handleAddUser} className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600">
                    <Mail className="w-4 h-4 mr-2" />
                    Invite
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 px-6 py-4 border-b-2 border-blue-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-blue-900">Edit Member</h2>
                <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-blue-200 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="member">Member</option>
                    <option value="faculty">Faculty Member</option>
                    <option value="coordinator">Coordinator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1 bg-transparent border-gray-300">
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateUser} className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600">
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  )
}
