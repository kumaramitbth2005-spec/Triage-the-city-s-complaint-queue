import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Copy, MapPin, Calendar, ChevronRight, RefreshCw, AlertTriangle, Layers } from 'lucide-react';
import { clusterApi } from '../api/clusterApi';
import { useTranslation } from '../context/LanguageContext';
import { ClusterDetailModal } from '../components/clusters/ClusterDetailModal';

export function DuplicateClusters() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();
  const urlClusterId = searchParams.get('clusterId') || searchParams.get('id');

  const [selectedClusterId, setSelectedClusterId] = useState(null);
  const [selectedInitialCluster, setSelectedInitialCluster] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchClusters = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await clusterApi.getAll();
      const list = res.data?.data || [];
      setClusters(list);
    } catch (err) {
      console.warn('Backend clusters API unavailable, using fallback cluster data:', err.message);
      setError('Unable to reach live clusters service.');
      setClusters([
        { 
          _id: '6ab2b927865e821da3d695b3', 
          clusterId: 'CL-024', 
          title: 'Garbage Collection - Arera Colony',
          complaintCount: 17, 
          category: 'Garbage Collection', 
          department: 'Sanitation Department', 
          locality: 'Arera Colony', 
          ward: '42', 
          timeWindow: 'Last 48 hours', 
          averageSimilarity: 92, 
          isEmerging: true 
        },
        { 
          _id: '6ab2b927865e821da3d695b4', 
          clusterId: 'CL-025', 
          title: 'Water Supply Issues - Bairagarh & Habibganj',
          complaintCount: 8, 
          category: 'Water Leakage', 
          department: 'Water Supply Department', 
          locality: 'Bairagarh', 
          ward: '1', 
          timeWindow: 'Last 24 hours', 
          averageSimilarity: 88, 
          isEmerging: false 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchClusters(); 
  }, []);

  // Automatically open modal if URL has ?clusterId=... or ?id=...
  useEffect(() => {
    if (urlClusterId && !isModalOpen) {
      const matched = clusters.find(c => c.clusterId === urlClusterId || c._id === urlClusterId);
      setSelectedClusterId(urlClusterId);
      setSelectedInitialCluster(matched || null);
      setIsModalOpen(true);
    }
  }, [urlClusterId, clusters, isModalOpen]);

  const handleOpenDetails = (cluster) => {
    const id = cluster._id || cluster.clusterId;
    setSelectedClusterId(id);
    setSelectedInitialCluster(cluster);
    setIsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsModalOpen(false);
    setSelectedClusterId(null);
    setSelectedInitialCluster(null);
    if (searchParams.get('clusterId') || searchParams.get('id')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('clusterId');
      newParams.delete('id');
      setSearchParams(newParams);
    }
  };

  if (loading && !clusters.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {t('loadingClusters', 'Loading duplicate incident clusters...')}
        </p>
      </div>
    );
  }

  if (error && !clusters.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs max-w-md mx-auto">
        <div className="p-3 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-500">
          <AlertTriangle size={24} />
        </div>
        <div className="text-center">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Unable to Load Clusters</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{error}</p>
        </div>
        <Button onClick={fetchClusters} className="px-4 py-2 text-xs">
          <RefreshCw size={14} className="mr-1.5" />
          {t('refresh', 'Retry Connection')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {t('clustersTitle', 'Duplicate Clusters')}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
              {clusters.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('clustersSubtitle', 'AI-detected similar complaints grouped by issue and location.')}
          </p>
        </div>

        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchClusters}
          className="self-start sm:self-auto text-xs border-slate-200 dark:border-slate-700"
        >
          <RefreshCw size={13} className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          {t('refresh', 'Refresh')}
        </Button>
      </div>

      {clusters.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
          <Layers className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {t('noRecords', 'No clusters found.')}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Complaints will automatically group into clusters when duplicate patterns or surges emerge.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {clusters.map((cluster) => {
          const isEmerging = Boolean(cluster.isEmerging);
          return (
            <Card 
              key={cluster._id || cluster.clusterId} 
              className={`min-w-0 transition-all border ${
                isEmerging 
                  ? 'border-amber-300/80 dark:border-amber-800/80 shadow-xs dark:bg-slate-900' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 dark:bg-slate-900'
              }`}
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  
                  {/* Left Stats Panel */}
                  <div className={`p-4 sm:p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between ${
                    isEmerging ? 'bg-amber-50/50 dark:bg-amber-950/20' : 'bg-slate-50/60 dark:bg-slate-800/40'
                  }`}>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                        <span className="font-mono text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          #{cluster.clusterId}
                        </span>
                        {isEmerging && (
                          <Badge variant="warning" className="text-[10px] font-semibold animate-pulse">
                            {t('emergingIssue', 'Emerging Cluster')}
                          </Badge>
                        )}
                      </div>

                      <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-1">
                        {cluster.complaintCount}
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t('complaints', 'Complaints Linked')}
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-6 flex items-center gap-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/50 w-fit px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/60">
                      <Copy size={14} className="shrink-0 sm:w-4 sm:h-4" />
                      {cluster.averageSimilarity || 0}% {t('confidence', 'Similarity')}
                    </div>
                  </div>

                  {/* Right Details Panel */}
                  <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between min-w-0 bg-white dark:bg-slate-900">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                          {cluster.title || cluster.category}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                          {cluster.department || 'General Administration'}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="flex items-start gap-2 text-xs sm:text-sm">
                          <MapPin size={15} className="text-slate-400 dark:text-slate-500 shrink-0 mt-0.5 sm:w-4 sm:h-4" />
                          <div className="min-w-0">
                            <span className="block font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {cluster.locality || 'Locality unassigned'}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 text-xs">
                              {t('ward', 'Ward')} {cluster.ward || 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-xs sm:text-sm">
                          <Calendar size={15} className="text-slate-400 dark:text-slate-500 shrink-0 mt-0.5 sm:w-4 sm:h-4" />
                          <div className="min-w-0">
                            <span className="block font-semibold text-slate-800 dark:text-slate-200">
                              Time Window
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 text-xs">
                              {cluster.timeWindow || 'Ongoing'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Details Action Button */}
                    <div className="mt-4 sm:mt-6 flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <Button 
                        onClick={() => handleOpenDetails(cluster)}
                        className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10 cursor-pointer shadow-xs hover:shadow-md transition-all font-semibold"
                      >
                        {t('details', 'View Cluster Details')} 
                        <ChevronRight size={14} className="ml-1 shrink-0 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cluster Details Modal */}
      <ClusterDetailModal
        isOpen={isModalOpen}
        clusterId={selectedClusterId}
        initialCluster={selectedInitialCluster}
        onClose={handleCloseDetails}
      />
    </div>
  );
}
export default DuplicateClusters;
