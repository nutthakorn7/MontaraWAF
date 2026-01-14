'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Breadcrumb from '@/components/Breadcrumb';
import { Modal, Button, Input, StatCard, Select, DataTable, Column, Badge } from '@/components/ui';
import { 
  UserPlus, 
  Edit2, 
  Trash2, 
  Shield,
  Clock,
  Search,
  Save,
  User
} from 'lucide-react';

interface UserAccount {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'reader' | 'editor';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
}

const initialUsers: UserAccount[] = [
  { id: 1, name: 'John Admin', email: 'john@company.com', role: 'admin', status: 'active', lastLogin: '2 hours ago', createdAt: 'Jan 1, 2024' },
  { id: 2, name: 'Sarah Editor', email: 'sarah@company.com', role: 'editor', status: 'active', lastLogin: '1 day ago', createdAt: 'Feb 15, 2024' },
  { id: 3, name: 'Mike Reader', email: 'mike@company.com', role: 'reader', status: 'active', lastLogin: '5 hours ago', createdAt: 'Mar 20, 2024' },
  { id: 4, name: 'Lisa Security', email: 'lisa@company.com', role: 'admin', status: 'active', lastLogin: '30 min ago', createdAt: 'Jan 5, 2024' },
  { id: 5, name: 'Tom Analyst', email: 'tom@company.com', role: 'reader', status: 'pending', lastLogin: 'Never', createdAt: 'Dec 1, 2024' },
];

export default function UsersPage() {
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'reader' as UserAccount['role'] });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    const newId = Math.max(...users.map(u => u.id)) + 1;
    setUsers([...users, {
      ...newUser,
      id: newId,
      status: 'pending',
      lastLogin: 'Never',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }]);
    setShowAddModal(false);
    setNewUser({ name: '', email: '', role: 'reader' });
  };

  const handleDelete = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <AppLayout activeMenu="users">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Account' },
          { label: 'Users & Roles' }
        ]}
        actions={
          <Button 
            variant="primary"
            onClick={() => setShowAddModal(true)}
            icon={<UserPlus className="w-4 h-4" />}
          >
            Add User
          </Button>
        }
      />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard 
              title="Total Users" 
              value={users.length} 
              icon={<User className="w-5 h-5" />} 
              color="blue" 
            />
            <StatCard 
              title="Admins" 
              value={users.filter(u => u.role === 'admin').length} 
              icon={<Shield className="w-5 h-5" />} 
              color="red" 
            />
            <StatCard 
              title="Editors" 
              value={users.filter(u => u.role === 'editor').length} 
              icon={<Edit2 className="w-5 h-5" />} 
              color="purple" 
            />
            <StatCard 
              title="Pending" 
              value={users.filter(u => u.status === 'pending').length} 
              icon={<Clock className="w-5 h-5" />} 
              color="yellow" 
            />
          </div>

          {/* Users Table */}
          <div className="table-container">
            <div className="table-header flex items-center justify-between">
              <h3 className="table-title">User Management</h3>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="form-input pl-9 w-64"
                />
              </div>
            </div>
            <DataTable<UserAccount>
              keyField="id"
              data={filteredUsers}
              columns={[
                {
                  key: 'name',
                  header: 'User',
                  render: (user) => (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'role',
                  header: 'Role',
                  render: (user) => (
                    <Badge 
                      variant={user.role === 'admin' ? 'error' : user.role === 'editor' ? 'purple' : 'default'}
                      size="sm"
                    >
                      {user.role}
                    </Badge>
                  )
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (user) => (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                      user.status === 'active' ? 'text-green-600 dark:text-green-400' :
                      user.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        user.status === 'active' ? 'bg-green-500' :
                        user.status === 'pending' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`} />
                      {user.status}
                    </span>
                  )
                },
                { key: 'lastLogin', header: 'Last Login' },
                { key: 'createdAt', header: 'Created' },
                {
                  key: 'actions',
                  header: 'Actions',
                  align: 'right' as const,
                  render: (user) => (
                    <div className="flex justify-end gap-2">
                      <button className="text-gray-400 hover:text-blue-500">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                }
              ]}
            />
          </div>
        </main>

      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        title="Add New User"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            placeholder="John Doe"
          />
          <Input
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            placeholder="john@company.com"
          />
          <Select
            label="Role"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserAccount['role'] })}
            options={[
              { value: 'reader', label: 'Reader' },
              { value: 'editor', label: 'Editor' },
              { value: 'admin', label: 'Admin' },
            ]}
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button 
            variant="primary" 
            onClick={handleAddUser}
            icon={<Save className="w-4 h-4" />}
          >
            Add User
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
