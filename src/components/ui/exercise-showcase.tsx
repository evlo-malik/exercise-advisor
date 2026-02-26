'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ExerciseId = 'ohp' | 'squat' | 'row';

interface ErrorMetric {
  label: string;
  value: number;
  format: string;
}

interface ExerciseData {
  id: ExerciseId;
  label: string;
  title: string;
  subtitle: string;
  reps: number;
  subjects: number;
  errors: ErrorMetric[];
}

const EXERCISE_DATA: Record<ExerciseId, ExerciseData> = {
  ohp: {
    id: 'ohp',
    label: 'OHP',
    title: 'Overhead Press',
    subtitle: '1,639 reps · 215 subjects',
    reps: 1639,
    subjects: 215,
    errors: [
      { label: 'Elbow Flare', value: 14.2, format: 'Temporal Interval' },
      { label: 'Knee Lockout', value: 13.8, format: 'Temporal Interval' },
    ],
  },
  squat: {
    id: 'squat',
    label: 'Squat',
    title: 'Back Squat',
    subtitle: '1,934 reps · 251 subjects',
    reps: 1934,
    subjects: 251,
    errors: [
      { label: 'Knees Forward', value: 68.1, format: 'Temporal Interval' },
      { label: 'Shallow Depth', value: 31.4, format: 'Binary' },
      { label: 'Knees Inward', value: 13.6, format: 'Temporal Interval' },
    ],
  },
  row: {
    id: 'row',
    label: 'Row',
    title: 'Barbell Row',
    subtitle: '1,406 reps · 183 subjects',
    reps: 1406,
    subjects: 183,
    errors: [
      { label: 'Torso Angle', value: 48.7, format: 'Binary' },
      { label: 'Lumbar Rounding', value: 45.2, format: 'Binary' },
    ],
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 14, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 120, damping: 22 },
  },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)' },
};

const OHPPose = () => (
  <svg viewBox="0 0 120 200" fill="none" stroke="#0A1628" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <motion.circle cx="60" cy="22" r="8" fill="#F8F9FB" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} />
    <motion.line x1="60" y1="30" x2="60" y2="90" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.6 }} />
    <motion.line x1="60" y1="50" x2="35" y2="42" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.5 }} />
    <motion.line x1="35" y1="42" x2="32" y2="16" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.5 }} />
    <motion.line x1="60" y1="50" x2="85" y2="42" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.5 }} />
    <motion.line x1="85" y1="42" x2="88" y2="16" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.5 }} />
    <motion.line x1="28" y1="16" x2="92" y2="16" stroke="#2563EB" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.5 }} />
    <motion.line x1="60" y1="90" x2="45" y2="140" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.5 }} />
    <motion.line x1="45" y1="140" x2="42" y2="185" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.5 }} />
    <motion.line x1="60" y1="90" x2="75" y2="140" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.5 }} />
    <motion.line x1="75" y1="140" x2="78" y2="185" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.5 }} />
    {/* Elbow angle arcs */}
    <motion.path d="M32,28 A10,10 0 0,1 42,38" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="2 3" fill="none"
      initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 0.8 }} />
    <motion.path d="M78,28 A10,10 0 0,0 88,38" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="2 3" fill="none"
      initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 0.9 }} />
    {/* Joint dots */}
    {[[35,42],[85,42],[32,16],[88,16],[45,140],[75,140],[42,185],[78,185]].map(([cx,cy], i) => (
      <motion.circle key={i} cx={cx} cy={cy} r="3" fill="#F8F9FB" stroke="#0A1628" strokeWidth="1.5"
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 + i * 0.05, type: "spring", stiffness: 300 }} />
    ))}
  </svg>
);

const SquatPose = () => (
  <svg viewBox="0 0 120 200" fill="none" stroke="#0A1628" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <motion.circle cx="60" cy="40" r="8" fill="#F8F9FB" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} />
    <motion.line x1="60" y1="48" x2="60" y2="100" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.6 }} />
    <motion.line x1="60" y1="60" x2="35" y2="80" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.5 }} />
    <motion.line x1="35" y1="80" x2="30" y2="105" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.5 }} />
    <motion.line x1="60" y1="60" x2="85" y2="80" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.5 }} />
    <motion.line x1="85" y1="80" x2="90" y2="105" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.5 }} />
    <motion.line x1="25" y1="105" x2="95" y2="105" stroke="#2563EB" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.55, duration: 0.5 }} />
    {/* Squat legs — bent */}
    <motion.line x1="60" y1="100" x2="40" y2="130" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.5 }} />
    <motion.line x1="40" y1="130" x2="35" y2="170" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.5 }} />
    <motion.line x1="35" y1="170" x2="30" y2="185" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.65, duration: 0.4 }} />
    <motion.line x1="60" y1="100" x2="80" y2="130" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.5 }} />
    <motion.line x1="80" y1="130" x2="85" y2="170" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.5 }} />
    <motion.line x1="85" y1="170" x2="90" y2="185" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.65, duration: 0.4 }} />
    {/* Knee angle highlight */}
    <motion.path d="M34,120 A14,14 0 0,1 48,124" stroke="#2563EB" strokeWidth="1.5" fill="none"
      initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 0.9, duration: 0.5 }} />
    <motion.text x="22" y="120" fontSize="7" fontFamily="monospace" fill="#2563EB"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>90°</motion.text>
    {/* Depth line */}
    <motion.line x1="15" y1="100" x2="105" y2="100" stroke="#2563EB" strokeWidth="0.8" strokeDasharray="4 4"
      initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }} />
    <motion.text x="96" y="97" fontSize="6" fontFamily="monospace" fill="#2563EB"
      initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 1 }}>DEPTH</motion.text>
    {/* Joint dots */}
    {[[35,80],[85,80],[40,130],[80,130],[35,170],[85,170]].map(([cx,cy], i) => (
      <motion.circle key={i} cx={cx} cy={cy} r="3" fill="#F8F9FB" stroke="#0A1628" strokeWidth="1.5"
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 + i * 0.05, type: "spring", stiffness: 300 }} />
    ))}
  </svg>
);

const RowPose = () => (
  <svg viewBox="0 0 140 200" fill="none" stroke="#0A1628" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <motion.circle cx="95" cy="55" r="8" fill="#F8F9FB" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} />
    {/* Spine — angled forward */}
    <motion.line x1="90" y1="62" x2="55" y2="100" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.6 }} />
    {/* Torso angle indicator */}
    <motion.path d="M55,100 L55,70" stroke="#2563EB" strokeWidth="0.8" strokeDasharray="3 3"
      initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1 }} />
    <motion.path d="M60,82 A12,12 0 0,1 63,93" stroke="#2563EB" strokeWidth="1.5" fill="none"
      initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 1.1, duration: 0.5 }} />
    <motion.text x="66" y="88" fontSize="6" fontFamily="monospace" fill="#2563EB"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>45°</motion.text>
    {/* Arms — pulling bar */}
    <motion.line x1="80" y1="72" x2="65" y2="95" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.5 }} />
    <motion.line x1="65" y1="95" x2="58" y2="115" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.5 }} />
    <motion.line x1="80" y1="72" x2="100" y2="85" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.5 }} />
    <motion.line x1="100" y1="85" x2="105" y2="110" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.5 }} />
    {/* Bar */}
    <motion.line x1="50" y1="115" x2="112" y2="110" stroke="#2563EB" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.55, duration: 0.5 }} />
    {/* Legs */}
    <motion.line x1="55" y1="100" x2="40" y2="145" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.5 }} />
    <motion.line x1="40" y1="145" x2="35" y2="185" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.5 }} />
    <motion.line x1="55" y1="100" x2="70" y2="145" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.5 }} />
    <motion.line x1="70" y1="145" x2="75" y2="185" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.5 }} />
    {/* Lumbar curve highlight */}
    <motion.path d="M65,82 Q58,90 57,100" stroke="#EF4444" strokeWidth="2" fill="none" strokeDasharray="3 3"
      initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.6 }} transition={{ delay: 1.2, duration: 0.5 }} />
    {/* Joint dots */}
    {[[65,95],[100,85],[40,145],[70,145]].map(([cx,cy], i) => (
      <motion.circle key={i} cx={cx} cy={cy} r="3" fill="#F8F9FB" stroke="#0A1628" strokeWidth="1.5"
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 + i * 0.05, type: "spring", stiffness: 300 }} />
    ))}
  </svg>
);

const PoseSVG: Record<ExerciseId, React.FC> = { ohp: OHPPose, squat: SquatPose, row: RowPose };

export default function ExerciseShowcase() {
  const [active, setActive] = useState<ExerciseId>('squat');
  const data = EXERCISE_DATA[active];
  const Pose = PoseSVG[active];

  return (
    <div className="relative w-full bg-[#F0F4FA] border border-[#C8D3E8]">
      {/* Corner marks */}
      <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#0A1628] z-10" />
      <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[#0A1628] z-10" />
      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[#0A1628] z-10" />
      <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#0A1628] z-10" />

      <div className="grid md:grid-cols-[280px_1fr] min-h-[420px]">
        {/* Left — animated pose */}
        <div className="relative border-r border-[#C8D3E8] flex items-center justify-center p-6 bg-white/50">
          {/* Grid overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-15" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="ex-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#0A1628" strokeWidth="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ex-grid)"/>
          </svg>

          <div className="absolute top-3 left-4 z-20">
            <span className="text-[8px] font-mono text-[#6B7A99] tracking-[0.2em] uppercase">POSE.RENDER</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.35 }}
              className="relative z-10 w-32 h-52"
            >
              <Pose />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right — data panel */}
        <div className="p-6 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div variants={itemVariants} className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#0A1628] tracking-tight">{data.title}</h3>
                  <p className="text-[10px] font-mono text-[#6B7A99] tracking-widest mt-0.5">{data.subtitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#0A1628] tracking-tighter leading-none">{data.reps.toLocaleString()}</p>
                  <p className="text-[9px] font-mono text-[#6B7A99] tracking-widest">REPS</p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-4">
                <p className="text-[9px] font-mono text-[#6B7A99] tracking-[0.2em] uppercase mb-3">Error Prevalence</p>
                <div className="space-y-3">
                  {data.errors.map((err, idx) => (
                    <div key={err.label}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#0A1628]">{err.label}</span>
                          <span className="text-[8px] font-mono text-[#6B7A99] border border-[#C8D3E8] px-1.5 py-0.5">{err.format}</span>
                        </div>
                        <span className="text-xs font-mono text-[#6B7A99]">{err.value}%</span>
                      </div>
                      <div className="relative h-1.5 w-full bg-[#EDF0F7] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${err.value}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + idx * 0.12 }}
                          className={`absolute top-0 bottom-0 left-0 ${err.value > 40 ? 'bg-[#EF4444]' : err.value > 20 ? 'bg-[#F59E0B]' : 'bg-[#2563EB]'}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center gap-4 text-[10px] font-mono text-[#6B7A99] pt-2 border-t border-[#EDF0F7]">
                <span>{data.subjects} subjects</span>
                <span className="w-px h-3 bg-[#C8D3E8]" />
                <span>~{(data.reps / data.subjects).toFixed(1)} reps/subject</span>
                <span className="w-px h-3 bg-[#C8D3E8]" />
                <span>Zero leakage splits</span>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Switcher */}
          <div className="flex gap-1 mt-4">
            {(Object.keys(EXERCISE_DATA) as ExerciseId[]).map((id) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`relative px-4 py-2 text-[10px] font-mono tracking-[0.15em] uppercase transition-colors ${
                  active === id
                    ? 'bg-[#0A1628] text-[#F8F9FB]'
                    : 'bg-white border border-[#C8D3E8] text-[#6B7A99] hover:text-[#0A1628] hover:border-[#0A1628]'
                }`}
              >
                {EXERCISE_DATA[id].label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}