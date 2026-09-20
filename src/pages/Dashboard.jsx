import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge, UrgencyBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clusterApi } from '../api/clusterApi';

export function Dashboard() {
  // All hooks must be called at top level
  const { complaints, loading, error, fetchComplaints, deleteComplaint, usingMockData } = useAppContext();
  const navigate = useNavigate();

  const [complaintToDelete, setComplaintToDelete] = React.useState(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState(null);

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setComplaintToDelete(id);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!complaintToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteComplaint(complaintToDelete);
      setComplaintToDelete(null);
    } catch (err) {
      setDeleteError('Unable to delete complaint. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const [emergingCluster, setEmergingCluster] = React.useState(null);

  React.useEffect(() => {
    clusterApi.getAll().then(res => {
      const emerging = res.data?.data?.find(c => c.isEmerging);
      if (emerging) setEmergingCluster(emerging);
    }).catch(() => {});
  }, []);

  if (loading && !complaints.length) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );



  const total = complaints.length;
  const pendingTriage = complaints.filter(c => ['Needs Review', 'New', 'RECEIVED', 'AI_TRIAGED', 'AWAITING_REVIEW'].includes(c.status)).length;
  const highUrgency = complaints.filter(c => c.urgency === 'HIGH' || c.urgency === 'CRITICAL').length;
  const potentialDuplicates = complaints.filter(c => c.duplicateStatus === 'Possible' || (c.duplicateCandidates && c.duplicateCandidates.length > 0)).length;

  const deptData = [
    { name: 'Water', value: complaints.filter(c => c.department?.includes('Water')).length },
    { name: 'Sanitation', value: complaints.filter(c => c.department?.includes('Sanitation')).length },
    { name: 'Roads', value: complaints.filter(c => c.department?.includes('Road')).length },
    { name: 'Lighting', value: complaints.filter(c => c.department?.includes('Light')).length },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full">
      {/* Delete Confirmation Modal */}
      {complaintToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-xl">
            <h3 className="font-semibold text-slate-800 text-lg mb-2">Delete Complaint?</h3>
            <p className="text-sm text-slate-600 mb-4">Are you sure you want to permanently delete this complaint?</p>
            {deleteError && (
              <div className="mb-4 p-2 bg-red-50 text-red-600 text-xs rounded border border-red-100">
                {deleteError}
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setComplaintToDelete(null)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Resilient Cloud Status Banner */}
      {usingMockData && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-xl text-amber-900 text-sm shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-medium">
              Operating in resilient demo mode while backend connects. Reconnecting automatically...
            </span>
          </div>
          <button
            onClick={() => fetchComplaints()}
            className="px-3.5 py-1.5 bg-amber-200/80 hover:bg-amber-300 text-amber-950 rounded-lg text-xs font-semibold transition-all shadow-xs active:scale-95 shrink-0 self-end sm:self-auto"
          >
            Reconnect Now
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Complaints", value: total, desc: "All time recorded" },
          { label: "Pending Triage", value: pendingTriage, desc: "Needs operator action" },
          { label: "High Urgency", value: highUrgency, desc: "Critical/High priority" },
          { label: "Potential Duplicates", value: potentialDuplicates, desc: "AI detected clusters" },
        ].map((kpi, i) => (
          <Card key={i} className="min-w-0">
            <CardContent className="p-4 sm:p-5 flex flex-col justify-center h-full">
              <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1 truncate">{kpi.label}</p>
              <h4 className="text-2xl sm:text-3xl font-bold text-slate-800">{kpi.value}</h4>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-2 truncate">{kpi.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert Card */}
      {emergingCluster && (
        <Card className="border-amber-200 bg-amber-50 min-w-0">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600 shrink-0 hidden sm:block">
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-center gap-2 mb-1 sm:mb-0">
                <AlertTriangle size={18} className="text-amber-600 sm:hidden shrink-0" />
                <h4 className="text-amber-800 font-semibold flex items-center gap-2 text-sm sm:text-base">
                  Emerging Issue
                  <Badge variant="warning" className="text-[10px] py-0 hidden sm:inline-flex">NEW</Badge>
                </h4>
              </div>
              <p className="text-amber-700 text-xs sm:text-sm mt-1 break-words">
                {emergingCluster.complaintCount} similar complaints detected in {emergingCluster.ward ? `Ward ${emergingCluster.ward}` : ''} {emergingCluster.locality ? `(${emergingCluster.locality})` : ''} regarding {emergingCluster.category} during {emergingCluster.timeWindow || 'recent period'}.
              </p>
            </div>
            <Button variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0 border-amber-300 text-amber-700 hover:bg-amber-100 shrink-0 text-xs sm:text-sm py-1.5 sm:py-2" onClick={() => navigate('/dashboard/clusters')}>
              View Cluster
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Complaints */}
        <Card className="xl:col-span-2 flex flex-col min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6 pb-4 border-b border-gray-100">
            <CardTitle className="text-lg sm:text-xl">Recent Complaints</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600 px-2 sm:px-4 text-xs sm:text-sm" onClick={() => navigate('/dashboard/complaints')}>
              <span className="hidden sm:inline">View all</span>
              <span className="sm:hidden">All</span> 
              <ArrowRight size={16} className="ml-1 shrink-0"/>
            </Button>
          </CardHeader>
          <div className="overflow-x-auto flex-1 max-w-full">
            <table className="w-full text-left whitespace-nowrap min-w-[700px]">
              <thead className="bg-gray-50 text-gray-500 font-medium text-xs sm:text-sm border-b border-gray-200">
                <tr>
                  <th className="px-4 sm:px-6 py-3 font-semibold">ID</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold">Department</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold">Locality</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold">Urgency</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold">Status</th>
                  <th className="px-4 sm:px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {complaints.slice(0,5).map(c => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/dashboard/complaints/${c.id}`)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-slate-700">{c.id}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="font-medium text-slate-800">{c.department}</div>
                      <div className="text-[10px] sm:text-xs text-slate-500">{c.category}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-600">
                      <div className="truncate max-w-[150px] sm:max-w-[200px]">{c.normalizedLocality}</div>
                      <div className="text-[10px] sm:text-xs text-slate-500">W{c.ward}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4"><UrgencyBadge level={c.urgency} /></td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4"><Badge>{c.status}</Badge></td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" onClick={(e) => { e.stopPropagation(); navigate('/dashboard/triage'); }}>
                          Review
                        </Button>
                        <Button variant="danger" size="sm" className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" onClick={(e) => handleDeleteClick(e, c.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Chart */}
        <Card className="flex flex-col min-w-0">
          <CardHeader className="p-4 sm:p-6 pb-4">
            <CardTitle className="text-lg sm:text-xl">Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px] sm:min-h-[350px] p-4 sm:p-6 pt-0">
            <div className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={70} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}}/>
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#6366f1'][index % 4]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
