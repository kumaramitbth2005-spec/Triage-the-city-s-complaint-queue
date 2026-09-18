import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Download, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { reportApi } from '../api/reportApi';

export function Reports() {
  const [dateRange] = useState('Sep 08 - Sep 14, 2026');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const FALLBACK = {
    deptPerformance: [
      { dept: 'Water Supply', received: 324, resolved: 276, time: '18h', repeat: 24 },
      { dept: 'Sanitation', received: 418, resolved: 361, time: '14h', repeat: 37 },
      { dept: 'Roads', received: 186, resolved: 142, time: '31h', repeat: 19 },
      { dept: 'Electrical', received: 156, resolved: 139, time: '12h', repeat: 11 },
    ],
    trendData: [
      { name: 'Mon', count: 120 }, { name: 'Tue', count: 132 }, { name: 'Wed', count: 101 },
      { name: 'Thu', count: 143 }, { name: 'Fri', count: 190 }, { name: 'Sat', count: 210 }, { name: 'Sun', count: 180 },
    ],
    hotspots: [
      { ward: '42', locality: 'Arera Colony', count: 37 },
      { ward: '55', locality: 'MP Nagar', count: 24 },
      { ward: '31', locality: 'Kolar', count: 19 }
    ]
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await reportApi.getWeekly();
        const d = res.data?.data;
        if (d) setReportData(d);
        else setReportData(FALLBACK);
      } catch {
        setReportData(FALLBACK);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleExportCSV = () => {
    const deptPerformance = reportData?.deptPerformance || FALLBACK.deptPerformance;
    const headers = ['Department', 'Received', 'Resolved', 'Median Time', 'Repeat Complaints'];
    const rows = deptPerformance.map(d => [d.dept, d.received, d.resolved, d.time, d.repeat]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `department_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deptPerformance = reportData?.deptPerformance || FALLBACK.deptPerformance;
  const trendData = reportData?.trendData || FALLBACK.trendData;
  const hotspots = reportData?.hotspots || FALLBACK.hotspots;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Weekly Department Digest</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Performance overview and complaint trends.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button variant="outline" className="bg-white text-xs sm:text-sm h-9 sm:h-10 justify-center">
            <CalendarIcon size={14} className="mr-1.5 shrink-0 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="truncate">{dateRange}</span>
          </Button>
          <Button onClick={handleExportCSV} className="text-xs sm:text-sm h-9 sm:h-10 justify-center">
            <Download size={14} className="mr-1.5 shrink-0 sm:w-4 sm:h-4 sm:mr-2" />
            Export Digest
          </Button>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Resolution Trend Chart */}
        <Card className="min-w-0">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Resolution Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="h-56 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dx={-5} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}} />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} dot={{r: 3, strokeWidth: 2}} activeDot={{r: 5}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Repeat Complaint Hotspots */}
        <Card className="min-w-0">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Repeat Complaint Hotspots</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs sm:text-sm shrink-0">1</div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-800 text-sm sm:text-base truncate">Ward 42</div>
                    <div className="text-[10px] sm:text-xs text-slate-500 truncate">Arera Colony area</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
                  <span className="font-bold text-slate-800 text-sm sm:text-base">37</span>
                  <TrendingUp size={14} className="text-red-500 sm:w-4 sm:h-4" />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs sm:text-sm shrink-0">2</div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-800 text-sm sm:text-base truncate">MP Nagar</div>
                    <div className="text-[10px] sm:text-xs text-slate-500 truncate">Zone 1 & 2</div>
                  </div>
                </div>
                <div className="font-bold text-slate-800 text-sm sm:text-base shrink-0 ml-2">24</div>
              </div>

              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs sm:text-sm shrink-0">3</div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-800 text-sm sm:text-base truncate">Kolar Road</div>
                    <div className="text-[10px] sm:text-xs text-slate-500 truncate">Main highway</div>
                  </div>
                </div>
                <div className="font-bold text-slate-800 text-sm sm:text-base shrink-0 ml-2">19</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance Table */}
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Department Performance</CardTitle>
        </CardHeader>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[600px]">
            <thead className="bg-gray-50 text-gray-500 font-medium border-y border-gray-200">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Department</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Received</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Resolved</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Median Time</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Repeat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deptPerformance.map((dept, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-slate-800">{dept.dept}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-600">{dept.received}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-600">{dept.resolved}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-slate-700">{dept.time}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <Badge variant={dept.repeat > 30 ? "danger" : "default"}>{dept.repeat}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden p-4 space-y-3">
          {deptPerformance.map((dept, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800 text-sm">{dept.dept}</span>
                <Badge variant={dept.repeat > 30 ? "danger" : "default"} className="text-[10px]">{dept.repeat} repeat</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-slate-800">{dept.received}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Received</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-emerald-600">{dept.resolved}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Resolved</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-700">{dept.time}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Median</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
