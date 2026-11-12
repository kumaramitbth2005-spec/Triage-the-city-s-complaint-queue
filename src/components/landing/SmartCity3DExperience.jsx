/**
 * SmartCity3DExperience — Real-World Live Map Experience
 * Uses Leaflet.js + CartoDB Dark Matter tiles (free, no API key)
 * Shows real city streets of Bhopal, MP with animated complaint lifecycle:
 *   REPORTED → DISPATCHED → RESOLVED
 */
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, FileText, Search, Sparkles,
  ChevronDown, Layers, CheckCircle2, Activity, MapPin,
} from 'lucide-react';

// ── CITY CONFIG ──────────────────────────────────────────────────────────────
const CITY_CENTER = [23.2599, 77.4126]; // Bhopal Municipal Corporation, MP

// Real ward locations spread around Bhopal
const WARDS = [
  { name: 'MP Nagar',        pos: [23.2381, 77.4341] },
  { name: 'TT Nagar',        pos: [23.2296, 77.4056] },
  { name: 'Arera Colony',    pos: [23.2153, 77.4356] },
  { name: 'Shahpura',        pos: [23.1941, 77.4488] },
  { name: 'Karond',          pos: [23.2824, 77.3812] },
  { name: 'Berasia Road',    pos: [23.3012, 77.4189] },
  { name: 'Govindpura',      pos: [23.2678, 77.4512] },
  { name: 'Misrod',          pos: [23.1956, 77.4812] },
  { name: 'Bairagarh',       pos: [23.2789, 77.3523] },
  { name: 'Piplani',         pos: [23.2312, 77.4701] },
  { name: 'Ashoka Garden',   pos: [23.2534, 77.4234] },
  { name: 'Bittan Market',   pos: [23.2123, 77.4167] },
  { name: 'Roshanpura',      pos: [23.2567, 77.4023] },
  { name: 'Kolar Road',      pos: [23.1789, 77.4678] },
  { name: 'Vidisha Road',    pos: [23.3156, 77.4456] },
];

const INCIDENT_TYPES = [
  { id: 'water',   label: 'Water Main Burst',     emoji: '💧', color: '#38bdf8', priority: 'CRITICAL', dept: 'Water Dept' },
  { id: 'power',   label: 'Power Outage',          emoji: '⚡', color: '#fbbf24', priority: 'HIGH',     dept: 'DISCOM' },
  { id: 'road',    label: 'Pothole / Road Damage', emoji: '🚧', color: '#f87171', priority: 'HIGH',     dept: 'PWD' },
  { id: 'garbage', label: 'Garbage Overflow',      emoji: '🗑️', color: '#34d399', priority: 'MEDIUM',   dept: 'Sanitation' },
  { id: 'traffic', label: 'Traffic Signal Fault',  emoji: '🚦', color: '#a78bfa', priority: 'MEDIUM',   dept: 'Traffic Dept' },
  { id: 'drain',   label: 'Drain Blockage',        emoji: '🌊', color: '#22d3ee', priority: 'HIGH',     dept: 'BSPDCL' },
];

const SCROLL_PANELS = [
  {
    idx: 0,
    badge: { color: 'indigo', text: 'Live Command Center — Bhopal City' },
    title: <>A city that <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">fixes itself.</span></>,
    body: 'Watch a real-world smart city command center in action on a live city map. Citizens file grievances, AI triages them instantly, crews are dispatched and issues resolved.',
    pos: 'left-4 sm:left-12 lg:left-24 bottom-14 sm:bottom-20',
    cta: true,
  },
  {
    idx: 1,
    badge: { color: 'cyan', text: '01 · Citizen Intake' },
    title: <>Citizens report.<br />The city responds.</>,
    body: 'See those pulsing markers on the real city map? Each one is a live complaint — a burst pipe, power cut, or overflowing garbage routed instantly to the command center.',
    pos: 'left-4 sm:left-12 lg:left-24 top-28 sm:top-1/3',
  },
  {
    idx: 2,
    badge: { color: 'pink', text: '02 · Auto Dispatch' },
    title: <>Crews arrive.<br />Problems disappear.</>,
    body: 'The animated lines on the map are live dispatch routes — field crews navigating from the Command Center to each incident using GPS telemetry.',
    pos: 'right-4 sm:right-12 lg:right-24 top-28 sm:top-1/3 sm:text-right',
  },
  {
    idx: 3,
    badge: { color: 'emerald', text: '03 · City Intelligence' },
    title: <>Command from above.</>,
    body: 'Every ward of the city is monitored in real-time. Green ✓ markers confirm issue resolution, verified by field crew photo proof and GPS check-in.',
    pos: 'left-4 sm:left-12 lg:left-24 top-28 sm:top-1/3',
  },
];

// ── Leaflet CDN Loader ───────────────────────────────────────────────────────
let _lPromise = null;
function loadLeaflet() {
  if (_lPromise) return _lPromise;
  if (typeof window !== 'undefined' && window.L) return (_lPromise = Promise.resolve(window.L));
  _lPromise = new Promise((resolve, reject) => {
    if (!document.getElementById('leaflet-css')) {
      const lnk = document.createElement('link');
      lnk.id = 'leaflet-css';
      lnk.rel = 'stylesheet';
      lnk.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(lnk);
    }
    const sc = document.createElement('script');
    sc.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    sc.onload = () => resolve(window.L);
    sc.onerror = () => reject(new Error('Leaflet CDN failed'));
    document.head.appendChild(sc);
  });
  return _lPromise;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const rndPos = (base, r = 0.01) => [
  base[0] + (Math.random() - 0.5) * r,
  base[1] + (Math.random() - 0.5) * r,
];

const mkIcon = (L, type, state = 'active') => {
  const c = state === 'resolved' ? '#22c55e' : state === 'dispatched' ? type.color : type.color;
  const emoji = state === 'resolved' ? '✓' : type.emoji;
  const lbl = state === 'resolved' ? 'RESOLVED' : state === 'dispatched' ? 'EN ROUTE' : type.priority;
  const cls = state === 'resolved' ? 'scm-resolved' : state === 'dispatched' ? 'scm-dispatched' : 'scm-active';
  return L.divIcon({
    html: `<div class="scm-wrap ${cls}" style="--c:${c}">
             <div class="scm-ring"></div>
             <div class="scm-ring scm-ring2"></div>
             <div class="scm-core">${emoji}</div>
             <div class="scm-lbl">${lbl}</div>
           </div>`,
    className: '',
    iconSize: [48, 62],
    iconAnchor: [24, 48],
    popupAnchor: [0, -50],
  });
};

const mkCmdIcon = (L) => L.divIcon({
  html: `<div class="scm-cmd">
           <div class="scm-cmd-ring"></div>
           <div class="scm-cmd-ring scm-cmd-ring2"></div>
           <div class="scm-cmd-core">🏛️</div>
           <div class="scm-cmd-lbl">COMMAND</div>
         </div>`,
  className: '',
  iconSize: [70, 80],
  iconAnchor: [35, 60],
});

// ── Component ──────────────────────────────────────────────────────────────────
export function SmartCity3DExperience() {
  const containerRef = useRef(null);
  const mapDivRef   = useRef(null);
  const mapRef      = useRef(null);
  const timerRef    = useRef(null);
  const statsRef    = useRef({ active: 0, resolved: 0, dispatched: 0, total: 0 });

  const [scrollProgress,   setScrollProgress]   = useState(0);
  const [activePanelIndex, setActivePanelIndex] = useState(0);
  const [mapReady,         setMapReady]         = useState(false);
  const [stats,            setStats]            = useState({ active: 0, resolved: 0, dispatched: 0, total: 0 });
  const [log,              setLog]              = useState([]);

  // ── Scroll listener ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const pct = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / Math.max(el.offsetHeight - window.innerHeight, 1)));
      setScrollProgress(pct);
      setActivePanelIndex(pct < 0.18 ? 0 : pct < 0.42 ? 1 : pct < 0.65 ? 2 : pct < 0.88 ? 3 : 4);

      // Scroll-driven map camera
      const map = mapRef.current;
      if (!map) return;
      if (pct < 0.05) {
        map.flyTo(CITY_CENTER, 12, { animate: true, duration: 1.5 });
      } else if (pct < 0.35) {
        const w = WARDS[2];
        map.flyTo(w.pos, 14, { animate: true, duration: 1.8 });
      } else if (pct < 0.62) {
        const w = WARDS[7];
        map.flyTo(w.pos, 14, { animate: true, duration: 1.8 });
      } else if (pct < 0.88) {
        map.flyTo(CITY_CENTER, 11, { animate: true, duration: 2 });
      } else {
        map.flyTo(CITY_CENTER, 13, { animate: true, duration: 1.5 });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Leaflet init ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapDivRef.current) return;
    let dead = false;

    loadLeaflet().then(L => {
      if (dead || !mapDivRef.current) return;

      const map = L.map(mapDivRef.current, {
        center: CITY_CENTER,
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        keyboard: false,
        tap: false,
        preferCanvas: false,
      });

      // CartoDB Dark Matter tiles — real city streets, dark theme, no API key
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" style="color:#555">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" style="color:#555">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);

      mapRef.current = map;
      setMapReady(true);

      // Command center pin at city center
      L.marker(CITY_CENTER, { icon: mkCmdIcon(L), zIndexOffset: 9999 }).addTo(map);

      // ── Incident lifecycle animation ─────────────────────────────────────
      const spawnIncident = () => {
        if (dead) return;

        const ward = WARDS[Math.floor(Math.random() * WARDS.length)];
        const type = INCIDENT_TYPES[Math.floor(Math.random() * INCIDENT_TYPES.length)];
        const pos  = rndPos(ward.pos, 0.014);
        const id   = `CMP-${2026}-${1000 + statsRef.current.total}`;

        // Update counters
        statsRef.current.total++;
        statsRef.current.active++;
        const snap = () => setStats({ ...statsRef.current });
        snap();

        const now = () => new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
        });

        const addLog = (status) => setLog(prev => [
          { time: now(), type, ward: ward.name, status, id },
          ...prev.slice(0, 9),
        ]);

        // 1. Spawn reported marker
        const marker = L.marker(pos, { icon: mkIcon(L, type, 'active') }).addTo(map);
        marker.bindPopup(
          `<div class="scm-popup">
             <div class="scm-popup-type" style="color:${type.color}">${type.emoji} ${type.label}</div>
             <div class="scm-popup-row"><span>Ticket</span><b>${id}</b></div>
             <div class="scm-popup-row"><span>Ward</span><b>${ward.name}</b></div>
             <div class="scm-popup-row"><span>Dept</span><b>${type.dept}</b></div>
             <div class="scm-popup-priority" style="background:${type.color}22;color:${type.color};border:1px solid ${type.color}44">
               ⚠ ${type.priority} PRIORITY
             </div>
           </div>`,
          { maxWidth: 220 }
        );
        addLog('REPORTED');

        // 2. Dispatch after 2.5s — draw dashed route line
        const t1 = setTimeout(() => {
          if (dead) return;
          statsRef.current.dispatched++;
          snap();

          marker.setIcon(mkIcon(L, type, 'dispatched'));

          const line = L.polyline([CITY_CENTER, pos], {
            color: type.color,
            weight: 2.5,
            opacity: 0.85,
            dashArray: '10 7',
            className: 'scm-route-line',
          }).addTo(map);
          addLog('DISPATCHED');

          // 3. Resolve after 5s more
          const t2 = setTimeout(() => {
            if (dead) return;
            statsRef.current.active = Math.max(0, statsRef.current.active - 1);
            statsRef.current.resolved++;
            snap();

            marker.setIcon(mkIcon(L, type, 'resolved'));
            line.setStyle({ color: '#22c55e', opacity: 0.4, dashArray: null, weight: 1.5 });
            addLog('RESOLVED');

            // 4. Cleanup after 4s
            const t3 = setTimeout(() => {
              if (dead) return;
              if (map.hasLayer(marker)) map.removeLayer(marker);
              if (map.hasLayer(line))   map.removeLayer(line);
            }, 4000);
            return () => clearTimeout(t3);
          }, 5000);
          return () => clearTimeout(t2);
        }, 2500);

        return () => clearTimeout(t1);
      };

      // Initial burst
      [400, 1200, 2400, 3600].forEach(d => setTimeout(spawnIncident, d));
      // Recurring
      timerRef.current = setInterval(spawnIncident, 3800);

    }).catch(() => {
      // Silently degrade — shows dark overlay only
    });

    return () => {
      dead = true;
      clearInterval(timerRef.current);
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="relative w-full h-[500vh] sm:h-[600vh] text-[#F4F8FF]">

      {/* ── Fixed Real Map Layer ──────────────────────────────────────────── */}
      <div className="fixed inset-0" style={{ zIndex: 0 }}>

        {/* Leaflet map mount point */}
        <div ref={mapDivRef} className="absolute inset-0 w-full h-full" />

        {/* Edge vignette + top/bottom gradient over the map */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              linear-gradient(to top,    rgba(6,9,20,.85) 0%,  transparent 45%),
              linear-gradient(to bottom, rgba(6,9,20,.60) 0%,  transparent 22%),
              radial-gradient(ellipse at center, transparent 38%, rgba(6,9,20,.55) 100%)
            `,
          }}
        />

        {/* ── Live Stats HUD (top-right) ──────────────────────────────────── */}
        <div className="absolute top-20 right-3 sm:right-5 z-10 flex flex-col gap-2 pointer-events-none">
          {/* Stats card */}
          <div className="bg-[#060912]/80 backdrop-blur-lg border border-white/10 rounded-2xl p-3 sm:p-4 min-w-[145px] sm:min-w-[165px] shadow-2xl">
            <div className="flex items-center gap-1.5 mb-3">
              <Activity size={11} className="text-cyan-400" />
              <span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.15em] font-mono">Live Triage</span>
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="space-y-2">
              {[
                { label: 'Active',     val: stats.active,     color: 'text-red-400'     },
                { label: 'En Route',   val: stats.dispatched, color: 'text-yellow-400'  },
                { label: 'Resolved',   val: stats.resolved,   color: 'text-emerald-400' },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400">{label}</span>
                  <span className={`text-sm font-black font-mono ${color}`}>{val}</span>
                </div>
              ))}
              <div className="h-px bg-white/8 my-0.5" />
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500">Total Today</span>
                <span className="text-sm font-black font-mono text-white">{stats.total}</span>
              </div>
            </div>
          </div>

          {/* Activity log (desktop only) */}
          <div className="hidden md:block bg-[#060912]/75 backdrop-blur-lg border border-white/8 rounded-2xl p-3 shadow-2xl max-w-[210px]">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] font-mono mb-2">Activity Log</div>
            <div className="space-y-1.5">
              {log.slice(0, 6).map((entry, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[9px] font-mono leading-tight">
                  <span className="text-slate-600 shrink-0">{entry.time}</span>
                  <span className="shrink-0">{entry.type.emoji}</span>
                  <span className="text-slate-400 truncate">{entry.ward}</span>
                  <span className={`ml-auto shrink-0 font-bold ${
                    entry.status === 'RESOLVED'   ? 'text-emerald-400' :
                    entry.status === 'DISPATCHED' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>{entry.status === 'DISPATCHED' ? 'SENT' : entry.status === 'RESOLVED' ? '✓' : '!'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* City label bottom-left */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <div className="text-[9px] font-mono text-slate-600">
            <span className="text-emerald-500">●</span>{' '}
            Bhopal Municipal Corporation, Madhya Pradesh
          </div>
        </div>
      </div>

      {/* ── Sticky UI Layer (panels + navbar) ─────────────────────────────── */}
      <div
        className="sticky top-0 h-screen w-full overflow-hidden select-none pointer-events-none"
        style={{ zIndex: 10 }}
      >
        {/* ── Navbar ─────────────────────────────────────────────────────── */}
        <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 bg-gradient-to-b from-[#060912]/90 to-transparent pointer-events-auto backdrop-blur-xs">
          <Link to="/" className="flex items-center gap-2.5 text-white">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
              <Layers size={17} strokeWidth={2.5} />
            </div>
            <span className="font-black text-sm sm:text-base tracking-wider uppercase text-white font-mono">Smart City</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">CIVIC OS</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
            <Link to="/citizen-portal"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all active:scale-95">
              <FileText size={13} className="text-cyan-400" /><span>Report Issue</span>
            </Link>
            <Link to="/track"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all active:scale-95">
              <Search size={13} className="text-emerald-400" /><span>Track Ticket</span>
            </Link>
            <Link to="/login"
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-500/30 transition-all active:scale-95">
              <ShieldCheck size={13} /><span>Operator Login</span>
            </Link>
          </div>
        </header>

        {/* ── Panel 0 — Hero ──────────────────────────────────────────────── */}
        <section className={`absolute z-20 transition-all duration-700 max-w-xl left-4 sm:left-12 lg:left-24 bottom-16 sm:bottom-24 pointer-events-auto ${
          activePanelIndex === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
        }`}>
          <div className="p-5 sm:p-7 rounded-3xl bg-[#060912]/88 backdrop-blur-xl border border-white/15 shadow-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[11px] font-bold uppercase tracking-wider mb-3">
              <Sparkles size={12} className="text-cyan-400" />
              <span>Live Command Center — Bhopal City</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
              A city that{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                fixes itself.
              </span>
            </h1>
            <p className="mt-3 sm:mt-4 text-xs sm:text-base text-slate-200 leading-relaxed max-w-lg">
              Real streets. Real wards. Live complaints appearing on the map of Bhopal as citizens file them — watch AI triage, crew dispatch, and resolution happen in real-time.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link to="/citizen-portal"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-900 font-bold text-xs sm:text-sm hover:bg-cyan-300 transition-all shadow-lg">
                <span>Report Grievance</span><ArrowRight size={14} />
              </Link>
              <a href="#platform-features"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all">
                <span>Platform Details</span><ChevronDown size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* ── Panel 1 — Citizen Intake ─────────────────────────────────────── */}
        <section className={`absolute z-20 transition-all duration-700 max-w-lg left-4 sm:left-12 lg:left-24 top-28 sm:top-1/3 pointer-events-auto ${
          activePanelIndex === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
        }`}>
          <div className="p-5 sm:p-7 rounded-3xl bg-[#060912]/88 backdrop-blur-xl border border-white/15 shadow-2xl">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest font-mono">01 · Citizen Intake</span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-1 leading-tight">
              Citizens report.<br />The city responds.
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-200 leading-relaxed">
              See those pulsing markers on real Bhopal streets? Each is a live complaint — a burst pipe in Arera Colony, a power outage in TT Nagar — routed instantly to the Command Center at city hall.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['💧 Water', '⚡ Power', '🚧 Road', '🗑️ Sanitation', '🚦 Traffic'].map(t => (
                <span key={t} className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-slate-200 font-mono">{t}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Panel 2 — Auto Dispatch ──────────────────────────────────────── */}
        <section className={`absolute z-20 transition-all duration-700 max-w-lg right-4 sm:right-12 lg:right-24 top-28 sm:top-1/3 sm:text-right pointer-events-auto ${
          activePanelIndex === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
        }`}>
          <div className="p-5 sm:p-7 rounded-3xl bg-[#060912]/88 backdrop-blur-xl border border-white/15 shadow-2xl">
            <span className="text-[11px] font-bold text-pink-400 uppercase tracking-widest font-mono">02 · Auto Dispatch</span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-1 leading-tight">
              Crews arrive.<br />Problems disappear.
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-200 leading-relaxed sm:ml-auto">
              The animated dashed lines on the real map are live dispatch routes — municipal field crews navigating Bhopal's streets from the Command Center to each incident.
            </p>
            <div className="mt-4 flex sm:justify-end">
              <div className="inline-flex items-center gap-2 text-[10px] font-mono text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1.5 rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                Average response: 8 min
              </div>
            </div>
          </div>
        </section>

        {/* ── Panel 3 — City Intelligence ──────────────────────────────────── */}
        <section className={`absolute z-20 transition-all duration-700 max-w-lg left-4 sm:left-12 lg:left-24 top-28 sm:top-1/3 pointer-events-auto ${
          activePanelIndex === 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
        }`}>
          <div className="p-5 sm:p-7 rounded-3xl bg-[#060912]/88 backdrop-blur-xl border border-white/15 shadow-2xl">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest font-mono">03 · City Intelligence</span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-1 leading-tight">
              Command from above.
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-200 leading-relaxed">
              Every ward of Bhopal is monitored from a single command dashboard. Green ✓ markers confirm field resolution, verified by crew GPS check-in and photo proof upload.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { label: 'Wards Covered', val: '85' },
                { label: 'Depts Online', val: '6' },
                { label: 'Avg SLA', val: '< 24h' },
                { label: 'Uptime', val: '99.9%' },
              ].map(({ label, val }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
                  <div className="text-base font-black text-white font-mono">{val}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Panel 4 — CTA ────────────────────────────────────────────────── */}
        <section className={`absolute z-20 transition-all duration-500 max-w-xl left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-center w-[92vw] sm:w-auto pointer-events-auto ${
          activePanelIndex === 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}>
          <div className="p-6 sm:p-10 rounded-3xl bg-[#060912]/92 backdrop-blur-2xl border border-white/20 shadow-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-3">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Smart City Platform Ready</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              Empower your city today.
            </h2>
            <p className="mt-3 text-xs sm:text-base text-slate-300 max-w-md mx-auto leading-relaxed">
              Experience the citizen portal, track live grievances, or access the municipal operator command desk.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link to="/citizen-portal"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-500/30 transition-all active:scale-95 flex items-center gap-2">
                <FileText size={16} /><span>Citizen Portal</span>
              </Link>
              <Link to="/login"
                className="px-6 py-3 rounded-full bg-white text-slate-900 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all shadow-xl shadow-white/10 active:scale-95 flex items-center gap-2">
                <ShieldCheck size={16} /><span>Operator Desk</span>
              </Link>
              <a href="#platform-features"
                className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all active:scale-95 flex items-center gap-1.5">
                <span>Full Feature Tour</span><ChevronDown size={15} />
              </a>
            </div>
          </div>
        </section>

        {/* ── Scroll progress bar ───────────────────────────────────────────── */}
        <div className="hidden sm:block absolute z-20 right-4 sm:right-7 top-1/2 -translate-y-1/2 h-28 w-1 bg-white/15 rounded-full overflow-hidden">
          <div
            className="w-full bg-gradient-to-b from-cyan-400 to-indigo-500 rounded-full transition-all duration-75"
            style={{ height: `${scrollProgress * 100}%` }}
          />
        </div>

        {/* ── Scroll hint ───────────────────────────────────────────────────── */}
        <div className={`absolute z-20 left-1/2 -translate-x-1/2 bottom-6 flex items-center gap-2 text-xs text-slate-300/80 pointer-events-none transition-opacity duration-500 ${
          scrollProgress > 0.05 ? 'opacity-0' : 'opacity-100 animate-bounce'
        }`}>
          <MapPin size={12} className="text-cyan-400" />
          <span>Scroll to explore the live city map</span>
          <ChevronDown size={14} />
        </div>
      </div>

      {/* ── Embedded CSS ─────────────────────────────────────────────────────── */}
      <style>{`
        /* ── Leaflet container ── */
        .leaflet-container { background: #060912 !important; font-family: inherit; }
        .leaflet-marker-icon { background: none !important; border: none !important; }
        .leaflet-attribution-flag { display: none !important; }
        .leaflet-control-attribution {
          background: rgba(0,0,0,0.45) !important;
          color: #555 !important;
          font-size: 9px !important;
          border-radius: 6px 6px 0 0 !important;
          padding: 1px 6px !important;
        }
        .leaflet-control-attribution a { color: #666 !important; }

        /* ── Complaint marker ── */
        .scm-wrap {
          position: relative;
          width: 48px;
          height: 62px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .scm-ring {
          position: absolute;
          top: 0; left: 6px;
          width: 36px; height: 36px;
          border-radius: 50%;
          background: var(--c);
          opacity: 0;
          animation: scm-ring1 2.4s ease-out infinite;
        }
        .scm-ring2 { animation: scm-ring2 2.4s ease-out infinite 1.2s; }
        @keyframes scm-ring1 {
          0%   { transform: scale(0.6); opacity: 0.55; }
          100% { transform: scale(3.0); opacity: 0; }
        }
        @keyframes scm-ring2 {
          0%   { transform: scale(0.6); opacity: 0.35; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .scm-core {
          position: relative;
          width: 36px; height: 36px;
          border-radius: 50%;
          background: var(--c);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px;
          box-shadow: 0 0 18px var(--c), 0 4px 12px rgba(0,0,0,0.6);
          border: 2px solid rgba(255,255,255,0.35);
          z-index: 1;
          transition: background 0.4s;
        }
        .scm-resolved .scm-ring, .scm-resolved .scm-ring2 { animation: none; }
        .scm-resolved .scm-core { box-shadow: 0 0 20px #22c55e, 0 4px 12px rgba(0,0,0,0.5); }
        .scm-lbl {
          margin-top: 4px;
          font-size: 8px; font-weight: 800;
          color: rgba(255,255,255,0.92);
          background: rgba(0,0,0,0.65);
          padding: 1px 6px;
          border-radius: 5px;
          font-family: ui-monospace, monospace;
          letter-spacing: 0.07em;
          white-space: nowrap;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.1);
        }

        /* ── Command center marker ── */
        .scm-cmd {
          position: relative;
          width: 70px; height: 80px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: flex-start;
          padding-top: 10px;
          gap: 4px;
        }
        .scm-cmd-ring {
          position: absolute;
          top: 2px; left: 2px;
          width: 48px; height: 48px;
          border-radius: 50%;
          border: 2px solid rgba(99,102,241,0.5);
          animation: cmd-expand 3s ease-out infinite;
        }
        .scm-cmd-ring2 { animation: cmd-expand 3s ease-out infinite 1.5s; }
        @keyframes cmd-expand {
          0%   { transform: scale(0.9); opacity: 0.7; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        .scm-cmd-core {
          font-size: 24px;
          z-index: 1;
          filter: drop-shadow(0 0 12px rgba(99,102,241,0.8));
        }
        .scm-cmd-lbl {
          font-size: 8px; font-weight: 900;
          color: rgba(255,255,255,0.95);
          background: rgba(99,102,241,0.8);
          padding: 2px 7px;
          border-radius: 5px;
          font-family: ui-monospace, monospace;
          letter-spacing: 0.12em;
          z-index: 1;
        }

        /* ── Dispatch route line animation ── */
        .scm-route-line {
          stroke-dashoffset: 0;
          animation: dash-march 0.6s linear infinite;
        }
        @keyframes dash-march {
          to { stroke-dashoffset: -17; }
        }

        /* ── Leaflet popup dark theme ── */
        .leaflet-popup-content-wrapper {
          background: rgba(6,9,20,0.97) !important;
          color: #f8fafc !important;
          border: 1px solid rgba(255,255,255,0.12) !important;
          border-radius: 14px !important;
          backdrop-filter: blur(16px);
          box-shadow: 0 24px 64px rgba(0,0,0,0.65) !important;
          padding: 0 !important;
        }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-popup-tip-container { display: none; }
        .leaflet-popup-close-button {
          color: #475569 !important;
          top: 8px !important; right: 8px !important;
          font-size: 18px !important;
          font-weight: 400 !important;
        }
        .leaflet-popup-close-button:hover { color: #94a3b8 !important; }

        .scm-popup {
          padding: 14px 16px;
          min-width: 190px;
          font-family: ui-monospace, monospace;
        }
        .scm-popup-type {
          font-weight: 800;
          font-size: 13px;
          margin-bottom: 8px;
        }
        .scm-popup-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          color: #64748b;
          margin-bottom: 3px;
        }
        .scm-popup-row b { color: #cbd5e1; font-weight: 600; }
        .scm-popup-priority {
          margin-top: 10px;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
