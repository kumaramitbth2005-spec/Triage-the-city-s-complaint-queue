import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Landmark, Shield, FileText, HelpCircle, Mail, Globe, Sparkles } from 'lucide-react';

export function AboutSettings() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">About</h1>
        <p className="text-gray-500 mt-1">Application architecture, technical specifications, and legal notices.</p>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-md shadow-blue-500/20">
            <Landmark size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 text-center">Nexus AI</h2>
          <p className="text-sm font-medium text-gray-500 mt-1 text-center">City Complaint Triage & Resolution Platform</p>
          <div className="text-center mt-3">
            <span className="inline-block px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-full">
              Version 1.2.0 (Production)
            </span>
          </div>
          
          <div className="mt-8 space-y-6 text-sm text-gray-600">
            <section className="bg-slate-50/70 p-5 rounded-xl border border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-2.5 flex items-center gap-2">
                <Sparkles size={18} className="text-blue-600" />
                <span>About the Project</span>
              </h3>
              <p className="leading-relaxed mb-3">
                Nexus AI is an intelligent civic triage application developed for municipal corporations to streamline citizen grievance intake, automatic department categorization, urgency prioritization, and duplicate cluster detection.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
                <div>• <strong>Multi-channel Intake:</strong> Text, Image, Voice recording with audio transcription.</div>
                <div>• <strong>AI-Assisted Triage:</strong> Automated department and SLA categorization.</div>
                <div>• <strong>Duplicate Detection:</strong> Semantic clustering of overlapping ward complaints.</div>
                <div>• <strong>User Isolation:</strong> Secure role-based data governance and privacy.</div>
              </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                  <Shield size={18} className="text-emerald-600" />
                  <span>Privacy Policy</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Citizen data, uploaded voice clips, and location coordinates are processed strictly for civic resolution and municipal governance under municipal privacy regulations.
                </p>
              </div>

              <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                  <FileText size={18} className="text-indigo-600" />
                  <span>Terms of Service</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Authorized for municipal operators, zone heads, field officers, and registered citizens for public utility reporting.
                </p>
              </div>
            </section>

            <section className="p-4 bg-white border border-gray-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                <HelpCircle size={18} className="text-blue-600" />
                <span>Support & Contact</span>
              </div>
              <p className="text-xs text-gray-500">
                For administrative assistance, department configuration requests, or bug reports:
              </p>
              <div className="flex items-center gap-2 text-xs font-medium text-blue-600 pt-1">
                <Mail size={14} />
                <a href="mailto:support@municipal.gov" className="hover:underline">support@municipal.gov</a>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
            © 2026 Municipal Administration & Civic Technology Group. All rights reserved.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
