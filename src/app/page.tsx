"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import ExerciseShowcase from "@/components/ui/exercise-showcase";

/* ═══════════════════════════════════════════════
   REVEAL WRAPPER
═══════════════════════════════════════════════ */
const Reveal = ({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════
   SKELETON HERO ANIMATION
═══════════════════════════════════════════════ */
const SkeletonHero = () => {
  const t = { duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" } as const;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 200 260"
        className="relative z-10 w-full max-w-[280px] h-auto"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Ground */}
        <line x1="30" y1="230" x2="170" y2="230" stroke="#E8DFD1" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="90" y1="230" x2="130" y2="230" stroke="#0F1729" strokeWidth="3.5" /> {/* Foot */}

        {/* Calf */}
        <motion.line x1="100" y1="230" x2="100" y2="150" animate={{ x2: [100, 135, 100], y2: [150, 150, 150] }} transition={t} stroke="#0F1729" strokeWidth="3.5" />
        {/* Thigh */}
        <motion.line x1="100" y1="150" x2="100" y2="80" animate={{ x1: [100, 135, 100], y1: [150, 150, 150], x2: [100, 60, 100], y2: [80, 160, 80] }} transition={t} stroke="#0F1729" strokeWidth="3.5" />
        {/* Torso */}
        <motion.line x1="100" y1="80" x2="100" y2="30" animate={{ x1: [100, 60, 100], y1: [80, 160, 80], x2: [100, 110, 100], y2: [30, 90, 30] }} transition={t} stroke="#0F1729" strokeWidth="3.5" />
        
        {/* Arm (Upper) */}
        <motion.line x1="100" y1="30" x2="80" y2="50" animate={{ x1: [100, 110, 100], y1: [30, 90, 30], x2: [80, 90, 80], y2: [50, 115, 50] }} transition={t} stroke="#0F1729" strokeWidth="3.5" />
        {/* Arm (Lower) */}
        <motion.line x1="80" y1="50" x2="100" y2="30" animate={{ x1: [80, 90, 80], y1: [50, 115, 50], x2: [100, 110, 100], y2: [30, 90, 30] }} transition={t} stroke="#0F1729" strokeWidth="3.5" />

        {/* Head */}
        <motion.circle cx="100" cy="8" r="14" animate={{ cx: [100, 125, 100], cy: [8, 65, 8] }} transition={t} fill="#FEF0E0" stroke="#0F1729" strokeWidth="2.5" />
        
        {/* Barbell */}
        <motion.circle cx="100" cy="30" r="7" animate={{ cx: [100, 110, 100], cy: [30, 90, 30] }} transition={t} fill="#E8613C" />

        {/* Joint dots */}
        <motion.circle cx="100" cy="150" r="4.5" animate={{ cx: [100, 135, 100], cy: [150, 150, 150] }} transition={t} fill="#FFFBF5" stroke="#0F1729" strokeWidth="2.5" />
        <motion.circle cx="100" cy="80" r="4.5" animate={{ cx: [100, 60, 100], cy: [80, 160, 80] }} transition={t} fill="#FFFBF5" stroke="#0F1729" strokeWidth="2.5" />
        <motion.circle cx="100" cy="30" r="4.5" animate={{ cx: [100, 110, 100], cy: [30, 90, 30] }} transition={t} fill="#FFFBF5" stroke="#0F1729" strokeWidth="2.5" />
        <motion.circle cx="80" cy="50" r="4.5" animate={{ cx: [80, 90, 80], cy: [50, 115, 50] }} transition={t} fill="#FFFBF5" stroke="#0F1729" strokeWidth="2.5" />

        {/* Angle indicator for knee */}
        <motion.path 
          d="M 100 120 A 30 30 0 0 1 100 180" 
          animate={{ d: ["M 100 120 A 30 30 0 0 1 100 180", "M 115 130 A 30 30 0 0 1 125 170", "M 100 120 A 30 30 0 0 1 100 180"], opacity: [0, 1, 0] }} 
          transition={t} stroke="#E8613C" strokeWidth="2.5" fill="none" strokeDasharray="3 3" 
        />
        <motion.text
          x="125"
          y="155"
          fontSize="10"
          fontFamily="system-ui"
          fontWeight="700"
          fill="#E8613C"
          animate={{ x: [125, 155, 125], opacity: [0, 1, 0] }}
          transition={t}
        >
          85°
        </motion.text>
      </svg>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   TCN ARCHITECTURE DIAGRAM
═══════════════════════════════════════════════ */
const TCNDiagram = () => (
  <div className="bg-white rounded-2xl p-8 shadow-[0_4px_40px_rgba(15,23,41,0.06)]">
    <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">
      Model Architecture
    </p>
    <h3 className="font-display text-xl font-bold text-[#0F1729] tracking-tight mb-6">
      Temporal Convolutional Network
    </h3>

    <svg viewBox="0 0 320 120" className="w-full h-auto mb-6" fill="none">
      {/* Input */}
      <motion.rect
        x="0"
        y="35"
        width="60"
        height="50"
        rx="8"
        fill="#FEF0E0"
        stroke="#E8DFD1"
        strokeWidth="1"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      />
      <motion.text
        x="30"
        y="56"
        fontSize="7"
        fontFamily="system-ui"
        fontWeight="600"
        fill="#0F1729"
        textAnchor="middle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        100 frames
      </motion.text>
      <motion.text
        x="30"
        y="69"
        fontSize="7"
        fontFamily="system-ui"
        fill="#6B7280"
        textAnchor="middle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
      >
        222 features
      </motion.text>

      {/* Arrow */}
      <motion.line
        x1="62"
        y1="60"
        x2="82"
        y2="60"
        stroke="#E8DFD1"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      />
      <motion.polygon
        points="80,56 87,60 80,64"
        fill="#0F1729"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      />

      {/* TCN blocks */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
        >
          <rect
            x={90 + i * 28}
            y={25 + i * 3}
            width={24}
            height={70 - i * 6}
            rx="4"
            fill={i < 3 ? "#FEF0E0" : "#0F1729"}
            stroke={i < 3 ? "#E8DFD1" : "none"}
            strokeWidth="0.5"
          />
          <text
            x={102 + i * 28}
            y={63}
            fontSize="5"
            fontFamily="system-ui"
            fontWeight="600"
            textAnchor="middle"
            fill={i < 3 ? "#0F1729" : "#FFFBF5"}
          >
            d={Math.pow(2, i)}
          </text>
        </motion.g>
      ))}

      {/* Arrow to output */}
      <motion.line
        x1="258"
        y1="60"
        x2="274"
        y2="60"
        stroke="#E8DFD1"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 1.2, duration: 0.3 }}
      />
      <motion.polygon
        points="272,56 279,60 272,64"
        fill="#0F1729"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
      />

      {/* Output heads */}
      <motion.rect
        x="282"
        y="20"
        width="36"
        height="30"
        rx="6"
        fill="#E8613C"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      />
      <motion.text
        x="300"
        y="39"
        fontSize="6"
        fontFamily="system-ui"
        fontWeight="700"
        fill="#FFFFFF"
        textAnchor="middle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        Score
      </motion.text>

      <motion.rect
        x="282"
        y="55"
        width="36"
        height="30"
        rx="6"
        fill="#0F1729"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.45 }}
      />
      <motion.text
        x="300"
        y="74"
        fontSize="6"
        fontFamily="system-ui"
        fontWeight="700"
        fill="#FFFBF5"
        textAnchor="middle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.55 }}
      >
        Errors
      </motion.text>
    </svg>

    <div className="grid grid-cols-3 gap-3">
      {[
        { val: "147k", label: "Parameters" },
        { val: "6", label: "TCN Blocks" },
        { val: "100+", label: "Receptive Field" },
      ].map((s, i) => (
        <div
          key={i}
          className="bg-[#FFFBF5] rounded-xl py-3 px-2 text-center"
        >
          <p className="font-display text-lg font-bold text-[#0F1729] leading-none">
            {s.val}
          </p>
          <p className="text-[10px] text-[#6B7280] mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF5] text-[#0F1729] overflow-x-hidden font-body">
      {/* ─── NAVIGATION ─── */}
      <header className="sticky top-0 z-50 bg-[#FFFBF5]/80 backdrop-blur-xl border-b border-[#E8DFD1]/60">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0F1729] rounded-xl flex items-center justify-center">
              <svg
                viewBox="0 0 20 20"
                className="w-5 h-5"
                fill="none"
                stroke="#FFFBF5"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <circle cx="10" cy="5" r="2.5" />
                <line x1="10" y1="7.5" x2="10" y2="13" />
                <line x1="10" y1="9" x2="5" y2="13" />
                <line x1="10" y1="9" x2="15" y2="13" />
                <line x1="10" y1="13" x2="6" y2="18" />
                <line x1="10" y1="13" x2="14" y2="18" />
              </svg>
            </div>
            <span className="font-display text-base font-bold tracking-tight">
              FormCoach
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-[#6B7280]">
            <a
              href="#problem"
              className="hover:text-[#0F1729] transition-colors"
            >
              Problem
            </a>
            <a href="#why-ml" className="hover:text-[#0F1729] transition-colors">
              Why ML
            </a>
            <a
              href="#pipeline"
              className="hover:text-[#0F1729] transition-colors"
            >
              How It Works
            </a>
            <a href="#data" className="hover:text-[#0F1729] transition-colors">
              Data
            </a>
            <a
              href="#architecture"
              className="hover:text-[#0F1729] transition-colors"
            >
              Architecture
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-[#6B7280]">
              Imperial College
            </span>
            <div className="w-2 h-2 bg-green-400 rounded-full pulse-soft" />
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative hero-gradient overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-[#E8DFD1] rounded-full px-4 py-2 mb-8">
                  <div className="w-1.5 h-1.5 bg-[#E8613C] rounded-full" />
                  <span className="text-xs text-[#6B7280] font-medium">
                    Imperial College London &middot; Group 6 &middot;
                    Demystifying ML
                  </span>
                </div>
              </motion.div>

              <motion.h1
                className="font-display text-5xl sm:text-6xl lg:text-[4.2rem] font-extrabold leading-[1.05] tracking-tight mb-6 animate-rise"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                Your AI-Powered{" "}
                <span className="text-[#E8613C]">Form Coach</span>
              </motion.h1>

              <motion.p
                className="text-lg text-[#4B5563] leading-relaxed mb-10 max-w-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25 }}
              >
                We built a machine learning system that watches your exercise
                form through any standard camera and tells you exactly what to
                fix &mdash; no personal trainer required.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <a
                  href="#pipeline"
                  className="bg-[#0F1729] text-white px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-[#1A2744] transition-all duration-300 shadow-lg shadow-[#0F1729]/10 hover:shadow-xl hover:shadow-[#0F1729]/15 hover:-translate-y-0.5"
                >
                  See How It Works
                </a>
                <a
                  href="#data"
                  className="bg-white text-[#0F1729] px-7 py-3.5 rounded-xl text-sm font-semibold border border-[#E8DFD1] hover:border-[#0F1729]/20 hover:bg-[#F5F0E8] transition-all duration-300"
                >
                  Explore the Data
                </a>
              </motion.div>

              <motion.div
                className="flex items-center gap-2 mt-14 opacity-40 float-down"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 1.2 }}
              >
                <svg
                  viewBox="0 0 16 24"
                  className="w-4 h-6"
                  fill="none"
                  stroke="#0F1729"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="2" width="10" height="18" rx="5" />
                  <circle cx="8" cy="7" r="1.5" fill="#0F1729" />
                </svg>
                <span className="text-xs text-[#6B7280]">Scroll to explore</span>
              </motion.div>
            </div>

            <motion.div
              className="relative min-h-[420px] lg:min-h-[480px] bg-gradient-to-br from-[#FEF0E0]/50 to-[#FFFBF5] rounded-3xl border border-[#E8DFD1]/60 overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.3 }}
            >
              {/* Grid background */}
              <svg
                className="absolute inset-0 w-full h-full opacity-[0.05]"
                preserveAspectRatio="xMidYMid slice"
              >
                <defs>
                  <pattern
                    id="hero-grid"
                    width="24"
                    height="24"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 24 0 L 0 0 0 24"
                      fill="none"
                      stroke="#0F1729"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hero-grid)" />
              </svg>

              <SkeletonHero />

              {/* Status badges */}
              <motion.div
                className="absolute top-5 left-6 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-[#E8DFD1]/60"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <span className="text-[10px] font-medium text-[#6B7280]">
                    Pose Active
                  </span>
                </div>
              </motion.div>

              <motion.div
                className="absolute top-5 right-6 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-[#E8DFD1]/60 text-right"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6 }}
              >
                <div className="text-[10px] text-[#6B7280]">Confidence</div>
                <div className="text-lg font-display font-bold text-[#0F1729] leading-tight">
                  97.4%
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-[#0F1729] text-white rounded-full px-5 py-2 flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 }}
              >
                <svg
                  viewBox="0 0 8 8"
                  className="w-2 h-2 fill-current text-green-400"
                >
                  <circle cx="4" cy="4" r="4" />
                </svg>
                <span className="text-xs font-semibold tracking-wide">
                  Posture: Safe
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="bg-white border-y border-[#E8DFD1]/60">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                val: "650k+",
                label: "Live feedbacks & annotations",
                accent: false,
              },
              {
                val: "222",
                label: "Features per frame",
                accent: true,
              },
              {
                val: "33",
                label: "Body landmarks tracked",
                accent: false,
              },
              {
                val: "147k",
                label: "Model parameters",
                accent: false,
              },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="text-center md:text-left">
                  <p
                    className={`font-display text-3xl font-bold tracking-tight leading-none mb-1 ${
                      s.accent ? "text-[#E8613C]" : "text-[#0F1729]"
                    }`}
                  >
                    {s.val}
                  </p>
                  <p className="text-sm text-[#6B7280]">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROBLEM ─── */}
      <section id="problem" className="bg-[#FFFBF5]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-24">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-block text-xs font-semibold text-[#E8613C] uppercase tracking-wider mb-4">
                The Problem
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-5">
                The Problem{" "}
                <span className="text-[#E8613C]">Nobody Sees</span>
              </h2>
              <p className="text-lg text-[#4B5563] leading-relaxed">
                Poor exercise form is a leading cause of gym injuries. Most
                athletes can&apos;t see their own mistakes &mdash; they only
                realize something is wrong after the pain starts.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                ),
                title: "Incorrect Joint Angles",
                desc: "Knee valgus, elbow flare, shoulder impingement — small angular errors that compound into serious injuries over time.",
              },
              {
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                ),
                title: "Poor Spinal Alignment",
                desc: "Lumbar rounding under heavy load creates dangerous shear forces on the spine. A problem invisible to the lifter themselves.",
              },
              {
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                ),
                title: "Asymmetric Movement",
                desc: "Left-right imbalances and uneven loading patterns lead to chronic overuse injuries that develop gradually.",
              },
            ].map((card, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-7 border border-[#E8DFD1]/60 card-lift h-full">
                  <div className="w-12 h-12 bg-[#FEF0E0] rounded-xl flex items-center justify-center mb-5 text-[#E8613C]">
                    {card.icon}
                  </div>
                  <h3 className="font-display text-lg font-bold mb-2 tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <div className="mt-10 bg-[#0F1729] rounded-2xl p-8 text-center navy-gradient">
              <p className="text-[#9CA3AF] text-sm mb-2">
                Current solutions require
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-white font-display font-semibold">
                <span className="bg-white/10 rounded-full px-5 py-2 text-sm">
                  A human coach
                </span>
                <span className="text-[#6B7280] self-center">or</span>
                <span className="bg-white/10 rounded-full px-5 py-2 text-sm">
                  Expensive motion capture
                </span>
              </div>
              <p className="text-[#9CA3AF] text-sm mt-4">
                We need something <span className="text-[#E8613C] font-semibold">accessible</span>, <span className="text-[#E8613C] font-semibold">automatic</span>, and <span className="text-[#E8613C] font-semibold">affordable</span>.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── WHY ML ─── */}
      <section id="why-ml" className="bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <div>
                <span className="inline-block text-xs font-semibold text-[#E8613C] uppercase tracking-wider mb-4">
                  Why Machine Learning
                </span>
                <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
                  Rules Can&apos;t<br />Keep Up
                </h2>
                <p className="text-lg text-[#4B5563] leading-relaxed mb-8">
                  The same joint angle can mean &ldquo;perfect form&rdquo; in one exercise
                  and &ldquo;injury risk&rdquo; in another. Fixed rules break down when the
                  real world is this complex.
                </p>

                <div className="space-y-5">
                  {[
                    {
                      title: "Context-Dependent",
                      desc: "Same knee angle is correct for squats but dangerous for lunges. ML learns the context.",
                    },
                    {
                      title: "High Variability",
                      desc: "Different body types, camera angles, and movement speeds make hard-coded rules impractical.",
                    },
                    {
                      title: "Pattern Recognition",
                      desc: "ML learns from massive datasets (like Qualcomm Exercise Video Dataset) and generalizes across users and environments.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#FEF0E0] rounded-lg flex items-center justify-center mt-0.5">
                        <span className="text-xs font-display font-bold text-[#E8613C]">
                          {i + 1}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-[#0F1729] mb-1">
                          {item.title}
                        </h4>
                        <p className="text-sm text-[#6B7280] leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="relative bg-[#FFFBF5] rounded-2xl p-8 border border-[#E8DFD1]/60">
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-5 border border-[#E8DFD1]/60">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                        <svg viewBox="0 0 16 16" className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" />
                        </svg>
                      </div>
                      <span className="font-display font-bold text-sm text-[#0F1729]">Rule-Based Approach</span>
                    </div>
                    <p className="text-sm text-[#6B7280] leading-relaxed">
                      &ldquo;If knee angle &lt; 90&deg;, flag as unsafe&rdquo;
                    </p>
                    <p className="text-xs text-red-400 mt-2 font-medium">
                      Breaks with different exercises, body types, camera angles
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-5 border border-[#E8DFD1]/60 glow-coral-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-[#FEF0E0] rounded-lg flex items-center justify-center">
                        <svg viewBox="0 0 16 16" className="w-4 h-4 text-[#E8613C]" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="3 8 7 12 13 4" />
                        </svg>
                      </div>
                      <span className="font-display font-bold text-sm text-[#0F1729]">ML Approach</span>
                    </div>
                    <p className="text-sm text-[#6B7280] leading-relaxed">
                      Learns from over 650,000 live feedbacks across multiple exercise datasets
                    </p>
                    <p className="text-xs text-[#E8613C] mt-2 font-medium">
                      Generalizes to new users, angles, and speeds automatically
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── PIPELINE ─── */}
      <section id="pipeline" className="bg-[#FFFBF5]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-24">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-block text-xs font-semibold text-[#E8613C] uppercase tracking-wider mb-4">
                How It Works
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-5">
                Four Simple Steps
              </h2>
              <p className="text-lg text-[#4B5563] leading-relaxed">
                From a standard camera feed to actionable posture feedback in
                real time. No special hardware needed.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                num: "01",
                title: "Record",
                desc: "Point any standard camera at yourself while exercising. Phone, webcam, or gym camera all work.",
                color: "bg-[#FEF0E0]",
                textColor: "text-[#E8613C]",
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                ),
              },
              {
                num: "02",
                title: "Detect",
                desc: "MediaPipe identifies 33 body landmarks in real-time, creating a full skeleton model of your pose.",
                color: "bg-[#0F1729]",
                textColor: "text-white",
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="5" cy="19" r="2" />
                    <circle cx="19" cy="19" r="2" />
                    <line x1="12" y1="7" x2="5" y2="17" />
                    <line x1="12" y1="7" x2="19" y2="17" />
                  </svg>
                ),
              },
              {
                num: "03",
                title: "Analyze",
                desc: "Our TCN model processes 222 features per frame — joint positions, angles, and velocities — to classify your exercise and evaluate form.",
                color: "bg-[#0F1729]",
                textColor: "text-white",
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                ),
              },
              {
                num: "04",
                title: "Feedback",
                desc: 'Get an instant safe/unsafe verdict with specific error flags like "knees collapsing inward" or "elbows flaring".',
                color: "bg-[#FEF0E0]",
                textColor: "text-[#E8613C]",
                icon: (
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ),
              },
            ].map((step, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div
                  className={`rounded-2xl p-7 h-full card-lift ${
                    step.color === "bg-[#0F1729]"
                      ? "bg-[#0F1729] text-white navy-gradient"
                      : "bg-white border border-[#E8DFD1]/60"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                      step.color === "bg-[#0F1729]"
                        ? "bg-white/10 text-white"
                        : "bg-[#FEF0E0] text-[#E8613C]"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div
                    className={`text-xs font-bold mb-2 ${
                      step.color === "bg-[#0F1729]"
                        ? "text-[#E8613C]"
                        : "text-[#E8613C]"
                    }`}
                  >
                    Step {step.num}
                  </div>
                  <h3
                    className={`font-display text-xl font-bold mb-2 tracking-tight ${
                      step.color === "bg-[#0F1729]"
                        ? "text-white"
                        : "text-[#0F1729]"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      step.color === "bg-[#0F1729]"
                        ? "text-[#9CA3AF]"
                        : "text-[#6B7280]"
                    }`}
                  >
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Feature engineering detail */}
          <Reveal delay={0.3}>
            <div className="mt-10 bg-white rounded-2xl border border-[#E8DFD1]/60 p-8 grid md:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <h3 className="font-display text-xl font-bold tracking-tight mb-2">
                  222 features per frame
                </h3>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-5">
                  Each video frame is transformed into a rich feature vector
                  combining spatial positions, joint mechanics, and movement
                  dynamics.
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { val: "99", label: "Landmark coordinates (33 x 3)" },
                    { val: "12", label: "Joint angles via law of cosines" },
                    {
                      val: "111",
                      label: "Velocity features (first-order)",
                    },
                  ].map((f, i) => (
                    <div
                      key={i}
                      className="bg-[#FFFBF5] rounded-xl px-4 py-3 flex items-center gap-3"
                    >
                      <span className="font-display text-xl font-bold text-[#E8613C]">
                        {f.val}
                      </span>
                      <span className="text-xs text-[#6B7280]">
                        {f.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#FEF0E0] rounded-xl px-6 py-4 text-center">
                <p className="font-display text-4xl font-bold text-[#E8613C]">
                  88%
                </p>
                <p className="text-xs text-[#6B7280] mt-1 max-w-[140px]">
                  Reduction in variance via hip-centred normalization
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── DATA ─── */}
      <section id="data" className="bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-24">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-block text-xs font-semibold text-[#E8613C] uppercase tracking-wider mb-4">
                The Datasets
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-5">
                Trained on{" "}
                <span className="text-[#E8613C]">Real Data</span>
              </h2>
              <p className="text-lg text-[#4B5563] leading-relaxed">
                The Qualcomm Exercise Video Dataset (QEVD) and Fitness-AQA provide over 650k+ live feedbacks
                and 4,979 annotated repetitions across compound exercises, with temporal error annotations
                and subject-level splits to guarantee robust modeling.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ExerciseShowcase />
          </Reveal>

          {/* Tech stack */}
          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className="text-xs text-[#6B7280] font-medium mr-2">
                Built with:
              </span>
              {[
                "MediaPipe",
                "PyTorch",
                "TCN",
                "AdamW",
                "Huber Loss",
                "BCE + pos_weight",
              ].map((f) => (
                <span
                  key={f}
                  className="bg-[#FFFBF5] border border-[#E8DFD1] px-4 py-1.5 rounded-full text-xs font-medium text-[#4B5563] hover:border-[#E8613C]/30 hover:bg-[#FEF0E0]/50 transition-all duration-300 cursor-default"
                >
                  {f}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── ARCHITECTURE ─── */}
      <section id="architecture" className="bg-[#FFFBF5]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-24">
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            <div>
              <Reveal>
                <span className="inline-block text-xs font-semibold text-[#E8613C] uppercase tracking-wider mb-4">
                  Architecture
                </span>
                <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-5">
                  Under the Hood
                </h2>
                <p className="text-lg text-[#4B5563] leading-relaxed mb-10">
                  A Temporal Convolutional Network with dual-task heads —
                  lightweight enough for real-time deployment, powerful enough to
                  catch subtle form errors.
                </p>
              </Reveal>

              <div className="space-y-4">
                {[
                  {
                    label: "Why TCN over LSTM?",
                    detail:
                      "All timesteps processed simultaneously — parallelizable on GPU, no sequential bottleneck.",
                  },
                  {
                    label: "Exponential Dilation",
                    detail:
                      "Dilations of 1, 2, 4, 8, 16, 32 — the final block sees the entire 100-frame sequence.",
                  },
                  {
                    label: "Dual Output Heads",
                    detail:
                      "Quality score regression via Huber Loss + error classification via BCE with pos_weight up to 12x for rare errors.",
                  },
                  {
                    label: "Lightweight Model",
                    detail:
                      "Only ~147k parameters. Small enough for mobile deployment, large enough to capture complex biomechanics.",
                  },
                  {
                    label: "Regularization Stack",
                    detail:
                      "Dropout 0.2, weight decay 1e-4, gradient clipping at 1.0, early stopping with patience of 10 epochs.",
                  },
                ].map((row, i) => (
                  <Reveal key={i} delay={i * 0.06}>
                    <div className="bg-white rounded-xl p-5 border border-[#E8DFD1]/60">
                      <h4 className="font-display font-bold text-sm text-[#0F1729] mb-1">
                        {row.label}
                      </h4>
                      <p className="text-sm text-[#6B7280] leading-relaxed">
                        {row.detail}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal delay={0.15} className="lg:sticky lg:top-24">
              <TCNDiagram />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#0F1729] navy-gradient text-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
          <div className="grid md:grid-cols-[1fr_auto] gap-10 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                  <svg
                    viewBox="0 0 20 20"
                    className="w-5 h-5"
                    fill="none"
                    stroke="#FFFBF5"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <circle cx="10" cy="5" r="2.5" />
                    <line x1="10" y1="7.5" x2="10" y2="13" />
                    <line x1="10" y1="9" x2="5" y2="13" />
                    <line x1="10" y1="9" x2="15" y2="13" />
                    <line x1="10" y1="13" x2="6" y2="18" />
                    <line x1="10" y1="13" x2="14" y2="18" />
                  </svg>
                </div>
                <span className="font-display text-lg font-bold">
                  FormCoach
                </span>
              </div>
              <p className="text-sm text-[#9CA3AF] max-w-md leading-relaxed">
                An ML-powered exercise form advisor built by Group 6 at Imperial
                College London. Automatically detects unsafe posture using only a
                standard camera.
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="flex gap-4 text-sm text-[#9CA3AF]">
                <a
                  href="#"
                  className="hover:text-white transition-colors"
                >
                  Slides
                </a>
                <a
                  href="#"
                  className="hover:text-white transition-colors"
                >
                  Dataset
                </a>
                <a
                  href="#"
                  className="hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </div>
              <p className="text-xs text-[#6B7280]">
                Demystifying Machine Learning &middot; 2026
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
