import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge, UrgencyBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, ZoomIn, ZoomOut, Layers, Filter, AlertTriangle,
  ThumbsUp, TrendingUp, Info
} from 'lucide-react';

// Ward grid layout for Bhopal (simplified map)
const WARDS_MAP = [
  { id: '1', label: 'W1', locality: 'Bairagarh', x: 20, y: 20 },
  { id: '2', label: 'W2', locality: 'Awadhpuri', x: 60, y: 20 },
  { id: '3', label: 'W3', locality: 'Kohefiza', x: 100, y: 20 },
  { id: '4', label: 'W4', locality: 'Shyamla Hills', x: 140, y: 20 },
  { id: '5', label: 'W5', locality: 'Idgah Hills', x: 180, y: 30 },
  { id: '6', label: 'W6', locality: 'TT Nagar', x: 220, y: 25 },
  { id: '10', label: 'W10', locality: 'Bhanpur', x: 30, y: 70 },
  { id: '11', label: 'W11', locality: 'Misrod', x: 70, y: 65 },
  { id: '12', label: 'W12', locality: 'Khajuri Kalan', x: 110, y: 70 },
  { id: '15', label: 'W15', locality: 'Govindpura', x: 150, y: 65 },
  { id: '16', label: 'W16', locality: 'Saket Nagar', x: 190, y: 70 },
  { id: '20', label: 'W20', locality: 'Trilanga', x: 40, y: 120 },
  { id: '21', label: 'W21', locality: 'New Market', x: 80, y: 115 },
  { id: '22', label: 'W22', locality: 'MP Nagar', x: 120, y: 120 },
  { id: '23', label: 'W23', locality: 'Piplani', x: 160, y: 115 },
  { id: '24', label: 'W24', locality: 'Kolar', x: 200, y: 120 },
  { id: '30', label: 'W30', locality: 'Habibganj', x: 50, y: 170 },
  { id: '31', label: 'W31', locality: 'Hoshangabad Rd', x: 90, y: 165 },
  { id: '40', label: 'W40', locality: 'Arera Colony', x: 130, y: 170 },
  { id: '42', label: 'W42', locality: 'Arera Hills', x: 170, y: 165 },
  { id: '50', label: 'W50', locality: 'Bag Sewania', x: 60, y: 215 },
  { id: '55', label: 'W55', locality: 'MP Nagar Z2', x: 110, y: 215 },
  { id: '60', label: 'W60', locality: 'Gulmohar', x: 160, y: 210 },
  { id: '70', label: 'W70', locality: 'Berasia Rd', x: 85, y: 265 },
  { id: '75', label: 'W75', locality: 'Lalghati', x: 140, y: 265 },
];

const CATEGORY_COLORS = {
  'Water': '#3b82f6',
  'Sanitation': '#10b981',
  'Roads': '#f59e0b',
  'Lighting': '#8b5cf6',
  'Other': '#64748b',
};

function getWardComplaintCount(wardId, complaints) {
  return complaints.filter(c =>
    String(c.ward) === String(wardId)
  ).length;
}

function getHeatColor(count, max) {
  if (count === 0) return '#e2e8f0';
  const ratio = count / Math.max(max, 1);
  if (ratio > 0.7) return '#ef4444';
  if (ratio > 0.4) return '#f97316';
  if (ratio > 0.2) return '#fbbf24';
  return '#86efac';
}

function getWardUrgency(wardId, complaints) {
  const wardComplaints = complaints.filter(c => String(c.ward) === String(wardId));
  if (wardComplaints.some(c => c.urgency === 'CRITICAL')) return 'CRITICAL';
  if (wardComplaints.some(c => c.urgency === 'HIGH')) return 'HIGH';
  if (wardComplaints.length > 0) return 'MEDIUM';
  return null;
}

export function MapView() {
  const { complaints } = useAppContext();
  const navigate = useNavigate();
  const [selectedWard, setSelectedWard] = useState(null);
  const [viewMode, setViewMode] = useState('heatmap'); // 'heatmap' | 'category' | 'urgency'
  const [filterUrgency, setFilterUrgency] = useState('all');

  const filteredComplaints = useMemo(() => {
    if (filterUrgency === 'all') return complaints;
    return complaints.filter(c => c.urgency === filterUrgency);
  }, [complaints, filterUrgency]);

  const maxCount = useMemo(() => {
    return Math.max(...WARDS_MAP.map(w => getWardComplaintCount(w.id, filteredComplaints)), 1);
  }, [filteredComplaints]);

  const selectedWardComplaints = selectedWard
    ? filteredComplaints.filter(c => String(c.ward) === String(selectedWard.id))
    : [];

  const topWards = [...WARDS_MAP]
    .map(w => ({ ...w, count: getWardComplaintCount(w.id, filteredComplaints) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Complaint Map</h2>
          <p className="text-sm text-slate-500 mt-0.5">Ward-level complaint distribution across the city.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {['heatmap', 'urgency'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-2 text-xs font-medium capitalize transition-colors ${
                  viewMode === mode ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-gray-50'
                }`}
              >
                {mode === 'heatmap' ? '🔥 Heatmap' : '⚠️ Urgency'}
              </button>
            ))}
          </div>
          <select
            value={filterUrgency}
            onChange={e => setFilterUrgency(e.target.value)}
            className="h-9 px-3 border border-gray-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
          >
            <option value="all">All Urgencies</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Map Canvas */}
        <div className="xl:col-span-3">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative bg-gradient-to-br from-slate-50 to-blue-50/30 min-h-[400px] sm:min-h-[500px] overflow-hidden">
                {/* Grid lines */}
                <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Ward bubbles */}
                <svg className="w-full h-full absolute inset-0" style={{ minHeight: '400px' }} viewBox="0 0 300 310" preserveAspectRatio="xMidYMid meet">
                  {WARDS_MAP.map(ward => {
                    const count = getWardComplaintCount(ward.id, filteredComplaints);
                    const urgency = getWardUrgency(ward.id, filteredComplaints);
                    const isSelected = selectedWard?.id === ward.id;
                    const r = Math.max(14, Math.min(26, 14 + (count / Math.max(maxCount, 1)) * 12));
                    let fillColor = '#e2e8f0';

                    if (viewMode === 'heatmap') {
                      fillColor = getHeatColor(count, maxCount);
                    } else {
                      fillColor = urgency === 'CRITICAL' ? '#ef4444' :
                                  urgency === 'HIGH' ? '#f97316' :
                                  urgency === 'MEDIUM' ? '#fbbf24' :
                                  '#e2e8f0';
                    }

                    return (
                      <g key={ward.id} onClick={() => setSelectedWard(isSelected ? null : ward)} style={{ cursor: 'pointer' }}>
                        <circle
                          cx={ward.x}
                          cy={ward.y}
                          r={r}
                          fill={fillColor}
                          fillOpacity={0.85}
                          stroke={isSelected ? '#1e40af' : count > 0 ? '#fff' : '#cbd5e1'}
                          strokeWidth={isSelected ? 2.5 : 1.5}
                          className="transition-all duration-200 hover:opacity-100"
                          style={{ filter: isSelected ? 'drop-shadow(0 0 6px rgba(30,64,175,0.4))' : 'none' }}
                        />
                        <text
                          x={ward.x}
                          y={ward.y + 1}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={count > 0 ? 7 : 6}
                          fontWeight={count > 0 ? '700' : '500'}
                          fill={count > 5 ? '#fff' : '#334155'}
                        >
                          {count > 0 ? count : ward.label}
                        </text>
                        {count > 0 && (
                          <text
                            x={ward.x}
                            y={ward.y + r + 6}
                            textAnchor="middle"
                            fontSize={5}
                            fill="#64748b"
                          >
                            {ward.label}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Legend */}
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-gray-100 text-xs">
                  <p className="font-semibold text-slate-600 mb-1.5">
                    {viewMode === 'heatmap' ? 'Complaint Volume' : 'Urgency Level'}
                  </p>
                  {viewMode === 'heatmap' ? (
                    <div className="flex items-center gap-2">
                      {[
                        { color: '#86efac', label: 'Low' },
                        { color: '#fbbf24', label: 'Mid' },
                        { color: '#f97316', label: 'High' },
                        { color: '#ef4444', label: 'Critical' },
                      ].map(l => (
                        <div key={l.label} className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
                          <span className="text-slate-500">{l.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {[
                        { color: '#ef4444', label: 'Critical' },
                        { color: '#f97316', label: 'High' },
                        { color: '#fbbf24', label: 'Medium' },
                      ].map(l => (
                        <div key={l.label} className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
                          <span className="text-slate-500">{l.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info hint */}
                <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-slate-500 flex items-center gap-1.5 border border-gray-100 shadow-sm">
                  <Info size={12} /> Click a ward to explore
                </div>

                {/* Total count */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm border border-gray-100">
                  <p className="text-xs text-slate-400">Total Complaints</p>
                  <p className="text-2xl font-black text-slate-800">{filteredComplaints.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Selected ward panel */}
          {selectedWard ? (
            <Card className="border-blue-200">
              <CardHeader className="p-4 bg-blue-50/60 pb-3">
                <CardTitle className="text-sm text-blue-900 flex items-center gap-2">
                  <MapPin size={14} className="text-blue-500" /> Ward {selectedWard.id} — {selectedWard.locality}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="text-center py-2">
                  <div className="text-3xl font-black text-slate-800">{selectedWardComplaints.length}</div>
                  <div className="text-xs text-slate-400 mt-0.5">complaints</div>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedWardComplaints.slice(0, 8).map(c => (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/dashboard/complaints/${c.id}`)}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-xs"
                    >
                      <UrgencyBadge level={c.urgency} />
                      <span className="text-slate-700 truncate flex-1">{c.category}</span>
                    </button>
                  ))}
                  {selectedWardComplaints.length > 8 && (
                    <p className="text-xs text-center text-slate-400 pt-1">+{selectedWardComplaints.length - 8} more</p>
                  )}
                </div>
                {selectedWardComplaints.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-4 text-slate-400">
                    <ThumbsUp size={24} />
                    <p className="text-xs">No complaints in this ward</p>
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setSelectedWard(null)}>
                  Clear Selection
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4 flex flex-col items-center gap-2 text-center py-8">
                <MapPin size={28} className="text-slate-300" />
                <p className="text-sm text-slate-500">Select a ward on the map to see details</p>
              </CardContent>
            </Card>
          )}

          {/* Top complaint hotspots */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp size={14} className="text-red-500" /> Top Hotspots
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              {topWards.filter(w => w.count > 0).map((ward, i) => (
                <button
                  key={ward.id}
                  onClick={() => setSelectedWard(ward)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    i === 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{ward.locality}</p>
                    <p className="text-xs text-slate-400">Ward {ward.id}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-700 shrink-0">{ward.count}</span>
                </button>
              ))}
              {topWards.filter(w => w.count > 0).length === 0 && (
                <p className="text-sm text-center text-slate-400 py-4">No data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
