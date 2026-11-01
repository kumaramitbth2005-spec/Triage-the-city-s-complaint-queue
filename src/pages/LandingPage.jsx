import React from 'react';
import { SmartCity3DExperience } from '../components/landing/SmartCity3DExperience';
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
    <div className="relative w-full min-h-screen overflow-x-hidden text-[#F8FAFC] font-sans selection:bg-indigo-500 selection:text-white">
      {/* 3D Interactive Scroll-Through Smart City Experience
          The canvas inside is fixed/full-screen — it lives BEHIND everything */}
      <SmartCity3DExperience />

      {/* Platform sections rendered ON TOP of the still-running 3D canvas */}
      <div id="platform-features" className="relative w-full" style={{ zIndex: 10 }}>

        {/* Glassy separator + live ticker */}
        <div className="relative z-20 w-full pt-10 pb-4 bg-[#0A1226]/60 backdrop-blur-sm border-t border-white/10">
          <LiveActivityTicker />
        </div>

        {/* Navigation (shown in platform sections) */}
        <div className="relative z-50 w-full bg-[#0A1226]/70 backdrop-blur-md border-b border-white/10 shadow-lg">
          <LandingNavbar />
        </div>

        {/* Main Hero Content */}
        <div className="relative z-10 bg-[#0A1226]/50 backdrop-blur-sm">
          <Background3D />
          <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12">
            <HeroContent />
          </main>
        </div>

        {/* 6 Key Architectural Features */}
        <div className="relative z-10 w-full bg-[#060C1E]/65 backdrop-blur-md">
          <LandingFeatures />
        </div>

        {/* 3-Step Interactive Civic Workflow */}
        <div className="relative z-10 w-full bg-[#0A1226]/55 backdrop-blur-sm">
          <HowItWorks />
        </div>

        {/* Citizen vs Municipal Operator Dual-Portal Perspective */}
        <div className="relative z-10 w-full bg-[#060C1E]/65 backdrop-blur-md">
          <PortalShowcase />
        </div>

        {/* Interactive FAQ Section */}
        <div className="relative z-10 w-full bg-[#0A1226]/55 backdrop-blur-sm">
          <LandingFaq />
        </div>

        {/* Footer */}
        <div className="relative z-20 w-full mt-0 bg-[#060C1E]/80 backdrop-blur-lg border-t border-white/10">
          <LandingFooter />
        </div>
      </div>
    </div>
  );
}
