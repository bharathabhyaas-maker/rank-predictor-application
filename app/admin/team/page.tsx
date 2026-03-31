'use client'


import AdminNavigation from '@/components/admin-navigation'
import { Button } from '@/components/ui/button'
import { Search, Plus, Edit2, Trash2, Shield, Lock, X, Check, Mail } from 'lucide-react'
import { useState, useEffect } from 'react'

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  department?: string
  phone?: string
  status: string
  joinedDate: string
  institution: {
    id: string
    name: string
    institutionId: string
  }
  createdAt: string
}


export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'manager' | 'analyst'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<TeamMember | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [institutions, setInstitutions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'MEMBER',
    password: '',
    confirmPassword: '',
    department: '',
    phone: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const teamResponse = await fetch('/api/team-members')
      if (teamResponse.ok) {
        const teamData = await teamResponse.json()
        setTeamMembers(teamData)
      }

      const institutionsResponse = await fetch('/api/institutions')
      if (institutionsResponse.ok) {
        const institutionsData = await institutionsResponse.json()
        setInstitutions(institutionsData)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = teamMembers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role.toLowerCase() === filterRole
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleAddUser = async () => {
    // Validate all required fields including password
    if (!formData.name || !formData.email || !formData.role || !formData.password) {
      alert('Please fill all required fields including password')
      return
    }

    // Validate password confirmation
    if (!formData.confirmPassword) {
      alert('Please confirm password')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }

    try {
      const response = await fetch('/api/team-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newUser = await response.json()
        setTeamMembers([...teamMembers, newUser])
        setFormData({ name: '', email: '', role: 'MEMBER', password: '', confirmPassword: '', department: '', phone: '' })
        setShowAddModal(false)
        
        let successMessage = 'Team member added successfully!'
        if (newUser.userAccountId) {
          successMessage += ' User account created with login credentials.'
        }
        alert(successMessage)
      } else {
        const errorData = await response.json()
        alert('Failed to add team member: ' + errorData.error)
      }
    } catch (error) {
      console.error('Failed to add team member:', error)
      alert('Failed to add team member. Please try again.')
    }
  }

  const handleEditUser = (user: TeamMember) => {
    setSelectedUser(user)
    setFormData({ 
      name: user.name, 
      email: user.email, 
      role: user.role,
      password: '',
      confirmPassword: '',
      department: user.department || '',
      phone: user.phone || '',
    })
    setShowEditModal(true)
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    console.log('🔧 Starting team member update...')
    console.log('🔧 Selected user:', selectedUser)
    console.log('🔧 Form data:', formData)

    try {
      // Test PATCH endpoint first
      console.log('🧪 Testing PATCH endpoint...')
      const testResponse = await fetch('/api/test-team-patch', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'patch-test' })
      })
      
      console.log('🧪 Test PATCH response status:', testResponse.status)
      if (testResponse.ok) {
        const testData = await testResponse.json()
        console.log('🧪 Test PATCH response:', testData)
      } else {
        console.error('🧪 Test PATCH failed')
      }

      const requestBody = {
        id: selectedUser.id,
        ...formData
      }
      console.log('🔧 Request body:', requestBody)

      const response = await fetch('/api/team-members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      console.log('🔧 Response status:', response.status)
      console.log('🔧 Response headers:', response.headers.get('content-type'))

      if (response.ok) {
        const updatedUser = await response.json()
        console.log('🔧 Updated user response:', updatedUser)
        
        setTeamMembers(teamMembers.map(u => 
          u.id === selectedUser.id ? updatedUser : u
        ))
        setShowEditModal(false)
        setSelectedUser(null)
        setFormData({ name: '', email: '', role: 'MEMBER', password: '', confirmPassword: '', department: '', phone: '' })
        alert('Team member updated successfully!')
      } else {
        const errorData = await response.json()
        console.error('🔧 Update failed:', errorData)
        alert('Failed to update team member: ' + errorData.error)
      }
    } catch (error) {
      console.error('🔧 Failed to update team member:', error)
      alert('Failed to update team member. Please try again.')
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to delete this team member?')) {
      try {
        const response = await fetch('/api/team-members?id=' + id, {
          method: 'DELETE'
        })

        if (response.ok) {
          setTeamMembers(teamMembers.filter(u => u.id !== id))
          alert('Team member deleted successfully!')
        } else {
          const errorData = await response.json()
          alert('Failed to delete team member: ' + errorData.error)
        }
      } catch (error) {
        console.error('Failed to delete team member:', error)
        alert('Failed to delete team member. Please try again.')
      }
    }
  }

  const toggleStatus = async (id: string) => {
    const user = teamMembers.find(u => u.id === id)
    if (!user) return

    const newStatus = user.status === 'active' ? 'INACTIVE' : 'ACTIVE'
    
    try {
      const response = await fetch('/api/team-members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id,
          status: newStatus
        })
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setTeamMembers(teamMembers.map(u => 
          u.id === id ? updatedUser : u
        ))
      } else {
        const errorData = await response.json()
        alert('Failed to update status: ' + errorData.error)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update status. Please try again.')
    }
  }

  
  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50'>
      <AdminNavigation />

      <div className='container mx-auto px-6 py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>User Management</h1>
          <p className='text-muted-foreground'>Manage team members and assign roles with specific permissions</p>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
          <div className='bg-white rounded-lg p-4 border-purple-200 shadow-sm'>
            <p className='text-xs text-gray-500 font-semibold uppercase'>Total Users</p>
            <p className='text-3xl font-bold text-purple-900 mt-2'>{teamMembers.length}</p>
          </div>
          <div className='bg-white rounded-lg p-4 border-green-200 shadow-sm'>
            <p className='text-xs text-gray-500 font-semibold uppercase'>Active</p>
            <p className='text-3xl font-bold text-green-900 mt-2'>{teamMembers.filter(u => u.status === 'active').length}</p>
          </div>
          <div className='bg-white rounded-lg p-4 border-blue-200 shadow-sm'>
            <p className='text-xs text-gray-500 font-semibold uppercase'>Admins</p>
            <p className='text-3xl font-bold text-blue-900 mt-2'>{teamMembers.filter(u => u.role.toLowerCase() === 'admin').length}</p>
          </div>
          <div className='bg-white rounded-lg p-4 border-amber-200 shadow-sm'>
            <p className='text-xs text-gray-500 font-semibold uppercase'>Managers</p>
            <p className='text-3xl font-bold text-amber-900 mt-2'>{teamMembers.filter(u => u.role.toLowerCase() === 'manager').length}</p>
          </div>
        </div>

        {/* Controls */}
        <div className='bg-white rounded-lg p-6 border-purple-200/50 mb-6 shadow-sm'>
          <div className='flex flex-col md:flex-row gap-4 items-center justify-between'>
            <div className='flex-1 flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200'>
              <Search className='w-4 h-4 text-gray-400' />
              <input
                type='text'
                placeholder='Search by name or email...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='flex-1 bg-transparent outline-none text-sm'
              />
            </div>
            <div className='flex gap-3 w-full md:w-auto'>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className='px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium'
              >
                <option value='all'>All Roles</option>
                <option value='admin'>Admin</option>
                <option value='manager'>Manager</option>
                <option value='analyst'>Analyst</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className='px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium'
              >
                <option value='all'>All Status</option>
                <option value='active'>Active</option>
                <option value='inactive'>Inactive</option>
              </select>
              <Button
                onClick={() => setShowAddModal(true)}
                className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
              >
                <Plus className='w-4 h-4 mr-2' />
                Add User
              </Button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className='bg-white rounded-lg p-12 text-center'>
            <p className='text-gray-500'>Loading team members...</p>
          </div>
        ) : (
          <div className='bg-white rounded-lg border-purple-200/50 shadow-sm overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200'>
                  <tr>
                    <th className='px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase'>Name</th>
                    <th className='px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase'>Email</th>
                    <th className='px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase'>Role</th>
                    <th className='px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase'>Status</th>
                    <th className='px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase'>Joined</th>
                    <th className='px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className='border-b border-gray-200 hover:bg-gray-50/50 transition-colors'>
                        <td className='px-6 py-4'>
                          <p className='font-semibold text-gray-900'>{user.name}</p>
                        </td>
                        <td className='px-6 py-4 text-sm text-gray-600'>{user.email}</td>
                        <td className='px-6 py-4'>
                          <span className={'px-3 py-1 rounded-full text-xs font-bold ' + (
                            user.role.toLowerCase() === 'admin'
                              ? 'bg-red-100 text-red-800'
                              : user.role.toLowerCase() === 'manager'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          )}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td className='px-6 py-4'>
                          <button
                            onClick={() => toggleStatus(user.id)}
                            className={'px-3 py-1 rounded-full text-xs font-bold transition-colors ' + (
                              user.status === 'active'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            )}
                          >
                            {user.status.toUpperCase()}
                          </button>
                        </td>
                        <td className='px-6 py-4 text-sm text-gray-600'>
                          {new Date(user.joinedDate).toLocaleDateString()}
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-2'>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => handleEditUser(user)}
                              className='bg-transparent border-blue-300 text-blue-700 hover:bg-blue-50'
                            >
                              <Edit2 className='w-4 h-4 mr-1' />
                              Edit
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => handleDeleteUser(user.id)}
                              className='bg-transparent border-red-300 text-red-700 hover:bg-red-50'
                            >
                              <Trash2 className='w-4 h-4 mr-1' />
                              Remove
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className='px-6 py-12 text-center text-muted-foreground'>
                        No team members found matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddModal && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto'>
            <div className='bg-white rounded-2xl max-w-md w-full shadow-2xl my-8 max-h-[90vh] overflow-y-auto'>
              <div className='bg-gradient-to-r from-purple-100 to-indigo-100 px-6 py-4 border-b-2 border-purple-200 flex items-center justify-between'>
                <h2 className='text-xl font-bold text-purple-900'>Add Team Member</h2>
                <button onClick={() => setShowAddModal(false)} className='p-1 hover:bg-purple-200 rounded'>
                  <X className='w-5 h-5' />
                </button>
              </div>
              <div className='p-6 space-y-4'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Full Name</label>
                  <input
                    type='text'
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder='Enter full name'
                    className='w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Email</label>
                  <input
                    type='email'
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder='Enter email address'
                    className='w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className='w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                  >
                    <option value='MEMBER'>Analyst (View Only)</option>
                    <option value='ADMIN'>Admin (Full Access)</option>
                    <option value='MANAGER'>Manager (Create & Manage)</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Password</label>
                  <input
                    type='password'
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder='Enter password (min 6 characters)'
                    className='w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Confirm Password</label>
                  <input
                    type='password'
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder='Confirm password'
                    className='w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                  />
                </div>
                                <div className='flex gap-3 pt-4'>
                  <Button variant='outline' onClick={() => setShowAddModal(false)} className='flex-1 bg-transparent border-gray-300'>
                    Cancel
                  </Button>
                  <Button onClick={handleAddUser} className='flex-1 bg-gradient-to-r from-purple-600 to-indigo-600'>
                    <Mail className='w-4 h-4 mr-2' />
                    Add Member
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto'>
            <div className='bg-white rounded-2xl max-w-md w-full shadow-2xl my-8 max-h-[90vh] overflow-y-auto'>
              <div className='bg-gradient-to-r from-blue-100 to-indigo-100 px-6 py-4 border-b-2 border-blue-200 flex items-center justify-between'>
                <h2 className='text-xl font-bold text-blue-900'>Edit Team Member</h2>
                <button onClick={() => setShowEditModal(false)} className='p-1 hover:bg-blue-200 rounded'>
                  <X className='w-5 h-5' />
                </button>
              </div>
              
              <div className='p-6 space-y-4'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Name</label>
                  <input
                    type='text'
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Email</label>
                  <input
                    type='email'
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    <option value='MEMBER'>Member</option>
                    <option value='ADMIN'>Admin</option>
                    <option value='MANAGER'>Manager</option>
                    <option value='ANALYST'>Analyst</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Department (Optional)</label>
                  <input
                    type='text'
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-2'>Phone (Optional)</label>
                  <input
                    type='tel'
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                <div className='flex gap-3 pt-4'>
                  <Button variant='outline' onClick={() => setShowEditModal(false)} className='flex-1 bg-transparent border-gray-300'>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateUser} className='flex-1 bg-gradient-to-r from-blue-600 to-indigo-600'>
                    Update Member
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
