"use client"

import AdminNavigation from "@/components/admin-navigation"
import { Button } from "@/components/ui/button"
import { Search, Users, Plus, Eye, UserPlus, Shield, Settings, Trash2, Edit, Copy, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  lastLoginAt?: string
}

export default function UserManagementPage() {
  const { user: currentUser } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN"
  })
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    email: string
    password: string
    role: string
  } | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users/create')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (response.ok) {
        setGeneratedCredentials({
          email: formData.email,
          password: formData.password,
          role: formData.role.toLowerCase().replace('_', '-')
        })
        setShowAddModal(false)
        setFormData({ name: "", email: "", password: "", role: "ADMIN" })
        await loadUsers()
      } else {
        alert(data.error || 'Failed to create user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Failed to create user')
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super-admin': return 'bg-purple-100 text-purple-800'
      case 'admin': return 'bg-blue-100 text-blue-800'
      case 'analyst': return 'bg-green-100 text-green-800'
      case 'manager': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Only allow super admin to access this page
  if (currentUser?.role !== 'super-admin') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-indigo-50">
        <AdminNavigation />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <Shield className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">Only Super Admin can access user management.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-indigo-50">
      <AdminNavigation />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Create and manage admin, analyst, and manager accounts</p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="super-admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="analyst">Analyst</option>
              <option value="manager">Manager</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role.replace('-', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button className="text-purple-600 hover:text-purple-900">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          {user.role !== 'super-admin' && (
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Create New User</h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="ANALYST">Analyst</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    Create User
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success Modal with Credentials */}
        {generatedCredentials && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold mb-2">User Created Successfully!</h2>
                <p className="text-gray-600">Share these login credentials with the user:</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{generatedCredentials.email}</span>
                      <button
                        onClick={() => copyToClipboard(generatedCredentials.email, 'email')}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        {copiedField === 'email' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Password:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{generatedCredentials.password}</span>
                      <button
                        onClick={() => copyToClipboard(generatedCredentials.password, 'password')}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        {copiedField === 'password' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Role:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(generatedCredentials.role)}`}>
                      {generatedCredentials.role.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Login URL:</strong> <span className="font-mono">/auth/super-admin/login</span>
                </p>
              </div>
              
              <Button
                onClick={() => setGeneratedCredentials(null)}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
