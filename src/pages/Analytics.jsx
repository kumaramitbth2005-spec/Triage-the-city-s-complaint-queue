import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell,
  AreaChart, Area, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import {
  TrendingUp, TrendingDown, Award, Zap, Target, Brain,
  Clock, CheckCircle2, Users, AlertTriangle, Download
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

const MOCK_CATEGORY_DATA = [
  { name: 'Water Supply', value: 31, color: '#3b82f6' },
  { name: 'Sanitation', value: 24, color: '#10b981' },
  { name: 'Roads', value: 18, color: '#f59e0b' },
  { name: 'Lighting', value: 14, color: '#8b5cf6' },
  { name: 'Other', value: 13, color: '#64748b' },
];

const MOCK_WEEKLY_TREND = [
  { day: 'Mon', complaints: 89, resolved: 72, aiAccuracy: 94 },
  { day: 'Tue', complaints: 112, resolved: 98, aiAccuracy: 96 },
  { day: 'Wed', complaints: 78, resolved: 65, aiAccuracy: 93 },
  { day: 'Thu', complaints: 134, resolved: 110, aiAccuracy: 97 },
  { day: 'Fri', complaints: 156, resolved: 128, aiAccuracy: 95 },
  { day: 'Sat', complaints: 190, resolved: 145, aiAccuracy: 98 },
  { day: 'Sun', complaints: 120, resolved: 99, aiAccuracy: 96 },
];

const MOCK_RESOLUTION_TIME = [
  { dept: 'Electrical', hours: 8 },
  { dept: 'Sanitation', hours: 14 },
  { dept: 'Water', hours: 18 },
  { dept: 'Roads', hours: 32 },
  { dept: 'Parks', hours: 48 },
];

const MOCK_CHANNEL_DATA = [
  { name: 'App', value: 45 },
  { name: 'WhatsApp', value: 28 },
  { name: 'Website', value: 17 },
  { name: 'Phone', value: 10 },
];

const MOCK_RADAR = [
  { subject: 'Water', A: 87 },
  { subject: 'Sanitation', A: 72 },
  { subject: 'Roads', A: 58 },
  { subject: 'Lighting', A: 91 },
  { subject: 'Parks', A: 65 },
  { subject: 'Waste', A: 80 },
];

const MOCK_HOURLY = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  count: Math.round(Math.sin((i - 6) * 0.4) * 30 + 40 + Math.random() * 15),
}));

export function Analytics() {
  const { complaints } = useAppContext();
  const [dateRange, setDateRange] = useState('7d');

  const totalComplaints = complaints.length || 879;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved' || c.status === 'Confirmed').length || 664;
  const resolutionRate = Math.round((resolvedCount / Math.max(totalComplaints, 1)) * 100);
  const highPriority = complaints.filter(c => c.urgency === 'HIGH' || c.urgency === 'CRITICAL').length || 134;
  const avgConfidence = complaints.length
    ? Math.round(complaints.reduce((s, c) => s + (c.confidence || 90), 0) / complaints.length)
    : 95;

  const KPIs = [
    {
      label: 'Total Complaints',
      value: totalComplaints,
      trend: '+12%',
      up: true,
      icon: Users,
      color: 'blue',
      sub: 'vs last week',
    },
    {
      label: 'Resolution Rate',
      value: `${resolutionRate}%`,
      trend: '+4.2%',
      up: true,
      icon: CheckCircle2,
      color: 'emerald',
      sub: 'complaints resolved',
    },
    {
      label: 'High Priority',
      value: highPriority,
      trend: '-8%',
      up: false,
      icon: AlertTriangle,
      color: 'amber',
      sub: 'critical + high urgency',
    },
    {
      label: 'AI Accuracy',
      value: `${avgConfidence}%`,
      trend: '+1.5%',
      up: true,
      icon: Brain,
      color: 'violet',
      sub: 'avg confidence score',
    },
  ];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Status', 'Department', 'Category', 'Urgency', 'Ward', 'Date'];
    const rows = complaints.map(c => [
      c.id, c.status, c.department, c.category, c.urgency, c.ward,
      new Date(c.timestamp || c.createdAt).toLocaleDateString()
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaints_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Analytics & Insights</h2>
          <p className="text-sm text-slate-500 mt-0.5">Deep dive into complaint trends and performance metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            {['7d', '30d', '90d'].map(r => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  dateRange === r ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-gray-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <Button onClick={handleExportCSV} className="text-xs sm:text-sm h-9">
            <Download size={14} className="mr-1.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPIs.map((kpi, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[kpi.color]}`}>
                  <kpi.icon size={20} />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full ${
                  kpi.up ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'
                }`}>
                  {kpi.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {kpi.trend}
                </span>
              </div>
              <div className="text-3xl font-black text-slate-800">{kpi.value}</div>
              <div className="text-sm font-medium text-slate-500 mt-1">{kpi.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{kpi.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Trend — Area Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Weekly Complaint & Resolution Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_WEEKLY_TREND} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Area type="monotone" dataKey="complaints" name="Received" stroke="#3b82f6" strokeWidth={2} fill="url(#colorComplaints)" dot={{ r: 3 }} />
                  <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2} fill="url(#colorResolved)" dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution — Pie */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Complaint Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_CATEGORY_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {MOCK_CATEGORY_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5">
              {MOCK_CATEGORY_DATA.map((cat, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
                    <span className="text-slate-600">{cat.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{cat.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Resolution Time by Dept */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock size={16} className="text-amber-500" /> Avg Resolution Time
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_RESOLUTION_TIME} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} unit="h" />
                  <YAxis dataKey="dept" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={65} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: 12 }} formatter={(v) => [`${v} hours`]} />
                  <Bar dataKey="hours" radius={[0, 6, 6, 0]} barSize={14}>
                    {MOCK_RESOLUTION_TIME.map((entry, i) => (
                      <Cell key={i} fill={entry.hours <= 12 ? '#10b981' : entry.hours <= 24 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Channel Distribution */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap size={16} className="text-blue-500" /> Submission Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_CHANNEL_DATA}
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`}
                    labelLine={false}
                  >
                    {MOCK_CHANNEL_DATA.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: 12 }} formatter={(v) => [`${v}%`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Dept Performance Radar */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target size={16} className="text-violet-500" /> Resolution Score
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={MOCK_RADAR}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Radar name="Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Distribution */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock size={16} className="text-slate-500" /> Complaint Volume by Hour of Day
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_HOURLY} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 9 }}
                  interval={3}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: 12 }} />
                <Bar dataKey="count" name="Complaints" radius={[4, 4, 0, 0]} barSize={10}>
                  {MOCK_HOURLY.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.count > 60 ? '#ef4444' : entry.count > 45 ? '#f97316' : '#3b82f6'}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* AI Performance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'AI Routing Accuracy', value: '96.2%', desc: 'Correctly routed without operator override', icon: Brain, color: 'violet' },
          { label: 'Avg Response Time', value: '1.8s', desc: 'AI triage completion time', icon: Zap, color: 'blue' },
          { label: 'Duplicate Detection', value: '89.4%', desc: 'True positive duplicate detection rate', icon: Award, color: 'emerald' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorMap[stat.color]}`}>
                <stat.icon size={22} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800">{stat.value}</div>
                <div className="text-sm font-medium text-slate-600">{stat.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{stat.desc}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
