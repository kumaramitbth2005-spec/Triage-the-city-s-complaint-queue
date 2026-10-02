import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroContent } from '../components/landing/HeroContent';
import { Background3D } from '../components/landing/Background3D';
import { LiveActivityTicker } from '../components/landing/LiveActivityTicker';
import { LandingFeatures } from '../components/landing/LandingFeatures';
import { HowItWorks } from '../components/landing/HowItWorks';
import { PortalShowcase } from '../components/landing/PortalShowcase';
import { LandingFaq } from '../components/landing/LandingFaq';
import { LandingFooter } from '../components/landing/LandingFooter';

export function LandingPage() {
  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Dynamic 3D / Ambient Background */}
      <Background3D />

      {/* Navigation Header */}
      <div className="relative z-50 w-full">
        <LandingNavbar />
      </div>

      {/* Main Hero & Live Triage Demo Section */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12">
        <HeroContent />
      </main>

      {/* Live Real-Time Activity Marquee Ticker */}
      <div className="relative z-20 w-full my-8 sm:my-12">
        <LiveActivityTicker />
      </div>

      {/* 6 Key Architectural Features */}
      <div className="relative z-10 w-full">
        <LandingFeatures />
      </div>

      {/* 3-Step Interactive Civic Workflow */}
      <div className="relative z-10 w-full">
        <HowItWorks />
      </div>

      {/* Citizen vs Municipal Operator Dual-Portal Perspective */}
      <div className="relative z-10 w-full">
        <PortalShowcase />
      </div>

      {/* Interactive FAQ Section */}
      <div className="relative z-10 w-full">
        <LandingFaq />
      </div>

      {/* Conversion Banner & Comprehensive Dark Mode Footer */}
      <div className="relative z-20 w-full mt-24">
        <LandingFooter />
      </div>
    </div>
  );
}
