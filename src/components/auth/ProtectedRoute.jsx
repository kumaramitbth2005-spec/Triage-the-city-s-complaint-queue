import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Loader2 } from 'lucide-react';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0B0D12] text-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-[#111827] border border-[#2A3548] shadow-2xl max-w-sm w-full mx-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 animate-pulse">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#F8FAFC] mb-1">Authenticating Operator Desk</h3>
            <p className="text-xs text-[#94A3B8]">Verifying municipal credentials and session token...</p>
          </div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold pt-2">
            <Loader2 size={16} className="animate-spin" />
            <span>Secure check in progress</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const targetUrl = location.pathname + location.search;
    return (
      <Navigate 
        to={`/login?redirect=${encodeURIComponent(targetUrl)}`} 
        replace 
        state={{ from: location }} 
      />
    );
  }

  return <Outlet />;
}
