import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Users, UserPlus, Search, Shield, Edit2, Trash2,
  MoreVertical, CheckCircle, XCircle, Clock, Mail,
  Lock, Eye, User, Crown
} from 'lucide-react';

const ROLES = {
  admin: { label: 'Admin', icon: Crown, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  operator: { label: 'Operator', icon: Shield, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  viewer: { label: 'Viewer', icon: Eye, color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

const INITIAL_USERS = [
  { id: 1, name: 'Priya Sharma', email: 'priya.s@bhopal.gov.in', role: 'admin', active: true, lastLogin: '2 min ago', dept: 'All Departments', avatar: 'PS' },
  { id: 2, name: 'Rahul Verma', email: 'rahul.v@bhopal.gov.in', role: 'operator', active: true, lastLogin: '1 hour ago', dept: 'Water Supply', avatar: 'RV' },
  { id: 3, name: 'Anjali Mehra', email: 'anjali.m@bhopal.gov.in', role: 'operator', active: true, lastLogin: '3 hours ago', dept: 'Sanitation', avatar: 'AM' },
  { id: 4, name: 'Deepak Joshi', email: 'deepak.j@bhopal.gov.in', role: 'operator', active: false, lastLogin: '2 days ago', dept: 'Roads', avatar: 'DJ' },
  { id: 5, name: 'Sunita Yadav', email: 'sunita.y@bhopal.gov.in', role: 'viewer', active: true, lastLogin: '5 hours ago', dept: 'All Departments', avatar: 'SY' },
  { id: 6, name: 'Vikram Singh', email: 'vikram.s@bhopal.gov.in', role: 'viewer', active: true, lastLogin: 'Yesterday', dept: 'Electrical', avatar: 'VS' },
];

function UserModal({ user, onSave, onClose }) {
  const [form, setForm] = useState(user || { name: '', email: '', role: 'operator', dept: 'All Departments', active: true });
  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-slate-800">{user ? 'Edit User' : 'Invite User'}</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
            <input value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="e.g. Priya Sharma"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address</label>
            <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="user@bhopal.gov.in"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Role</label>
            <select value={form.role} onChange={e => handleChange('role', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100">
              <option value="admin">Admin — Full access</option>
              <option value="operator">Operator — Can triage & update</option>
              <option value="viewer">Viewer — Read only</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Department</label>
            <select value={form.dept} onChange={e => handleChange('dept', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100">
              <option>All Departments</option>
              <option>Water Supply</option>
              <option>Sanitation</option>
              <option>Roads</option>
              <option>Electrical</option>
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => handleChange('active', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300" />
            <span className="text-sm font-medium text-slate-700">Account Active</span>
          </label>
        </div>
        <div className="p-6 pt-0 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)}>{user ? 'Save Changes' : 'Send Invite'}</Button>
        </div>
      </div>
    </div>
  );
}

export function UserManagement() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [menuId, setMenuId] = useState(null);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const handleSave = (form) => {
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...form, avatar: form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() } : u));
    } else {
      const newUser = { ...form, id: Date.now(), lastLogin: 'Never', avatar: form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() };
      setUsers(prev => [...prev, newUser]);
    }
    setShowModal(false);
    setEditingUser(null);
  };

  const toggleActive = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));
    setMenuId(null);
  };

  const deleteUser = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setDeleteId(null);
  };

  const AVATAR_COLORS = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];

  return (
    <div className="space-y-5 max-w-5xl mx-auto w-full">
      {showModal && (
        <UserModal
          user={editingUser}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingUser(null); }}
        />
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-slate-800 mb-2">Remove User?</h3>
            <p className="text-sm text-slate-600 mb-4">This will permanently remove their access to the system.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => deleteUser(deleteId)}>Remove</Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage operator access, roles, and permissions.</p>
        </div>
        <Button onClick={() => { setEditingUser(null); setShowModal(true); }}>
          <UserPlus size={16} className="mr-2" /> Invite User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active Now', value: users.filter(u => u.active).length, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Inactive', value: users.filter(u => !u.active).length, icon: XCircle, color: 'text-red-500 bg-red-50' },
        ].map((k, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${k.color}`}>
                <k.icon size={18} />
              </div>
              <div>
                <div className="text-xl font-black text-slate-800">{k.value}</div>
                <div className="text-xs text-slate-500">{k.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-10 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'admin', 'operator', 'viewer'].map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                filterRole === role ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-slate-600 hover:bg-gray-50'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Login</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((user, idx) => {
                const RoleInfo = ROLES[user.role];
                return (
                  <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                          {user.avatar}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{user.name}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <Mail size={10} /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-lg border text-xs font-medium ${RoleInfo.color}`}>
                        <RoleInfo.icon size={11} /> {RoleInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 text-sm">{user.dept}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock size={11} /> {user.lastLogin}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditingUser(user); setShowModal(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => toggleActive(user.id)}
                          className={`p-1.5 rounded-lg transition-colors ${user.active ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                          {user.active ? <Lock size={14} /> : <CheckCircle size={14} />}
                        </button>
                        <button onClick={() => setDeleteId(user.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">No users match your search.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
