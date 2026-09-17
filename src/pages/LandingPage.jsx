import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroContent } from '../components/landing/HeroContent';
import { Background3D } from '../components/landing/Background3D';

export function LandingPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-stone-50 text-slate-900 font-sans selection:bg-stone-200">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Background3D />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        <div className="pointer-events-auto">
          <LandingNavbar />
        </div>
        <div className="flex-1 flex items-center justify-start max-w-7xl w-full mx-auto px-6 sm:px-12 lg:px-16 pointer-events-auto">
          <HeroContent />
        </div>
      </div>
    </div>
  );
}
