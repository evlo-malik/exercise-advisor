"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import ExerciseShowcase from "@/components/ui/exercise-showcase";

/* ═══════════════════════════════════════════════
   CUSTOM SVG ICONS
═══════════════════════════════════════════════ */

const IconCamera = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
  </svg>
);

const IconNodes = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
    <line x1="12" y1="7" x2="5" y2="17"/><line x1="12" y1="7" x2="19" y2="17"/>
  </svg>
);

const IconClassify = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);

const IconCheck = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const IconTarget = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);

const IconWarning = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconActivity = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

/* ═══════════════════════════════════════════════
   SKELETON SVG — hero right panel
═══════════════════════════════════════════════ */
const SkeletonHero = () => {
  const joints = [
    { cx: 100, cy: 40, r: 5 }, { cx: 100, cy: 58, r: 4 },
    { cx: 68, cy: 78, r: 3.5 }, { cx: 132, cy: 78, r: 3.5 },
    { cx: 52, cy: 110, r: 3 }, { cx: 148, cy: 110, r: 3 },
    { cx: 42, cy: 140, r: 2.5 }, { cx: 158, cy: 140, r: 2.5 },
    { cx: 100, cy: 110, r: 4 },
    { cx: 82, cy: 165, r: 3.5 }, { cx: 118, cy: 165, r: 3.5 },
    { cx: 78, cy: 220, r: 3 }, { cx: 122, cy: 220, r: 3 },
  ];

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#0A1628]" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#0A1628]" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#0A1628]" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#0A1628]" />

      <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="sk-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0A1628" strokeWidth="0.4"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sk-grid)"/>
      </svg>

      <div className="absolute top-4 left-8 z-20">
        <span className="text-[9px] font-mono text-[#6B7A99] tracking-[0.2em] uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-full pulse-dot inline-block" />
          POSE.ACTIVE
        </span>
      </div>
      <div className="absolute top-4 right-8 z-20 text-right">
        <div className="text-[9px] font-mono text-[#6B7A99] tracking-widest uppercase">CONF</div>
        <div className="text-2xl font-bold text-[#0A1628] tracking-tighter leading-tight">97.4%</div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div className="border border-[#0A1628] bg-[#0A1628] text-[#F8F9FB] px-4 py-1.5 text-[10px] font-mono tracking-[0.15em] flex items-center gap-2">
          <svg viewBox="0 0 8 8" className="w-2 h-2 fill-current text-[#22C55E]"><circle cx="4" cy="4" r="4"/></svg>
          POSTURE: SAFE
        </div>
      </div>

      <svg viewBox="0 0 200 260" className="relative z-10 w-full h-full py-12 px-8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {[
          { d: "M100,58 L100,110", delay: 0 },
          { d: "M68,78 L100,58 L132,78", delay: 0.1 },
          { d: "M68,78 L52,110 L42,140", delay: 0.2 },
          { d: "M132,78 L148,110 L158,140", delay: 0.2 },
          { d: "M100,110 L82,165 L78,220", delay: 0.35 },
          { d: "M100,110 L118,165 L122,220", delay: 0.35 },
        ].map((bone, i) => (
          <motion.path key={i} d={bone.d} stroke="#0A1628" strokeWidth="2" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ delay: bone.delay + 0.3, duration: 0.9, ease: "easeOut" }}
          />
        ))}
        {[
          { d: "M100,110 L82,165 L78,220", delay: 0.6 },
          { d: "M100,110 L118,165 L122,220", delay: 0.6 },
        ].map((b, i) => (
          <motion.path key={`acc-${i}`} d={b.d} stroke="#2563EB" strokeWidth="0.8" strokeDasharray="3 5" fill="none"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ delay: b.delay, duration: 1, ease: "easeOut" }}
          />
        ))}
        <motion.path d="M72,155 A16,16 0 0,1 90,153" stroke="#2563EB" strokeWidth="1.5" fill="none"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 1.2, duration: 0.5 }} />
        <motion.text x="56" y="152" fontSize="7" fontFamily="monospace" fill="#2563EB"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>90°</motion.text>
        <motion.path d="M110,153 A16,16 0 0,0 128,155" stroke="#2563EB" strokeWidth="1.5" fill="none"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 1.3, duration: 0.5 }} />
        <motion.text x="127" y="152" fontSize="7" fontFamily="monospace" fill="#2563EB"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }}>90°</motion.text>
        {joints.map((j, i) => (
          <motion.circle key={i} cx={j.cx} cy={j.cy} r={j.r} fill="#F8F9FB" stroke="#0A1628" strokeWidth="1.5"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.06, duration: 0.25, type: "spring", stiffness: 400 }}
          />
        ))}
        {[{ cx: 82, cy: 165 }, { cx: 118, cy: 165 }].map((p, i) => (
          <motion.circle key={`ring-${i}`} cx={p.cx} cy={p.cy} r={7} fill="none" stroke="#2563EB" strokeWidth="1.5"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0.9] }}
            transition={{ delay: 1.0 + i * 0.1, duration: 0.5 }}
          />
        ))}
        <motion.line x1="35" y1="78" x2="35" y2="220" stroke="#6B7A99" strokeWidth="0.6" strokeDasharray="2 4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} />
        <motion.line x1="30" y1="78" x2="40" y2="78" stroke="#6B7A99" strokeWidth="0.6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} />
        <motion.line x1="30" y1="220" x2="40" y2="220" stroke="#6B7A99" strokeWidth="0.6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} />
      </svg>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SHARED UI
═══════════════════════════════════════════════ */
const PipelineIcon = ({ icon: Icon, active }: { icon: React.ElementType; active?: boolean }) => (
  <div className={`w-9 h-9 border flex items-center justify-center flex-shrink-0 ${
    active ? "border-[#0A1628] bg-[#0A1628] text-[#F8F9FB]" : "border-[#C8D3E8] bg-white text-[#6B7A99]"
  }`}>
    <Icon className="w-4 h-4" />
  </div>
);

const SectionLabel = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-4 h-px bg-[#0A1628]" />
    <span className="text-[9px] font-mono tracking-[0.25em] text-[#6B7A99] uppercase">{label}</span>
    <div className="flex-1 h-px bg-[#C8D3E8]" />
  </div>
);

const Reveal = ({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 22 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.55, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
};

const Waveform = () => {
  const h = [6,14,9,20,8,18,5,22,12,7,16,24,10,15,8,20,6,18,11,9,22,14,7,19,5];
  return (
    <svg viewBox={`0 0 ${h.length * 6} 28`} className="w-full h-7" preserveAspectRatio="none">
      {h.map((v, i) => (
        <motion.rect key={i} x={i * 6 + 1} y={(28 - v) / 2} width={4} height={v}
          fill="#0A1628" opacity={0.12 + (i % 3) * 0.08}
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
          transition={{ delay: 0.5 + i * 0.03, duration: 0.4 }}
          style={{ transformOrigin: "center" }}
        />
      ))}
    </svg>
  );
};

/* ═══════════════════════════════════════════════
   TCN ARCHITECTURE SVG ANIMATION
═══════════════════════════════════════════════ */
const TCNDiagram = () => (
  <div className="relative border border-[#C8D3E8] bg-white p-6">
    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#0A1628]" />
    <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#0A1628]" />
    <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#0A1628]" />
    <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#0A1628]" />

    <p className="text-[9px] font-mono tracking-[0.2em] text-[#6B7A99] uppercase mb-4">Model Architecture</p>
    <h3 className="text-lg font-bold text-[#0A1628] tracking-tight mb-5 leading-snug">
      Temporal Convolutional Network
    </h3>

    <svg viewBox="0 0 320 120" className="w-full h-auto mb-4" fill="none">
      {/* Input block */}
      <motion.rect x="0" y="35" width="60" height="50" fill="#EDF0F7" stroke="#C8D3E8" strokeWidth="1"
        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.4 }} />
      <motion.text x="30" y="55" fontSize="7" fontFamily="monospace" fill="#0A1628" textAnchor="middle"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>100 frames</motion.text>
      <motion.text x="30" y="68" fontSize="7" fontFamily="monospace" fill="#6B7A99" textAnchor="middle"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>222 features</motion.text>

      {/* Arrow */}
      <motion.line x1="62" y1="60" x2="78" y2="60" stroke="#0A1628" strokeWidth="1"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.3 }} />
      <motion.polygon points="78,56 85,60 78,64" fill="#0A1628"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} />

      {/* TCN blocks */}
      {[0,1,2,3,4,5].map((i) => (
        <motion.g key={i}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + i * 0.08, duration: 0.35 }}>
          <rect x={88 + i * 28} y={25 + i * 3} width={24} height={70 - i * 6}
            fill={i < 3 ? "#EDF0F7" : "#0A1628"} stroke="#C8D3E8" strokeWidth="0.5" />
          <text x={100 + i * 28} y={63} fontSize="5" fontFamily="monospace" textAnchor="middle"
            fill={i < 3 ? "#0A1628" : "#F8F9FB"}>d={Math.pow(2, i)}</text>
        </motion.g>
      ))}

      {/* Arrow to output */}
      <motion.line x1="258" y1="60" x2="270" y2="60" stroke="#0A1628" strokeWidth="1"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.1, duration: 0.3 }} />
      <motion.polygon points="270,56 277,60 270,64" fill="#0A1628"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} />

      {/* Output heads */}
      <motion.rect x="280" y="20" width="38" height="30" fill="#2563EB" stroke="none"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} />
      <motion.text x="299" y="38" fontSize="5.5" fontFamily="monospace" fill="#FFFFFF" textAnchor="middle"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>Score</motion.text>

      <motion.rect x="280" y="55" width="38" height="30" fill="#0A1628" stroke="none"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.35 }} />
      <motion.text x="299" y="73" fontSize="5.5" fontFamily="monospace" fill="#F8F9FB" textAnchor="middle"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.45 }}>Errors</motion.text>
    </svg>

    <div className="grid grid-cols-3 gap-3 text-center">
      {[
        { val: "147k", label: "Parameters" },
        { val: "6", label: "TCN Blocks" },
        { val: "100+", label: "Frame Receptive Field" },
      ].map((s, i) => (
        <Reveal key={i} delay={i * 0.05}>
          <div className="border border-[#EDF0F7] py-2">
            <p className="text-lg font-bold text-[#0A1628] tracking-tighter leading-none">{s.val}</p>
            <p className="text-[9px] font-mono text-[#6B7A99] tracking-widest mt-0.5">{s.label}</p>
          </div>
        </Reveal>
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FB] text-[#0A1628] overflow-x-hidden selection:bg-[#BFDBFE]">

      {/* NAV */}
      <header className="sticky top-0 z-50 bg-[#F8F9FB]/90 backdrop-blur-sm border-b border-[#C8D3E8]">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="#0A1628" strokeWidth="1.5">
              <circle cx="10" cy="6" r="2"/><circle cx="5" cy="15" r="1.5"/><circle cx="15" cy="15" r="1.5"/>
              <line x1="10" y1="8" x2="5" y2="13.5"/><line x1="10" y1="8" x2="15" y2="13.5"/>
              <line x1="10" y1="8" x2="10" y2="13"/>
            </svg>
            <span className="text-sm font-bold tracking-[0.05em]">EXERCISE ADVISOR</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-mono tracking-[0.15em] text-[#6B7A99]">
            <a href="#problem" className="hover:text-[#0A1628] transition-colors uppercase">Problem</a>
            <a href="#solution" className="hover:text-[#0A1628] transition-colors uppercase">Solution</a>
            <a href="#data" className="hover:text-[#0A1628] transition-colors uppercase">Data</a>
            <a href="#architecture" className="hover:text-[#0A1628] transition-colors uppercase">Architecture</a>
          </nav>
          <div className="flex items-center gap-2 text-[9px] font-mono text-[#6B7A99] tracking-[0.15em]">
            <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full pulse-dot inline-block" />
            <span className="hidden sm:inline">SYS.ACTIVE</span>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-[calc(100vh-48px)] grid lg:grid-cols-2 overflow-hidden">
        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#0A1628] z-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-[#0A1628] z-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-[#0A1628] z-20 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[#0A1628] z-20 pointer-events-none" />

        <div className="relative flex flex-col justify-center px-8 lg:px-16 py-20 lg:py-0 border-r border-[#C8D3E8]">
          <div className="absolute left-0 top-0 bottom-0 w-1 dither opacity-20" />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="max-w-lg">
            <div className="flex items-center gap-2 mb-6 opacity-50">
              <div className="w-6 h-px bg-[#0A1628]" />
              <span className="text-[9px] font-mono tracking-[0.25em] text-[#6B7A99] uppercase">001</span>
              <div className="flex-1 h-px bg-[#C8D3E8]" />
            </div>

            <div className="inline-flex items-center gap-2 border border-[#C8D3E8] px-3 py-1 mb-6">
              <span className="text-[9px] font-mono tracking-[0.2em] text-[#6B7A99] uppercase">ML · Computer Vision · Pose Estimation</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.0] tracking-tight mb-5 fade-up fade-up-1">
              SAFER<br /><span className="text-[#2563EB]">REPS,</span><br />SMARTER<br />FORM.
            </h1>

            <p className="text-sm text-[#6B7A99] leading-relaxed mb-8 max-w-xs fade-up fade-up-2">
              Real-time posture evaluation from any camera. No coach. No motion capture. Just ML.
            </p>

            <div className="flex gap-1 mb-8 opacity-30">
              {Array.from({ length: 32 }).map((_, i) => (
                <div key={i} className="w-0.5 h-0.5 bg-[#0A1628] rounded-full" />
              ))}
            </div>

            <div className="flex flex-wrap gap-3 fade-up fade-up-3">
              <a href="#solution" className="relative border border-[#0A1628] bg-[#0A1628] text-[#F8F9FB] px-6 py-2.5 text-[11px] font-mono tracking-[0.15em] uppercase hover:bg-[#2563EB] hover:border-[#2563EB] transition-colors group">
                <span className="absolute -top-px -left-px w-2 h-2 border-t border-l border-[#F8F9FB] opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-[#F8F9FB] opacity-0 group-hover:opacity-100 transition-opacity" />
                Explore Pipeline
              </a>
              <a href="#data" className="border border-[#0A1628] bg-transparent px-6 py-2.5 text-[11px] font-mono tracking-[0.15em] uppercase hover:bg-[#EDF0F7] transition-colors">
                View Data
              </a>
            </div>

            <div className="flex items-center gap-2 mt-10 opacity-40 fade-up fade-up-4">
              <svg viewBox="0 0 16 24" className="w-3 h-5 bounce-y" fill="none" stroke="#0A1628" strokeWidth="1.5">
                <rect x="2" y="2" width="12" height="20" rx="6"/><circle cx="8" cy="7" r="1.5" fill="#0A1628"/>
              </svg>
              <span className="text-[9px] font-mono tracking-[0.2em] uppercase">Scroll</span>
            </div>
          </motion.div>
        </div>

        <motion.div className="relative min-h-[480px] lg:min-h-0 bg-[#F0F4FA]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <SkeletonHero />
        </motion.div>
      </section>

      {/* STATS */}
      <section className="border-y border-[#C8D3E8] bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-10">
          <div className="mb-6 opacity-40"><Waveform /></div>
          <div className="grid sm:grid-cols-4 divide-x divide-[#C8D3E8]">
            {[
              { val: "4,979", label: "Total annotated reps" },
              { val: "222", label: "Features extracted per frame" },
              { val: "33", label: "MediaPipe landmarks tracked" },
              { val: "147k", label: "Model parameters (TCN)" },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="px-5 first:pl-0 last:pr-0 py-2">
                  <p className="text-2xl font-bold tracking-tighter leading-none mb-1">{s.val}</p>
                  <p className="text-[10px] text-[#6B7A99] leading-snug">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section id="problem" className="max-w-7xl mx-auto px-6 lg:px-16 py-20">
        <Reveal>
          <SectionLabel label="002 — The Problem" />
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-3">
            POOR FORM IS<br />INVISIBLE TO THE LIFTER.
          </h2>
          <p className="text-sm text-[#6B7A99] leading-relaxed max-w-sm mb-10">
            Most injuries come from form errors the athlete can&apos;t see. Existing solutions need a coach or expensive hardware.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-3 gap-px bg-[#C8D3E8]">
          {[
            { icon: IconTarget, title: "Joint Angles", desc: "Knee valgus, elbow flare — small errors that compound." },
            { icon: IconWarning, title: "Spinal Load", desc: "Lumbar rounding under heavy barbell creates shear forces." },
            { icon: IconActivity, title: "Asymmetry", desc: "Left-right imbalances lead to chronic overuse injuries." },
          ].map((card, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="bg-white p-5 group hover:bg-[#EDF0F7] transition-colors h-full">
                <div className="w-8 h-8 border border-[#C8D3E8] flex items-center justify-center mb-4 group-hover:border-[#0A1628] transition-colors">
                  <card.icon className="w-4 h-4 text-[#6B7A99] group-hover:text-[#0A1628] transition-colors" />
                </div>
                <h3 className="text-xs font-bold tracking-wide mb-1">{card.title}</h3>
                <p className="text-[11px] text-[#6B7A99] leading-relaxed">{card.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SOLUTION */}
      <section id="solution" className="border-t border-[#C8D3E8] bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-20 grid lg:grid-cols-2 gap-14 items-start">
          <div>
            <Reveal>
              <SectionLabel label="003 — Pipeline" />
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-3">
                FOUR STAGES.<br />ONE CAMERA.
              </h2>
              <p className="text-sm text-[#6B7A99] leading-relaxed mb-8 max-w-xs">
                Same angle, different exercise, different verdict. That&apos;s why rules fail and ML wins.
              </p>
            </Reveal>

            {[
              { num: "01", icon: IconCamera, title: "Video Input", sub: "Standard camera — no specialist hardware.", active: false },
              { num: "02", icon: IconNodes, title: "Pose Estimation", sub: "33 landmarks via MediaPipe, hip-centred, shoulder-scaled.", active: true },
              { num: "03", icon: IconClassify, title: "Exercise Classification", sub: "Multi-class classifier from 222-dim feature vectors.", active: true },
              { num: "04", icon: IconCheck, title: "Posture Verdict", sub: "Safe/Unsafe + specific error flags returned in real time.", active: false },
            ].map((step, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="flex gap-4 items-start py-3.5 border-b border-[#EDF0F7] last:border-0">
                  <PipelineIcon icon={step.icon} active={step.active} />
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] font-mono text-[#6B7A99] tracking-[0.2em]">STEP {step.num}</span>
                      {step.active && <span className="text-[8px] font-mono bg-[#0A1628] text-[#F8F9FB] px-1.5 py-0.5 tracking-widest">ML</span>}
                    </div>
                    <h4 className="text-sm font-bold tracking-wide">{step.title}</h4>
                    <p className="text-[11px] text-[#6B7A99] mt-0.5">{step.sub}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="space-y-6 lg:sticky lg:top-16">
            <Reveal delay={0.1}>
              <div className="relative border border-[#C8D3E8] bg-white p-6">
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#0A1628]" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#0A1628]" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#0A1628]" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#0A1628]" />

                <p className="text-[9px] font-mono tracking-[0.2em] text-[#6B7A99] uppercase mb-4">Feature Engineering</p>
                <h3 className="text-lg font-bold tracking-tight mb-5 leading-snug">222 features per frame.</h3>

                <div className="space-y-0 divide-y divide-[#EDF0F7]">
                  {[
                    { val: "99", label: "33 landmarks × 3 coords (x, y, z)" },
                    { val: "12", label: "Joint angles via law of cosines" },
                    { val: "111", label: "First-order velocity features" },
                  ].map((row, i) => (
                    <div key={i} className="py-3 flex items-center gap-4">
                      <span className="text-xl font-bold text-[#2563EB] w-10 text-right flex-shrink-0">{row.val}</span>
                      <p className="text-[11px] text-[#6B7A99]">{row.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-[#C8D3E8] pt-3 bg-[#EDF0F7] -mx-6 -mb-6 px-6 pb-6">
                  <p className="text-[11px] text-[#0A1628] font-bold">
                    Hip-centred + shoulder-scaled normalization achieves 88% reduction in intra-subject variance.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* DATA — Exercise Showcase */}
      <section id="data" className="border-t border-[#C8D3E8]">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-20">
          <Reveal>
            <SectionLabel label="004 — Fitness-AQA Dataset" />
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-3">
              THREE EXERCISES.<br />4,979 REPS.
            </h2>
            <p className="text-sm text-[#6B7A99] leading-relaxed max-w-sm mb-10">
              Each rep is a single video clip with temporal and binary error annotations. Zero subject overlap between splits.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <ExerciseShowcase />
          </Reveal>

          {/* Frameworks */}
          <Reveal delay={0.2}>
            <div className="bg-white border border-[#C8D3E8] border-t-0 p-5 flex flex-wrap items-center gap-3">
              <span className="text-[9px] font-mono tracking-[0.2em] text-[#6B7A99] uppercase mr-2">Stack:</span>
              {["MediaPipe", "PyTorch", "TCN", "AdamW", "Huber Loss", "BCE + pos_weight"].map((f) => (
                <span key={f} className="border border-[#C8D3E8] bg-[#EDF0F7] px-3 py-1 text-[10px] font-mono tracking-wide hover:border-[#0A1628] transition-colors cursor-default">{f}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section id="architecture" className="border-t border-[#C8D3E8] bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-20 grid lg:grid-cols-2 gap-14 items-start">
          <div>
            <Reveal>
              <SectionLabel label="005 — Architecture" />
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-3">
                TCN WITH<br />DUAL-TASK HEADS.
              </h2>
              <p className="text-sm text-[#6B7A99] leading-relaxed max-w-xs mb-8">
                Parallelizable, causal, and captures full-rep context through exponentially dilated convolutions.
              </p>
            </Reveal>

            <div className="space-y-0 divide-y divide-[#EDF0F7]">
              {[
                { label: "Why TCN over LSTM?", detail: "All timesteps processed simultaneously — faster GPU training." },
                { label: "Dilation strategy", detail: "d = 1, 2, 4, 8, 16, 32 — block 6 sees all 100 frames." },
                { label: "Regression head", detail: "Huber Loss (δ=0.1) — robust to mislabeled reps." },
                { label: "Classification head", detail: "BCE with pos_weight up to 12× for rare errors." },
                { label: "Regularization", detail: "Dropout 0.2, weight decay 1e-4, gradient clipping at 1.0." },
              ].map((row, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <div className="py-3 flex items-start gap-3">
                    <div className="w-1 h-1 bg-[#2563EB] mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold tracking-wide">{row.label}</p>
                      <p className="text-[11px] text-[#6B7A99] mt-0.5">{row.detail}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.15} className="lg:sticky lg:top-16">
            <TCNDiagram />
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#C8D3E8] bg-[#F8F9FB]">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="#0A1628" strokeWidth="1.5">
              <circle cx="8" cy="4" r="1.5"/><circle cx="3" cy="13" r="1.5"/><circle cx="13" cy="13" r="1.5"/>
              <line x1="8" y1="5.5" x2="3" y2="11.5"/><line x1="8" y1="5.5" x2="13" y2="11.5"/>
            </svg>
            <span className="text-[10px] font-mono text-[#6B7A99] tracking-widest">EXERCISE ADVISOR · 2026</span>
          </div>
          <div className="flex gap-6 text-[9px] font-mono tracking-[0.2em] text-[#6B7A99] uppercase">
            <a href="#" className="hover:text-[#0A1628] transition-colors">Slides</a>
            <a href="#" className="hover:text-[#0A1628] transition-colors">Dataset</a>
            <a href="#" className="hover:text-[#0A1628] transition-colors">GitHub</a>
          </div>
        </div>
        <div className="border-t border-[#C8D3E8] bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-16 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4 text-[8px] font-mono text-[#6B7A99] tracking-[0.15em]">
              <span className="hidden sm:inline">SYSTEM.ACTIVE</span>
              <div className="flex gap-0.5 items-end h-3">
                {[4,7,5,9,6,11,4,8,5,10,7,9].map((h, i) => (
                  <div key={i} className="w-1 bg-[#C8D3E8]" style={{ height: `${h}px` }} />
                ))}
              </div>
              <span>V1.0.0</span>
            </div>
            <div className="flex items-center gap-2 text-[8px] font-mono text-[#6B7A99] tracking-[0.15em]">
              <span className="hidden sm:inline">◐ RENDERING</span>
              <div className="flex gap-0.5">
                <div className="w-1 h-1 bg-[#0A1628] rounded-full pulse-dot" />
                <div className="w-1 h-1 bg-[#0A1628] rounded-full pulse-dot-2" />
                <div className="w-1 h-1 bg-[#0A1628] rounded-full pulse-dot-3" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}