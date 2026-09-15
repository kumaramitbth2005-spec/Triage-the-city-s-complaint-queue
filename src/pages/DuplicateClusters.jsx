import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Copy, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { clusterApi } from '../api/clusterApi';

export function DuplicateClusters() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClusters = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await clusterApi.getAll();
      setClusters(res.data.data || []);
    } catch (err) {
      console.warn('Backend unavailable, using mock cluster data');
      setClusters([
        { _id: '1', clusterId: 'CL-024', complaintCount: 17, category: 'Garbage Collection', department: 'Sanitation Department', locality: 'Arera Colony', ward: '42', timeWindow: 'Last 48 hours', averageSimilarity: 92, isEmerging: true },
        { _id: '2', clusterId: 'CL-025', complaintCount: 8, category: 'Water Leakage', department: 'Water Supply Department', locality: 'Bairagarh', ward: '1', timeWindow: 'Last 24 hours', averageSimilarity: 88, isEmerging: false }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClusters(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error && !clusters.length) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-slate-500 text-sm">Unable to load clusters.</p>
      <button onClick={fetchClusters} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Retry</button>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto w-full">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Duplicate Clusters</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">AI-detected similar complaints grouped by issue and location.</p>
      </div>

      {clusters.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-sm">No clusters found.</div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {clusters.map(cluster => (
          <Card key={cluster._id || cluster.clusterId} className={`min-w-0 ${cluster.isEmerging ? 'border-amber-200 shadow-sm' : ''}`}>
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                
                {/* Left Stats Panel */}
                <div className={`p-4 sm:p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-between ${cluster.isEmerging ? 'bg-amber-50/30' : 'bg-gray-50/50'}`}>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                      <span className="font-mono text-xs sm:text-sm font-semibold text-slate-600">#{cluster.clusterId}</span>
                      {cluster.isEmerging && <Badge variant="warning" className="text-[10px]">Emerging Cluster</Badge>}
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold text-slate-800 mb-1">{cluster.complaintCount}</div>
                    <div className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wider">Complaints Linked</div>
                  </div>
                  <div className="mt-4 sm:mt-6 flex items-center gap-2 text-xs sm:text-sm text-blue-600 font-semibold bg-blue-50 w-fit px-3 py-1.5 rounded-lg border border-blue-100">
                    <Copy size={14} className="shrink-0 sm:w-4 sm:h-4" />
                    {cluster.averageSimilarity || 0}% Similarity
                  </div>
                </div>

                {/* Right Details Panel */}
                <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between min-w-0">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">{cluster.category}</h3>
                      <p className="text-xs sm:text-sm text-slate-500">{cluster.department} Department</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="flex items-start gap-2 text-xs sm:text-sm">
                        <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5 sm:w-4 sm:h-4" />
                        <div className="min-w-0">
                          <span className="block font-medium text-slate-700 truncate">{cluster.locality}</span>
                          <span className="text-gray-500">Ward {cluster.ward}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-xs sm:text-sm">
                        <Calendar size={14} className="text-gray-400 shrink-0 mt-0.5 sm:w-4 sm:h-4" />
                        <div className="min-w-0">
                          <span className="block font-medium text-slate-700">Time Window</span>
                          <span className="text-gray-500">{cluster.timeWindow}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-6 flex justify-end">
                    <Button className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10">
                      View Cluster Details <ChevronRight size={14} className="ml-1 shrink-0 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
