import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge, UrgencyBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../context/LanguageContext';
import { Search, Filter, Mic, Image as ImageIcon, FileText, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function Complaints() {
  const [complaintToDelete, setComplaintToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  
  const { complaints, deleteComplaint } = useAppContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(qParam);
  const [selectedUrgencyFilter, setSelectedUrgencyFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (qParam !== searchTerm) {
      setSearchTerm(qParam);
    }
  }, [qParam]);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    if (val.trim()) {
      setSearchParams({ q: val.trim() });
    } else {
      setSearchParams({});
    }
  };

  const filtered = complaints.filter(c => {
    // Search keyword filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      const matchText = (c.originalText && c.originalText.toLowerCase().includes(term)) ||
        (c.normalizedText && c.normalizedText.toLowerCase().includes(term));
      const matchId = (c.id && c.id.toLowerCase().includes(term)) ||
        (c.complaintId && c.complaintId.toLowerCase().includes(term));
      const matchDept = c.department && c.department.toLowerCase().includes(term);
      const matchCat = c.category && c.category.toLowerCase().includes(term);
      const matchLoc = c.normalizedLocality && c.normalizedLocality.toLowerCase().includes(term);
      const matchWard = c.ward && String(c.ward).toLowerCase().includes(term);
      const matchStatus = c.status && c.status.toLowerCase().includes(term);
      const matchUrgency = c.urgency && c.urgency.toLowerCase().includes(term);

      if (!matchText && !matchId && !matchDept && !matchCat && !matchLoc && !matchWard && !matchStatus && !matchUrgency) {
        return false;
      }
    }

    // Urgency filter
    if (selectedUrgencyFilter === 'HIGH') {
      if (c.urgency !== 'HIGH' && c.urgency !== 'CRITICAL') return false;
    }

    // Status filter
    if (selectedStatusFilter === 'NEEDS_REVIEW') {
      if (!['Needs Review', 'RECEIVED', 'AI_TRIAGED', 'AWAITING_REVIEW'].includes(c.status)) return false;
    }

    return true;
  });

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
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{t('complaints', 'Complaint Queue')}</h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage, triage, and review city complaints</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by ID, ward, department, text..." 
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-10 pl-9 pr-8 rounded-lg bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm transition-all shadow-xs"
            />
            {searchTerm && (
              <button 
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <Button 
            variant={showFilters ? "primary" : "outline"} 
            className="shrink-0 flex items-center gap-1.5"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Filters</span>
          </Button>
        </div>
      </div>

      {/* Filter Options Bar */}
      {showFilters && (
        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-gray-600">Urgency:</span>
              <select 
                value={selectedUrgencyFilter}
                onChange={(e) => setSelectedUrgencyFilter(e.target.value)}
                className="rounded-lg border-gray-200 text-xs py-1.5 px-2.5 bg-gray-50 font-medium"
              >
                <option value="ALL">All Urgencies</option>
                <option value="HIGH">High & Critical Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-gray-600">Status:</span>
              <select 
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="rounded-lg border-gray-200 text-xs py-1.5 px-2.5 bg-gray-50 font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="NEEDS_REVIEW">Needs Review / Triage</option>
              </select>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => { setSelectedUrgencyFilter('ALL'); setSelectedStatusFilter('ALL'); handleSearchChange(''); }}
            className="text-xs text-gray-500 hover:text-red-600"
          >
            Reset Filters
          </Button>
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
                {t('cancel', 'Cancel')}
              </Button>
              <Button variant="danger" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : t('delete', 'Delete')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Filter Badges */}
      <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-1 hide-scrollbar">
        <Badge 
          variant={selectedUrgencyFilter === 'ALL' && selectedStatusFilter === 'ALL' ? 'default' : 'outline'}
          onClick={() => { setSelectedUrgencyFilter('ALL'); setSelectedStatusFilter('ALL'); }}
          className="cursor-pointer whitespace-nowrap"
        >
          All ({complaints.length})
        </Badge>
        <Badge 
          variant={selectedUrgencyFilter === 'HIGH' ? 'danger' : 'outline'} 
          onClick={() => setSelectedUrgencyFilter(selectedUrgencyFilter === 'HIGH' ? 'ALL' : 'HIGH')}
          className="cursor-pointer whitespace-nowrap"
        >
          High Urgency ({complaints.filter(c => c.urgency === 'HIGH' || c.urgency === 'CRITICAL').length})
        </Badge>
        <Badge 
          variant={selectedStatusFilter === 'NEEDS_REVIEW' ? 'warning' : 'outline'}
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'NEEDS_REVIEW' ? 'ALL' : 'NEEDS_REVIEW')}
          className="cursor-pointer whitespace-nowrap"
        >
          Needs Review ({complaints.filter(c => ['Needs Review', 'RECEIVED', 'AI_TRIAGED', 'AWAITING_REVIEW'].includes(c.status)).length})
        </Badge>
      </div>

      {/* Complaints List */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map(c => (
          <Card key={c.id || c.complaintId} className="hover:shadow-md transition-shadow min-w-0 cursor-pointer" onClick={() => navigate(`/dashboard/complaints/${c.id || c.complaintId}`)}>
            <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row gap-4 sm:gap-6">
              
              <div className="flex-1 space-y-3 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm sm:text-base">{c.id || c.complaintId}</span>
                    <Badge className="text-[10px] sm:text-xs py-0 sm:py-0.5">{c.status}</Badge>
                    {(c.duplicateStatus === 'Possible' || (c.duplicateCandidates && c.duplicateCandidates.length > 0)) && (
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
                  "{c.originalText || c.description}"
                </p>

                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-y-1 gap-x-6 text-[11px] sm:text-sm">
                  <div className="flex items-start sm:items-center gap-1.5">
                    <span className="text-gray-500 shrink-0">Location:</span>
                    <span className="font-medium text-slate-800 break-words">{c.normalizedLocality || c.location?.locality || 'Bhopal'}, Ward {c.ward || c.location?.ward || '1'}</span>
                  </div>
                  <div className="flex items-start sm:items-center gap-1.5">
                    <span className="text-gray-500 shrink-0">Routing:</span>
                    <span className="font-medium text-slate-800 break-words">{c.department} &bull; {c.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col justify-between sm:items-center md:items-end gap-3 md:min-w-[150px] shrink-0 pl-0 md:pl-6 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100">
                <div className="flex items-center sm:items-start md:items-end justify-between sm:justify-start gap-2 w-full sm:w-auto">
                  <UrgencyBadge level={c.urgency} />
                  <div className="text-[11px] sm:text-xs text-slate-500">
                    Confidence: <span className="font-semibold text-blue-600">{c.confidence || c.aiAnalysis?.overallConfidence || 85}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto md:w-full">
                  <Button className="flex-1 sm:flex-initial md:flex-1 text-xs sm:text-sm px-3 py-1.5 sm:py-2 h-8 sm:h-9" onClick={(e) => { e.stopPropagation(); navigate('/dashboard/triage'); }}>
                    {t('edit', 'Edit')}
                  </Button>
                  <Button variant="danger" className="flex-1 sm:flex-initial md:flex-1 text-xs sm:text-sm px-3 py-1.5 sm:py-2 h-8 sm:h-9" onClick={(e) => handleDeleteClick(e, c.id || c.complaintId)}>
                    {t('delete', 'Delete')}
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm sm:text-base bg-white rounded-xl border border-gray-200">
            {t('noRecords', 'No complaints match your filters or search term.')}
          </div>
        )}
      </div>
    </div>
  );
}
