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
  reps: number;
  subjects: number;
  errors: ErrorMetric[];
}

const EXERCISE_DATA: Record<ExerciseId, ExerciseData> = {
  ohp: {
    id: 'ohp',
    label: 'Overhead Press',
    title: 'Overhead Press',
    reps: 1639,
    subjects: 215,
    errors: [
      { label: 'Elbow Flare', value: 14.2, format: 'Temporal' },
      { label: 'Knee Lockout', value: 13.8, format: 'Temporal' },
    ],
  },
  squat: {
    id: 'squat',
    label: 'Back Squat',
    title: 'Back Squat',
    reps: 1934,
    subjects: 251,
    errors: [
      { label: 'Knees Forward', value: 68.1, format: 'Temporal' },
      { label: 'Shallow Depth', value: 31.4, format: 'Binary' },
      { label: 'Knees Inward', value: 13.6, format: 'Temporal' },
    ],
  },
  row: {
    id: 'row',
    label: 'Barbell Row',
    title: 'Barbell Row',
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
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
  },
  exit: { opacity: 0, y: -10 },
};

/* ── Animated Pose Illustrations ── */
const OHPPose = () => {
  const t = { duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" } as const;

  return (
    <svg viewBox="0 0 120 200" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      {/* Ground */}
      <line x1="20" y1="180" x2="100" y2="180" stroke="currentColor" className="text-muted-foreground opacity-30" strokeWidth="2" strokeDasharray="4 4" />

      {/* Legs (Static for OHP) */}
      <line x1="50" y1="100" x2="45" y2="140" stroke="currentColor" className="text-foreground" strokeWidth="2.5" />
      <line x1="45" y1="140" x2="45" y2="180" stroke="currentColor" className="text-foreground" strokeWidth="2.5" />
      <line x1="70" y1="100" x2="75" y2="140" stroke="currentColor" className="text-foreground" strokeWidth="2.5" />
      <line x1="75" y1="140" x2="75" y2="180" stroke="currentColor" className="text-foreground" strokeWidth="2.5" />
      <line x1="35" y1="180" x2="55" y2="180" stroke="currentColor" className="text-foreground" strokeWidth="2.5" /> {/* Feet */}
      <line x1="65" y1="180" x2="85" y2="180" stroke="currentColor" className="text-foreground" strokeWidth="2.5" />

      {/* Torso Base */}
      <line x1="50" y1="100" x2="70" y2="100" stroke="currentColor" className="text-foreground" strokeWidth="2.5" />
      <motion.line x1="50" y1="100" x2="40" y2="50" animate={{ y2: [50, 45, 50] }} transition={t} stroke="currentColor" className="text-foreground" strokeWidth="2.5" />
      <motion.line x1="70" y1="100" x2="80" y2="50" animate={{ y2: [50, 45, 50] }} transition={t} stroke="currentColor" className="text-foreground" strokeWidth="2.5" />
      <motion.line x1="40" y1="50" x2="80" y2="50" animate={{ y1: [50, 45, 50], y2: [50, 45, 50] }} transition={t} stroke="currentColor" className="text-foreground" strokeWidth="2.5" />

      {/* Arms */}
      <motion.line x1="40" y1="50" x2="30" y2="75" animate={{ y1: [50, 45, 50], x2: [30, 35, 30], y2: [75, 30, 75] }} transition={t} stroke="currentColor" className="text-foreground" strokeWidth="2.5" />
      <motion.line x1="30" y1="75" x2="35" y2="50" animate={{ x1: [30, 35, 30], y1: [75, 30, 75], x2: [40, 40, 40], y2: [10, 10, 10] }} transition={t} stroke="currentColor" className="text-foreground" strokeWidth="2.5" />

      <motion.line x1="80" y1="50" x2="90" y2="75" animate={{ y1: [50, 45, 50], x2: [90, 85, 90], y2: [75, 30, 75] }} transition={t} stroke="currentColor" className="text-foreground" strokeWidth="2.5" />
      <motion.line x1="90" y1="75" x2="85" y2="50" animate={{ x1: [90, 85, 90], y1: [75, 30, 75], x2: [80, 80, 80], y2: [10, 10, 10] }} transition={t} stroke="currentColor" className="text-foreground" strokeWidth="2.5" />

      {/* Barbell */}
      <motion.line x1="20" y1="50" x2="100" y2="50" animate={{ y1: [50, 10, 50], y2: [50, 10, 50] }} transition={t} stroke="currentColor" className="text-primary" strokeWidth="3.5" />
      
      {/* Head */}
      <motion.circle cx="60" cy="25" r="9" animate={{ cy: [25, 20, 25] }} transition={t} stroke="currentColor" className="text-foreground fill-background" strokeWidth="2" />

      {/* Joints */}
      <motion.circle cx="40" cy="50" r="3" animate={{ cy: [50, 45, 50] }} transition={t} stroke="currentColor" className="text-foreground fill-background" strokeWidth="1.5" />
      <motion.circle cx="80" cy="50" r="3" animate={{ cy: [50, 45, 50] }} transition={t} stroke="currentColor" className="text-foreground fill-background" strokeWidth="1.5" />
      <motion.circle cx="30" cy="75" r="3" animate={{ cx: [30, 35, 30], cy: [75, 30, 75] }} transition={t} stroke="currentColor" className="text-foreground fill-background" strokeWidth="1.5" />
      <motion.circle cx="90" cy="75" r="3" animate={{ cx: [90, 85, 90], cy: [75, 30, 75] }} transition={t} stroke="currentColor" className="text-foreground fill-background" strokeWidth="1.5" />
    </svg>
  );
};

const SquatPose = () => {
  const t = { duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" } as const;

  return (
    <svg viewBox="0 0 120 200" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      {/* Ground */}
      <line x1="20" y1="170" x2="100" y2="170" stroke="currentColor" className="text-muted-foreground opacity-30" strokeWidth="2" strokeDasharray="4 4" />
      <line x1="70" y1="170" x2="90" y2="170" stroke="currentColor" className="text-foreground" strokeWidth="2.5" /> {/* Foot */}

      {/* Calf */}
      <motion.line x1="70" y1="170" x2="70" y2="120" animate={{ x2: [70, 95, 70], y2: [120, 120, 120] }} transition={t} stroke="currentColor" className="text-foreground" strokeWidth="2.5" />
      {/* Thigh */}
      <motion.line x1="70" y1="120" x2="70" y2="70" animate={{ x1: [70, 95, 70], y1: [120, 120, 120], x2: [70, 45, 70], y2: [70, 130, 70] }} transition={t} stroke="currentColor" className="text-foreground" strokeWidth="2.5" />
      {/* Torso */}
      <motion.line x1="70" y1="70" x2="70" y2="30" animate={{ x1: [70, 45, 70], y1: [70, 130, 70], x2: [70, 75, 70], y2: [30, 75, 30] }} transition={t} stroke="currentColor" className="text-foreground" strokeWidth="2.5" />
      
      {/* Arm */}
      <motion.line x1="70" y1="30" x2="60" y2="45" animate={{ x1: [70, 75, 70], y1: [30, 75, 30], x2: [60, 65, 60], y2: [45, 90, 45] }} transition={t} stroke="currentColor" className="text-foreground" strokeWidth="2.5" />
      <motion.line x1="60" y1="45" x2="70" y2="30" animate={{ x1: [60, 65, 60], y1: [45, 90, 45], x2: [70, 75, 70], y2: [30, 75, 30] }} transition={t} stroke="currentColor" className="text-foreground" strokeWidth="2.5" />

      {/* Head */}
      <motion.circle cx="70" cy="12" r="9" animate={{ cx: [70, 85, 70], cy: [12, 55, 12] }} transition={t} stroke="currentColor" className="text-foreground fill-background" strokeWidth="2" />
      
      {/* Barbell */}
      <motion.circle cx="70" cy="30" r="5" animate={{ cx: [70, 75, 70], cy: [30, 75, 30] }} transition={t} className="fill-primary" />

      {/* Angle Indicator */}
      <motion.path 
        d="M 60 85 A 15 15 0 0 1 70 95" 
        animate={{ d: ["M 65 85 A 15 15 0 0 1 75 95", "M 55 115 A 15 15 0 0 1 65 145", "M 65 85 A 15 15 0 0 1 75 95"], opacity: [0, 1, 0] }} 
        transition={t} stroke="currentColor" className="text-primary" strokeWidth="1.5" fill="none" strokeDasharray="2 2" 
      />

      {/* Joints */}
      <motion.circle cx="70" cy="120" r="3" animate={{ cx: [70, 95, 70], cy: [120, 120, 120] }} transition={t} stroke="currentColor" className="text-foreground fill-background" strokeWidth="1.5" />
      <motion.circle cx="70" cy="70" r="3" animate={{ cx: [70, 45, 70], cy: [70, 130, 70] }} transition={t} stroke="currentColor" className="text-foreground fill-background" strokeWidth="1.5" />
      <motion.circle cx="70" cy="30" r="3" animate={{ cx: [70, 75, 70], cy: [30, 75, 30] }} transition={t} stroke="currentColor" className="text-foreground fill-background" strokeWidth="1.5" />
      <motion.circle cx="60" cy="45" r="3" animate={{ cx: [60, 65, 60], cy: [45, 90, 45] }} transition={t} stroke="currentColor" className="text-foreground fill-background" strokeWidth="1.5" />
    </svg>
  );
};

const RowPose = () => {
  const t = { duration: 1.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" } as const;

  return (
    <svg viewBox="0 0 140 200" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      {/* Ground */}
      <line x1="20" y1="170" x2="120" y2="170" stroke="currentColor" className="text-muted-foreground opacity-30" strokeWidth="2" strokeDasharray="4 4" />
      <line x1="70" y1="170" x2="90" y2="170" stroke="currentColor" className="text-foreground" strokeWidth="2.5" />

      {/* Calf */}
      <line x1="70" y1="170" x2="80" y2="140" stroke="currentColor" className="text-foreground" strokeWidth="2.5" />
      {/* Thigh */}
      <line x1="80" y1="140" x2="40" y2="100" stroke="currentColor" className="text-foreground" strokeWidth="2.5" />
      {/* Torso */}
      <line x1="40" y1="100" x2="90" y2="60" stroke="currentColor" className="text-foreground" strokeWidth="2.5" />
      
      {/* Head */}
      <circle cx="105" cy="45" r="9" stroke="currentColor" className="text-foreground fill-background" strokeWidth="2" />

      {/* Torso Angle Indicator */}
      <path d="M 40 100 L 90 100" stroke="currentColor" className="text-muted-foreground opacity-50" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M 60 100 A 20 20 0 0 0 65 80" stroke="currentColor" className="text-primary" strokeWidth="1.5" fill="none" />
      <text x="68" y="90" fontSize="7" fontFamily="system-ui" fontWeight="600" className="fill-primary">45°</text>

      {/* Arm */}
      <motion.line x1="90" y1="60" x2="85" y2="95" animate={{ x2: [85, 65, 85], y2: [95, 55, 95] }} transition={t} stroke="currentColor" className="text-foreground" strokeWidth="2.5" />
      <motion.line x1="85" y1="95" x2="85" y2="130" animate={{ x1: [85, 65, 85], y1: [95, 55, 95], x2: [85, 75, 85], y2: [130, 95, 130] }} transition={t} stroke="currentColor" className="text-foreground" strokeWidth="2.5" />

      {/* Barbell Plates */}
      <motion.circle cx="85" cy="130" r="14" animate={{ cx: [85, 75, 85], cy: [130, 95, 130] }} transition={t} className="fill-foreground opacity-10" />
      <motion.circle cx="85" cy="130" r="5" animate={{ cx: [85, 75, 85], cy: [130, 95, 130] }} transition={t} className="fill-primary" />

      {/* Joints */}
      <circle cx="80" cy="140" r="3" stroke="currentColor" className="text-foreground fill-background" strokeWidth="1.5" />
      <circle cx="40" cy="100" r="3" stroke="currentColor" className="text-foreground fill-background" strokeWidth="1.5" />
      <circle cx="90" cy="60" r="3" stroke="currentColor" className="text-foreground fill-background" strokeWidth="1.5" />
      <motion.circle cx="85" cy="95" r="3" animate={{ cx: [85, 65, 85], cy: [95, 55, 95] }} transition={t} stroke="currentColor" className="text-foreground fill-background" strokeWidth="1.5" />
      <motion.circle cx="85" cy="130" r="3" animate={{ cx: [85, 75, 85], cy: [130, 95, 130] }} transition={t} stroke="currentColor" className="text-foreground fill-background" strokeWidth="1.5" />
    </svg>
  );
};

const PoseSVG: Record<ExerciseId, React.FC> = { ohp: OHPPose, squat: SquatPose, row: RowPose };

function getBarColor(value: number) {
  if (value > 40) return 'bg-destructive';
  if (value > 20) return 'bg-amber-400';
  return 'bg-primary';
}

export default function ExerciseShowcase() {
  const [active, setActive] = useState<ExerciseId>('squat');
  const data = EXERCISE_DATA[active];
  const Pose = PoseSVG[active];

  return (
    <div className="relative w-full bg-card rounded-2xl overflow-hidden border border-border shadow-lg">
      <div className="grid md:grid-cols-[300px_1fr] min-h-[460px]">
        {/* Left — animated pose */}
        <div className="relative border-r border-border flex items-center justify-center p-8 bg-muted/50">
          <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="ex-grid-new" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ex-grid-new)"/>
          </svg>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-36 h-56"
            >
              <Pose />
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {(Object.keys(EXERCISE_DATA) as ExerciseId[]).map((id) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`relative px-4 py-2 text-xs font-medium rounded-full transition-all duration-300 ${
                  active === id
                    ? 'bg-foreground text-background shadow-lg'
                    : 'bg-background/80 text-muted-foreground hover:text-foreground hover:bg-background border border-border'
                }`}
              >
                {EXERCISE_DATA[id].label}
              </button>
            ))}
          </div>
        </div>

        {/* Right — data panel */}
        <div className="p-8 flex flex-col justify-center bg-card">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div variants={itemVariants} className="mb-6">
                <h3 className="font-display text-2xl font-bold text-foreground tracking-tight">{data.title}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-display font-bold text-primary">{data.reps.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">reps</span>
                  </div>
                  <div className="w-px h-5 bg-border" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-display font-bold text-foreground">{data.subjects}</span>
                    <span className="text-sm text-muted-foreground">subjects</span>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Error Prevalence</p>
                <div className="space-y-4">
                  {data.errors.map((err, idx) => (
                    <div key={err.label}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{err.label}</span>
                          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{err.format}</span>
                        </div>
                        <span className="text-sm font-bold text-foreground">{err.value}%</span>
                      </div>
                      <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden border border-border/50">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${err.value}%` }}
                          transition={{ duration: 1, delay: 0.3 + idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
                          className={`absolute top-0 bottom-0 left-0 rounded-full ${getBarColor(err.value)}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center gap-3 text-xs text-muted-foreground pt-4 border-t border-border">
                <span>~{(data.reps / data.subjects).toFixed(1)} reps/subject</span>
                <span className="w-1 h-1 bg-border rounded-full" />
                <span>Zero subject leakage</span>
                <span className="w-1 h-1 bg-border rounded-full" />
                <span>Train/Val/Test splits</span>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
