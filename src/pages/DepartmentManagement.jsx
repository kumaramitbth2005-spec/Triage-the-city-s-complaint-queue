import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Building2, Plus, Edit2, Trash2, ChevronRight, Clock, CheckCircle2,
  AlertTriangle, Users, TrendingUp, BarChart2, Shield
} from 'lucide-react';

const INITIAL_DEPARTMENTS = [
  {
    id: 1, name: 'Water Supply', code: 'WATER', head: 'Rajesh Kumar', staff: 24,
    sla: 24, email: 'water@bhopal.gov.in', phone: '+91-755-1234567',
    stats: { received: 324, resolved: 276, avgTime: 18, slaBreaches: 8 },
    color: '#3b82f6', active: true,
  },
  {
    id: 2, name: 'Sanitation', code: 'SANIT', head: 'Meera Sharma', staff: 38,
    sla: 12, email: 'sanitation@bhopal.gov.in', phone: '+91-755-2345678',
    stats: { received: 418, resolved: 361, avgTime: 14, slaBreaches: 12 },
    color: '#10b981', active: true,
  },
  {
    id: 3, name: 'Roads & Infrastructure', code: 'ROADS', head: 'Dinesh Verma', staff: 15,
    sla: 72, email: 'roads@bhopal.gov.in', phone: '+91-755-3456789',
    stats: { received: 186, resolved: 142, avgTime: 31, slaBreaches: 22 },
    color: '#f59e0b', active: true,
  },
  {
    id: 4, name: 'Electrical', code: 'ELECT', head: 'Priya Singh', staff: 21,
    sla: 8, email: 'electrical@bhopal.gov.in', phone: '+91-755-4567890',
    stats: { received: 156, resolved: 139, avgTime: 12, slaBreaches: 3 },
    color: '#8b5cf6', active: true,
  },
  {
    id: 5, name: 'Parks & Gardens', code: 'PARKS', head: 'Anita Joshi', staff: 12,
    sla: 120, email: 'parks@bhopal.gov.in', phone: '+91-755-5678901',
    stats: { received: 67, resolved: 51, avgTime: 48, slaBreaches: 6 },
    color: '#06b6d4', active: false,
  },
];

function DepartmentModal({ dept, onSave, onClose }) {
  const [form, setForm] = useState(dept || {
    name: '', code: '', head: '', staff: '', sla: 24,
    email: '', phone: '', active: true, color: '#3b82f6',
  });

  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-slate-800">{dept ? 'Edit Department' : 'Add Department'}</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Department Name</label>
              <input
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="e.g. Water Supply"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Code</label>
              <input
                value={form.code}
                onChange={e => handleChange('code', e.target.value.toUpperCase())}
                placeholder="e.g. WATER"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Department Head</label>
              <input
                value={form.head}
                onChange={e => handleChange('head', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Staff Count</label>
              <input
                type="number"
                value={form.staff}
                onChange={e => handleChange('staff', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">SLA Target (hours)</label>
              <input
                type="number"
                value={form.sla}
                onChange={e => handleChange('sla', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Color</label>
              <input
                type="color"
                value={form.color}
                onChange={e => handleChange('color', e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={e => handleChange('active', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-slate-700">Active (receives complaints)</span>
          </label>
        </div>
        <div className="p-6 pt-0 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)}>Save Department</Button>
        </div>
      </div>
    </div>
  );
}

export function DepartmentManagement() {
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const handleSave = (form) => {
    if (editingDept) {
      setDepartments(prev => prev.map(d => d.id === editingDept.id ? { ...editingDept, ...form } : d));
    } else {
      setDepartments(prev => [...prev, { ...form, id: Date.now(), stats: { received: 0, resolved: 0, avgTime: 0, slaBreaches: 0 } }]);
    }
    setShowModal(false);
    setEditingDept(null);
  };

  const handleDelete = (id) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
    setDeleteId(null);
  };

  const totalResolutionRate = departments.length
    ? Math.round(departments.reduce((s, d) => s + (d.stats.resolved / Math.max(d.stats.received, 1)) * 100, 0) / departments.length)
    : 0;

  return (
    <div className="space-y-5 max-w-7xl mx-auto w-full">
      {showModal && (
        <DepartmentModal
          dept={editingDept}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingDept(null); }}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-slate-800 mb-2">Delete Department?</h3>
            <p className="text-sm text-slate-600 mb-4">This will remove the department and all associated routing rules.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => handleDelete(deleteId)}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Department Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage departments, SLA targets, and routing configuration.</p>
        </div>
        <Button onClick={() => { setEditingDept(null); setShowModal(true); }}>
          <Plus size={16} className="mr-2" /> Add Department
        </Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Departments', value: departments.length, icon: Building2, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active Depts', value: departments.filter(d => d.active).length, icon: Shield, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Total Staff', value: departments.reduce((s, d) => s + (parseInt(d.staff) || 0), 0), icon: Users, color: 'text-violet-600 bg-violet-50' },
          { label: 'Avg Resolution', value: `${totalResolutionRate}%`, icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
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

      {/* Departments grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {departments.map(dept => {
          const resRate = Math.round((dept.stats.resolved / Math.max(dept.stats.received, 1)) * 100);
          const slaGood = dept.stats.avgTime <= dept.sla;

          return (
            <Card key={dept.id} className={`${!dept.active ? 'opacity-60' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ background: dept.color }}
                    >
                      {dept.code?.slice(0, 3) || dept.name?.slice(0, 3)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{dept.name}</h3>
                      <p className="text-sm text-slate-500">{dept.head} · {dept.staff} staff</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant={dept.active ? 'default' : 'outline'} className="text-[10px]">
                      {dept.active ? 'Active' : 'Inactive'}
                    </Badge>
                    <button
                      onClick={() => { setEditingDept(dept); setShowModal(true); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(dept.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Received', value: dept.stats.received },
                    { label: 'Resolved', value: dept.stats.resolved },
                    { label: 'Avg Time', value: `${dept.stats.avgTime}h` },
                    { label: 'Breaches', value: dept.stats.slaBreaches },
                  ].map((s, i) => (
                    <div key={i} className="text-center bg-gray-50 rounded-lg py-2">
                      <div className="text-base font-bold text-slate-800">{s.value}</div>
                      <div className="text-[10px] text-slate-400">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Resolution bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Resolution Rate</span>
                    <span className="font-semibold text-slate-700">{resRate}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${resRate}%`,
                        background: resRate >= 80 ? '#10b981' : resRate >= 60 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                </div>

                {/* SLA badge */}
                <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg w-fit ${
                  slaGood ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                  {slaGood ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                  SLA: {dept.sla}h target · Avg {dept.stats.avgTime}h {slaGood ? '✓' : '(over)'}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
