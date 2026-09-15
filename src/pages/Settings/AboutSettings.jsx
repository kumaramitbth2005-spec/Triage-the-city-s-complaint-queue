import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export function AboutSettings() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">About</h1>
        <p className="text-gray-500 mt-1">System information and resources.</p>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">City Complaint Triage</h2>
          <p className="text-gray-500 mt-1">Municipal Zone Office Dashboard</p>
          <div className="inline-block mt-3 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
            Version 1.2.0
          </div>
          
          <div className="mt-8 text-sm text-gray-500 text-left max-w-lg mx-auto space-y-4">
            <p>
              The City Complaint Triage system is designed to streamline the processing, categorization, and assignment of citizen complaints. It leverages AI to identify duplicates, cluster related issues, and suggest urgency levels.
            </p>
            <p>
              For support or feature requests, please contact the IT Helpdesk.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a href="#" className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <div>
            <div className="font-semibold text-gray-900">User Manual</div>
            <div className="text-xs text-gray-500">Read the documentation</div>
          </div>
        </a>
        <a href="#" className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>
          </div>
          <div>
            <div className="font-semibold text-gray-900">Support</div>
            <div className="text-xs text-gray-500">Contact IT Helpdesk</div>
          </div>
        </a>
      </div>
    </div>
  );
}
