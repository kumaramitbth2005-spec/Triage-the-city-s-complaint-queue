import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, ExternalLink, AlertTriangle, Layers, Copy, MapPin, 
  Calendar, Clock, Building2, ShieldAlert, CheckCircle2, 
  User, Tag, Sparkles, PhoneCall, Smartphone, Globe, 
  RefreshCw, FileText, ImageIcon, Search
} from 'lucide-react';
import { Badge, UrgencyBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { clusterApi } from '../../api/clusterApi';
import { useTranslation } from '../../context/LanguageContext';

export function ClusterDetailModal({ isOpen, clusterId, initialCluster, onClose }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [cluster, setCluster] = useState(initialCluster || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'PRIMARY' | 'DUPLICATES'

  const fetchDetails = useCallback(async () => {
    if (!clusterId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await clusterApi.getById(clusterId);
      if (res.data?.success && res.data?.data) {
        setCluster(res.data.data);
      } else if (res.data?.data) {
        setCluster(res.data.data);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.error('Failed to load cluster details:', err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to load cluster details from server.');
      // If initialCluster was provided, keep it as fallback summary
      if (initialCluster) {
        setCluster(prev => prev || initialCluster);
      }
    } finally {
      setLoading(false);
    }
  }, [clusterId, initialCluster]);

  useEffect(() => {
    if (isOpen && clusterId) {
      fetchDetails();
    }
  }, [isOpen, clusterId, fetchDetails]);

  // Lock body scroll while modal is active & listen to Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not available';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return String(dateStr);
    }
  };

  // Helper for source channel icons
  const getSourceChannelIcon = (channelStr = '') => {
    const lower = channelStr.toLowerCase();
    if (lower.includes('voice') || lower.includes('ivr') || lower.includes('helpline')) {
      return <PhoneCall size={14} className="text-purple-500 shrink-0" />;
    }
    if (lower.includes('photo') || lower.includes('camera')) {
      return <ImageIcon size={14} className="text-emerald-500 shrink-0" />;
    }
    if (lower.includes('app') || lower.includes('mobile')) {
      return <Smartphone size={14} className="text-blue-500 shrink-0" />;
    }
    return <Globe size={14} className="text-slate-500 shrink-0" />;
  };

  // Helper for status badge styling
  const getStatusBadgeVariant = (status = '') => {
    const s = status.toUpperCase();
    if (s === 'RESOLVED') return 'success';
    if (s === 'AI_TRIAGED' || s === 'ASSIGNED' || s === 'IN_PROGRESS') return 'primary';
    if (s === 'AWAITING_REVIEW' || s === 'NEEDS_INFORMATION') return 'warning';
    if (s === 'REJECTED' || s === 'DUPLICATE') return 'danger';
    return 'default';
  };

  const complaintsList = cluster?.complaints || (Array.isArray(cluster?.complaintIds) && typeof cluster.complaintIds[0] === 'object' ? cluster.complaintIds : []);

  // Filter complaints by tab and search
  const filteredComplaints = complaintsList.filter(c => {
    if (filterType === 'PRIMARY' && !c.isPrimary) return false;
    if (filterType === 'DUPLICATES' && c.isPrimary) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const matchId = (c.complaintId && c.complaintId.toLowerCase().includes(term)) || (c._id && c._id.toLowerCase().includes(term));
      const matchText = (c.originalText && c.originalText.toLowerCase().includes(term)) || (c.title && c.title.toLowerCase().includes(term));
      const matchLoc = (c.location?.locality && c.location.locality.toLowerCase().includes(term)) || (c.location?.ward && String(c.location.ward).includes(term));
      return matchId || matchText || matchLoc;
    }
    return true;
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cluster-detail-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden transition-all text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Sticky Header */}
        <div className="px-5 py-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/80 dark:bg-slate-800/60 backdrop-blur-md shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-xs sm:text-sm font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                #{cluster?.clusterId || clusterId}
              </span>
              
              {cluster?.isEmerging && (
                <Badge variant="warning" className="text-xs font-semibold animate-pulse">
                  <AlertTriangle size={12} className="mr-1 inline-block" />
                  {t('emergingCluster', 'Emerging Cluster Alert')}
                </Badge>
              )}

              <Badge 
                variant={cluster?.clusterStatus === 'RESOLVED' ? 'success' : (cluster?.clusterStatus === 'EMERGING' ? 'warning' : 'primary')}
                className="text-xs uppercase tracking-wide font-semibold"
              >
                {cluster?.clusterStatus || (cluster?.isEmerging ? 'EMERGING' : 'ACTIVE')}
              </Badge>

              {cluster?.highestPriority && (
                <UrgencyBadge level={cluster.highestPriority} />
              )}
            </div>

            <h2 id="cluster-detail-title" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
              {cluster?.title || cluster?.category || t('clusterDetails', 'Duplicate Cluster Details')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {cluster?.locality ? `${cluster.locality}, ` : ''}{cluster?.ward ? `${t('ward', 'Ward')} ${cluster.ward}` : ''} • {cluster?.department || 'City Services'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Loading State */}
          {loading && !cluster && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {t('loadingClusterData', 'Fetching live cluster information & linked tickets...')}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !cluster && (
            <div className="p-6 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 text-center space-y-3">
              <AlertTriangle className="mx-auto h-8 w-8 text-rose-500" />
              <p className="text-sm font-semibold">{error}</p>
              <Button onClick={fetchDetails} variant="outline" className="text-xs mx-auto">
                <RefreshCw size={14} className="mr-1.5" />
                {t('retry', 'Retry Request')}
              </Button>
            </div>
          )}

          {cluster && (
            <>
              {/* Cluster Overview Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Layers size={14} className="text-blue-500" />
                    {t('linkedComplaints', 'Linked Total')}
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {cluster.complaintCount || complaintsList.length || 0}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {complaintsList.length} {t('recordsLoaded', 'records available')}
                  </span>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Copy size={14} className="text-purple-500" />
                    {t('avgSimilarity', 'Avg Similarity')}
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                    {cluster.averageSimilarity || 0}%
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('aiSemanticMatch', 'AI semantic & ward match')}
                  </span>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Clock size={14} className="text-amber-500" />
                    {t('timeWindow', 'Time Window')}
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                    {cluster.timeWindow || 'Ongoing'}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {cluster.isEmerging ? t('acceleratedSurge', 'Surge velocity high') : t('standardPace', 'Normal frequency')}
                  </span>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <Building2 size={14} className="text-emerald-500" />
                    {t('department', 'Department')}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {cluster.department || 'Not Assigned'}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {cluster.category || 'General'}
                  </span>
                </div>
              </div>

              {/* Cluster Meta & Timeline Banner */}
              <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-blue-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block">{t('locationArea', 'Target Location')}</span>
                    <span className="text-slate-500 dark:text-slate-400">{cluster.locality || 'Locality unassigned'}{cluster.ward ? ` (Ward ${cluster.ward})` : ''}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block">{t('firstReported', 'First Reported')}</span>
                    <span className="text-slate-500 dark:text-slate-400">{formatDate(cluster.firstReportedAt || cluster.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-purple-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block">{t('lastReported', 'Most Recent Report')}</span>
                    <span className="text-slate-500 dark:text-slate-400">{formatDate(cluster.lastReportedAt || cluster.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Recommended Next Action Banner */}
              {cluster.recommendedAction && (
                <div className="p-4 rounded-xl border border-blue-200/80 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/30 flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0 mt-0.5">
                    <Sparkles size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-200 mb-0.5">
                      {t('recommendedAction', 'Recommended Next Action')}
                    </h4>
                    <p className="text-xs text-blue-800 dark:text-blue-300/90 leading-relaxed">
                      {cluster.recommendedAction}
                    </p>
                  </div>
                </div>
              )}

              {/* Linked Complaints Section */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {t('linkedComplaintsList', 'Complaints in this Cluster')}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {complaintsList.length}
                    </span>
                  </div>

                  {/* Tabs / Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-medium">
                      <button
                        onClick={() => setFilterType('ALL')}
                        className={`px-2.5 py-1 rounded-md transition-all ${filterType === 'ALL' ? 'bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                      >
                        {t('all', 'All')} ({complaintsList.length})
                      </button>
                      <button
                        onClick={() => setFilterType('PRIMARY')}
                        className={`px-2.5 py-1 rounded-md transition-all ${filterType === 'PRIMARY' ? 'bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                      >
                        {t('primary', 'Primary')} ({complaintsList.filter(c => c.isPrimary).length})
                      </button>
                      <button
                        onClick={() => setFilterType('DUPLICATES')}
                        className={`px-2.5 py-1 rounded-md transition-all ${filterType === 'DUPLICATES' ? 'bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-white font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                      >
                        {t('duplicates', 'Duplicates')} ({complaintsList.filter(c => !c.isPrimary).length})
                      </button>
                    </div>

                    {/* Search inside complaints */}
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder={t('searchTickets', 'Search tickets...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-36 sm:w-44"
                      />
                    </div>
                  </div>
                </div>

                {/* Complaints List / Cards */}
                {filteredComplaints.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <FileText className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {complaintsList.length === 0 
                        ? t('noLinkedComplaintsFound', 'No linked complaint records currently found for this cluster.') 
                        : t('noMatchingComplaints', 'No complaints match the current filter or search criteria.')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredComplaints.map((c, index) => {
                      const displayId = c.complaintId || c._id;
                      const isPrimary = c.isPrimary || index === 0;

                      return (
                        <div 
                          key={c._id || c.complaintId || index}
                          className={`p-4 rounded-xl border transition-all ${
                            isPrimary 
                              ? 'bg-blue-50/30 dark:bg-blue-950/20 border-blue-200/90 dark:border-blue-800/60 shadow-xs' 
                              : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          {/* Ticket header row */}
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                                #{displayId}
                              </span>

                              {isPrimary ? (
                                <Badge variant="primary" className="text-[11px] font-bold">
                                  ★ {t('primaryAnchor', 'Primary Anchor Ticket')}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[11px]">
                                  {t('linkedDuplicate', 'Linked Duplicate')} ({c.similarityScore || cluster.averageSimilarity || 85}% match)
                                </Badge>
                              )}

                              <Badge variant={getStatusBadgeVariant(c.status)} className="text-[10px] font-semibold">
                                {c.status || 'RECEIVED'}
                              </Badge>

                              {c.urgency && (
                                <UrgencyBadge level={c.urgency} className="text-[10px]" />
                              )}
                            </div>

                            {/* View Complaint Button */}
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                onClose();
                                navigate(`/dashboard/complaints/${c._id || c.complaintId}`);
                              }}
                              className="text-xs h-7 px-2.5 font-medium border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                            >
                              <span>{t('viewComplaint', 'View Complaint')}</span>
                              <ExternalLink size={12} className="ml-1.5" />
                            </Button>
                          </div>

                          {/* Complaint description */}
                          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal mb-3">
                            {c.originalText || c.normalizedText || c.title || 'No description provided.'}
                          </p>

                          {/* Match explanation callout */}
                          {c.matchReason && !isPrimary && (
                            <div className="mb-3 px-3 py-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/90 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5 border border-slate-200/50 dark:border-slate-700/50">
                              <Copy size={12} className="text-purple-500 shrink-0" />
                              <span className="font-medium text-slate-500 dark:text-slate-400">{t('matchReason', 'Match Logic')}:</span>
                              <span className="truncate">{c.matchReason}</span>
                            </div>
                          )}

                          {/* Metadata grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin size={12} className="text-slate-400 shrink-0" />
                              <span className="truncate">
                                {c.location?.locality || cluster.locality || 'Locality'} {c.location?.ward ? `(Ward ${c.location.ward})` : (cluster.ward ? `(Ward ${cluster.ward})` : '')}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 truncate">
                              <Calendar size={12} className="text-slate-400 shrink-0" />
                              <span className="truncate">{formatDate(c.createdAt)}</span>
                            </div>

                            <div className="flex items-center gap-1.5 truncate">
                              {getSourceChannelIcon(c.sourceChannel || c.inputMethod)}
                              <span className="truncate">{c.sourceChannel || 'Citizen App'}</span>
                            </div>

                            <div className="flex items-center gap-1.5 truncate">
                              <User size={12} className="text-slate-400 shrink-0" />
                              <span className="truncate">{c.assignedOfficer || c.assignedDepartment || cluster.department || 'Not Assigned'}</span>
                            </div>
                          </div>

                          {/* Attachments preview if available */}
                          {Array.isArray(c.attachments) && c.attachments.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-2">
                              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <ImageIcon size={12} /> {t('attachments', 'Attachments')}:
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {c.attachments.map((att, idx) => (
                                  <a 
                                    key={idx}
                                    href={att} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                  >
                                    Photo #{idx + 1}
                                    <ExternalLink size={10} />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Sticky Footer */}
        <div className="px-5 py-3 sm:px-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/80 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {cluster?.clusterId ? (
              <span>Cluster reference: <strong className="font-mono text-slate-700 dark:text-slate-300">#{cluster.clusterId}</strong></span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="text-xs sm:text-sm h-8 sm:h-9"
            >
              {t('close', 'Close')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
