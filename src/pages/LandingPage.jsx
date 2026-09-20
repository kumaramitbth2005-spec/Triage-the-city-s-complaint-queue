import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroContent } from '../components/landing/HeroContent';
import { Background3D } from '../components/landing/Background3D';

export function LandingPage() {
  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-stone-50 text-slate-900 font-sans selection:bg-indigo-100 flex flex-col justify-between">
      {/* Background Graphic */}
      <Background3D />

      {/* Navigation Header */}
      <div className="relative z-20 w-full">
        <LandingNavbar />
      </div>

      {/* Main Hero Section */}
      <main className="relative z-10 flex-1 flex items-center justify-start max-w-7xl w-full mx-auto px-4 sm:px-8 lg:px-16 pt-24 pb-12">
        <HeroContent />
      </main>

      {/* Bottom Footer Note */}
      <footer className="relative z-10 w-full text-center py-4 text-xs text-stone-400 border-t border-stone-200/40">
        Nexus AI · Civic Complaint Triage Platform
      </footer>
    </div>
  );
}
