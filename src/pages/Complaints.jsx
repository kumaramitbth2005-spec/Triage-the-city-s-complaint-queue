import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge, UrgencyBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';
import { Search, Filter, Mic, Image as ImageIcon, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Complaints() {
  const [complaintToDelete, setComplaintToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  
  const { complaints, deleteComplaint } = useAppContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = complaints.filter(c => 
    c.originalText.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.id && c.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getIconForType = (type) => {
    if (type === 'Voice') return <Mic size={14} className="text-purple-500 shrink-0" />;
    if (type === 'Image') return <ImageIcon size={14} className="text-blue-500 shrink-0" />;
    return <FileText size={14} className="text-gray-500 shrink-0" />;
  };

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

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Complaint Queue</h2>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by ID or keyword..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm transition-all shadow-sm"
            />
          </div>
          <Button variant="outline" className="shrink-0 hidden md:flex">
            <Filter size={16} className="mr-2" />
            Filters
          </Button>
          <Button variant="outline" className="shrink-0 md:hidden px-3" onClick={() => setShowFilters(true)}>
            <Filter size={18} />
          </Button>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-end sm:items-center justify-center p-4 md:hidden">
          <div className="bg-white w-full max-w-sm rounded-t-xl sm:rounded-xl p-4 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="text-slate-500 p-1"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Urgency</label>
                <select className="w-full border-gray-200 rounded-lg text-sm"><option>All</option><option>High/Critical</option></select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Status</label>
                <select className="w-full border-gray-200 rounded-lg text-sm"><option>All</option><option>Needs Review</option></select>
              </div>
              <Button className="w-full mt-4" onClick={() => setShowFilters(false)}>Apply Filters</Button>
            </div>
          </div>
        </div>
      )}

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

      <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-1 hide-scrollbar">
        <Badge variant="outline" className="bg-white border-blue-200 text-blue-700 cursor-pointer whitespace-nowrap">All ({complaints.length})</Badge>
        <Badge variant="outline" className="bg-white cursor-pointer hover:bg-gray-50 whitespace-nowrap">High Urgency ({complaints.filter(c=>c.urgency==='HIGH' || c.urgency==='CRITICAL').length})</Badge>
        <Badge variant="outline" className="bg-white cursor-pointer hover:bg-gray-50 whitespace-nowrap">Needs Review ({complaints.filter(c=>c.status==='Needs Review').length})</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map(c => (
          <Card key={c.id} className="hover:shadow-md transition-shadow min-w-0 cursor-pointer" onClick={() => navigate(`/dashboard/complaints/${c.id}`)}>
            <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row gap-4 sm:gap-6">
              
              <div className="flex-1 space-y-3 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm sm:text-base">{c.id}</span>
                    <Badge className="text-[10px] sm:text-xs py-0 sm:py-0.5">{c.status}</Badge>
                    {c.duplicateStatus === 'Possible' && (
                      <Badge variant="warning" className="text-[10px] sm:text-xs py-0 sm:py-0.5">Possible Duplicate</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-md bg-gray-100 text-[10px] sm:text-xs font-medium text-gray-600">
                      {getIconForType(c.inputType)}
                      {c.inputType}
                    </div>
                    <Badge variant="outline" className="text-[10px] sm:text-xs py-0 sm:py-0.5 hidden sm:inline-flex">{c.language}</Badge>
                  </div>
                </div>

                <p className="text-slate-700 text-sm sm:text-base leading-relaxed break-words line-clamp-3 sm:line-clamp-none">
                  "{c.originalText}"
                </p>

                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-y-1 gap-x-6 text-[11px] sm:text-sm">
                  <div className="flex items-start sm:items-center gap-1.5">
                    <span className="text-gray-500 shrink-0">Location:</span>
                    <span className="font-medium text-slate-800 break-words">{c.normalizedLocality}, Ward {c.ward}</span>
                  </div>
                  <div className="flex items-start sm:items-center gap-1.5">
                    <span className="text-gray-500 shrink-0">Routing:</span>
                    <span className="font-medium text-slate-800 break-words">{c.department} &bull; {c.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center justify-between md:justify-center md:items-end gap-3 min-w-[140px] pl-0 md:pl-6 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100">
                <div className="flex flex-col items-start md:items-end gap-1">
                  <UrgencyBadge level={c.urgency} />
                  <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
                    Confidence: <span className="font-semibold text-blue-600">{c.confidence}%</span>
                  </div>
                </div>
                <div className="flex gap-2 w-auto md:w-full">
                  <Button className="flex-1 text-xs sm:text-sm px-3 py-1.5 sm:py-2 h-8 sm:h-10" onClick={(e) => { e.stopPropagation(); navigate('/dashboard/triage'); }}>
                    Review
                  </Button>
                  <Button variant="danger" className="flex-1 text-xs sm:text-sm px-3 py-1.5 sm:py-2 h-8 sm:h-10" onClick={(e) => handleDeleteClick(e, c.id)}>
                    Delete
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm sm:text-base">
            No complaints match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
