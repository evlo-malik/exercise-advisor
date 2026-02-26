"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import ExerciseShowcase from "@/components/ui/exercise-showcase";
import { HeroMonochromeLaunch } from "@/components/ui/hero-monochrome";
import { TwitterTestimonialCards } from "@/components/ui/twitter-testimonial-cards";
import ElegantCarousel from "@/components/ui/elegant-carousel";

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
   NEURAL CORE HERO ANIMATION
═══════════════════════════════════════════════ */
const NeuralCoreHero = () => {
  // Create a grid of nodes
  const layers = [
    [ {x: 40, y: 60}, {x: 40, y: 130}, {x: 40, y: 200} ],
    [ {x: 100, y: 40}, {x: 100, y: 90}, {x: 100, y: 140}, {x: 100, y: 190}, {x: 100, y: 240} ],
    [ {x: 160, y: 70}, {x: 160, y: 130}, {x: 160, y: 190} ],
    [ {x: 220, y: 100}, {x: 220, y: 160} ],
    [ {x: 280, y: 130} ]
  ];

  const connections = [];
  for (let i = 0; i < layers.length - 1; i++) {
    for (const source of layers[i]) {
      for (const target of layers[i+1]) {
        connections.push({ source, target });
      }
    }
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#0F1729]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(232,97,60,0.1),_rgba(15,23,41,1))]" />
      
      <svg
        viewBox="0 0 320 280"
        className="relative z-10 w-full max-w-[340px] h-auto"
        fill="none"
      >
        {/* Connections */}
        {connections.map((conn, i) => (
          <motion.line
            key={`conn-${i}`}
            x1={conn.source.x}
            y1={conn.source.y}
            x2={conn.target.x}
            y2={conn.target.y}
            stroke="#1E293B"
            strokeWidth="1.5"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: (i % 4) * 0.5 }}
          />
        ))}

        {/* Moving data pulses along connections */}
        {connections.map((conn, i) => i % 3 === 0 ? (
          <motion.circle
            key={`pulse-${i}`}
            r="2.5"
            fill="#E8613C"
            initial={{ cx: conn.source.x, cy: conn.source.y, opacity: 0 }}
            animate={{ cx: conn.target.x, cy: conn.target.y, opacity: [0, 1, 0] }}
            transition={{ duration: 1.5 + (i % 2), repeat: Infinity, delay: (i % 5) * 0.4, ease: "easeInOut" }}
            style={{ filter: "drop-shadow(0 0 4px #E8613C)" }}
          />
        ) : null)}

        {/* Nodes */}
        {layers.flat().map((node, i) => (
          <g key={`node-${i}`}>
            <circle cx={node.x} cy={node.y} r="12" fill="#0F1729" stroke="#1E293B" strokeWidth="2" />
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="4"
              fill={i % 4 === 0 ? "#E8613C" : "#38BDF8"}
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, delay: (i % 3) * 0.2 }}
            />
          </g>
        ))}

        {/* Scanner line */}
        <motion.line
          x1="20"
          y1="0"
          x2="20"
          y2="280"
          stroke="#38BDF8"
          strokeWidth="1.5"
          initial={{ x1: 20, x2: 20, opacity: 0 }}
          animate={{ x1: 300, x2: 300, opacity: [0, 0.3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
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
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-foreground rounded-xl flex items-center justify-center">
              <svg
                viewBox="0 0 20 20"
                className="w-5 h-5 text-background"
                fill="none"
                stroke="currentColor"
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
            <span className="font-display text-base font-bold tracking-tight text-foreground">
              FitnessAQA
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a
              href="#problem"
              className="hover:text-foreground transition-colors"
            >
              Motivation
            </a>
            <a href="#why-ml" className="hover:text-foreground transition-colors">
              Why ML
            </a>
            <a
              href="#pipeline"
              className="hover:text-foreground transition-colors"
            >
              Pipeline
            </a>
            <a href="#data" className="hover:text-foreground transition-colors">
              Dataset
            </a>
            <a
              href="#architecture"
              className="hover:text-foreground transition-colors"
            >
              Architecture
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-muted-foreground">
              Imperial College
            </span>
            <div className="w-2 h-2 bg-green-400 rounded-full pulse-soft" />
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <HeroMonochromeLaunch />

      {/* ─── STATS BAR ─── */}
      <section className="bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                val: "4,979",
                label: "Annotated repetitions",
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
                      s.accent ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {s.val}
                  </p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROBLEM ─── */}
      <section id="problem" className="bg-background">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <Reveal>
              <div className="text-left mb-16">
                <span className="inline-block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 border border-border px-3 py-1 rounded-full">
                  Motivation
                </span>
                <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-5 text-foreground">
                  The Silent <span className="text-muted-foreground">Epidemic</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Poor exercise form is a major cause of injuries, yet the vast majority of athletes train without real-time supervision. They repeat the exact same errors over and over until they inevitably lead to injury.
                </p>
                <div className="mt-8">
                  <div className="flex flex-wrap gap-4 text-foreground font-display font-semibold mb-4">
                    <span className="bg-background border border-border rounded-full px-5 py-2 text-sm">
                      Human supervision
                    </span>
                    <span className="text-muted-foreground self-center">or</span>
                    <span className="bg-background border border-border rounded-full px-5 py-2 text-sm">
                      Hardware-heavy motion capture systems
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Current solutions are completely unscalable. Our objective is to automatically evaluate posture and classify exercises to provide corrective feedback using a <span className="text-primary font-bold">software-based</span> alternative on standard RGB video.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.2} className="flex justify-center lg:justify-end min-h-[350px] lg:min-h-full py-10 lg:py-0 lg:pl-10 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent z-10 w-20 pointer-events-none hidden lg:block" />
              <div className="relative z-0 scale-90 sm:scale-100 transform origin-left md:origin-center lg:origin-right">
                <TwitterTestimonialCards />
              </div>
            </Reveal>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 mt-16">
            {[
              {
                image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800",
                icon: (
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                ),
                title: "Incorrect Joint Angles",
                desc: "Knee valgus, elbow flare, shoulder impingement — small angular errors that compound into serious injuries over time.",
              },
              {
                image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800",
                icon: (
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                ),
                title: "Poor Spinal Alignment",
                desc: "Lumbar rounding under heavy load creates dangerous shear forces on the spine. A problem invisible to the lifter themselves.",
              },
              {
                image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800",
                icon: (
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                ),
                title: "Asymmetric Movement",
                desc: "Left-right imbalances and uneven loading patterns lead to chronic overuse injuries that develop gradually.",
              },
            ].map((card, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="bg-card rounded-2xl border border-border card-lift h-full overflow-hidden flex flex-col group">
                  <div className="h-48 w-full relative bg-muted overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={card.image} 
                      alt={card.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 grayscale hover:grayscale-0" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    <div className="absolute bottom-5 left-5 bg-background text-foreground border border-border p-2.5 rounded-xl shadow-lg">
                      {card.icon}
                    </div>
                  </div>
                  <div className="p-7 flex-1 flex flex-col bg-card">
                    <h3 className="font-display text-lg font-bold mb-2 tracking-tight text-foreground">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div className="relative z-10 mx-auto w-full max-w-[1200px] mt-24">
              <ElegantCarousel />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── WHY ML ─── */}
      <section id="why-ml" className="bg-card">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <div>
                <span className="inline-block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 border border-border px-3 py-1 rounded-full">
                  Why Machine Learning
                </span>
                <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 text-foreground">
                  Rules Can&apos;t<br />Keep Up
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
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
                      desc: "ML learns from massive datasets (like Fitness-AQA) and generalizes across users and environments.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-background border border-border rounded-lg flex items-center justify-center mt-0.5">
                        <span className="text-xs font-display font-bold text-foreground">
                          {i + 1}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-foreground mb-1">
                          {item.title}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="relative bg-background rounded-2xl p-8 border border-border">
                <div className="space-y-6">
                  <div className="bg-card rounded-xl p-5 border border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-background border border-border rounded-lg flex items-center justify-center">
                        <svg viewBox="0 0 16 16" className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" />
                        </svg>
                      </div>
                      <span className="font-display font-bold text-sm text-foreground">Rule-Based Approach</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      &ldquo;If knee angle &lt; 90&deg;, flag as unsafe&rdquo;
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 font-medium">
                      Breaks with different exercises, body types, camera angles
                    </p>
                  </div>

                  <div className="bg-card rounded-xl p-5 border border-border shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-background border border-border rounded-lg flex items-center justify-center">
                        <svg viewBox="0 0 16 16" className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="3 8 7 12 13 4" />
                        </svg>
                      </div>
                      <span className="font-display font-bold text-sm text-foreground">ML Approach</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Learns from 4,979 annotated repetitions across the Fitness-AQA dataset
                    </p>
                    <p className="text-xs text-primary mt-2 font-medium">
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
      <section id="pipeline" className="bg-background">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-24">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 border border-border px-3 py-1 rounded-full">
                Proposed Pipeline
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-5 text-foreground">
                End-to-End Architecture
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                A multi-stage machine learning pipeline performing pose extraction, feature normalization, and temporal action quality assessment.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                num: "01",
                title: "Input Data",
                desc: "Unprocessed video clips representing single repetitions of compound barbell exercises, capturing high variance in tempo and camera angles.",
                color: "bg-secondary",
                textColor: "text-foreground",
                icon: (
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                ),
              },
              {
                num: "02",
                title: "Pose Estimation",
                desc: "MediaPipe extracts 33 body landmarks per frame. Missing frames are linearly interpolated and coordinates are normalized using shoulder width and hip centering.",
                color: "bg-primary",
                textColor: "text-primary-foreground",
                icon: (
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
                title: "Temporal Processing",
                desc: "A Temporal Convolutional Network (TCN) processes 222 biomechanical features (coordinates, 12 joint angles, velocities) over a fixed sequence of 100 frames.",
                color: "bg-primary",
                textColor: "text-primary-foreground",
                icon: (
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                ),
              },
              {
                num: "04",
                title: "Multi-Task Output",
                desc: "Dual heads perform classification to predict specific form errors and regression to generate a composite score of exercise quality.",
                color: "bg-secondary",
                textColor: "text-foreground",
                icon: (
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ),
              },
            ].map((step, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className={`rounded-2xl p-7 h-full card-lift border border-border ${step.color} ${step.textColor}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border ${step.color === 'bg-primary' ? 'bg-primary-foreground/10 border-primary-foreground/20' : 'bg-background border-border'}`}>
                    {step.icon}
                  </div>
                  <div className={`text-xs font-bold mb-2 ${step.color === 'bg-primary' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    Step {step.num}
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2 tracking-tight">
                    {step.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${step.color === 'bg-primary' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <div className="mt-10 bg-card rounded-2xl border border-border p-8 grid md:grid-cols-[1fr_auto] gap-8 items-center shadow-lg">
              <div>
                <h3 className="font-display text-xl font-bold tracking-tight mb-2 text-foreground">
                  222 features per frame
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  Each video frame is transformed into a rich feature vector
                  combining spatial positions, joint mechanics, and movement
                  dynamics.
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { val: "99", label: "Landmark coordinates (33 x 3)" },
                    { val: "12", label: "Joint angles via law of cosines" },
                    { val: "111", label: "Velocity features (first-order)" },
                  ].map((f, i) => (
                    <div key={i} className="bg-background border border-border rounded-xl px-4 py-3 flex items-center gap-3">
                      <span className="font-display text-xl font-bold text-foreground">
                        {f.val}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {f.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-background border border-border rounded-xl px-6 py-4 text-center">
                <p className="font-display text-4xl font-bold text-foreground">
                  88%
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[140px]">
                  Reduction in variance via hip-centred normalization
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── DATA ─── */}
      <section id="data" className="bg-card">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-24">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 border border-border px-3 py-1 rounded-full">
                The Datasets
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-5 text-foreground">
                Trained on <span className="text-muted-foreground">Real Data</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The Fitness-AQA dataset provides 4,979 annotated repetitions across compound exercises, with temporal error annotations
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
              <span className="text-xs text-muted-foreground font-medium mr-2">
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
                  className="bg-background border border-border px-4 py-1.5 rounded-full text-xs font-medium text-foreground hover:bg-secondary transition-all duration-300 cursor-default"
                >
                  {f}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── ARCHITECTURE ─── */}
      <section id="architecture" className="bg-background">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-24">
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            <div>
              <Reveal>
                <span className="inline-block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 border border-border px-3 py-1 rounded-full">
                  Architecture
                </span>
                <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-5 text-foreground">
                  Under the Hood
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-10">
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
                    <div className="bg-card rounded-xl p-5 border border-border hover:border-foreground/20 transition-colors">
                      <h4 className="font-display font-bold text-sm text-foreground mb-1">
                        {row.label}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {row.detail}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal delay={0.15} className="lg:sticky lg:top-24">
              <div className="bg-card rounded-3xl border border-border shadow-lg p-8 overflow-hidden relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Model Architecture
                  </span>
                  <span className="flex h-6 items-center rounded-full bg-foreground/10 px-2.5 text-[10px] font-medium text-foreground uppercase tracking-widest">
                    TCN Core
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-foreground tracking-tight mb-6">
                  Temporal Convolutional Network
                </h3>

                <svg viewBox="0 0 320 120" className="w-full h-auto mb-6" fill="none">
                  {/* Input */}
                  <motion.rect x="0" y="35" width="60" height="50" rx="8"
                    fill="currentColor" className="text-muted" stroke="currentColor" strokeWidth="1" style={{ fillOpacity: 0.4 }}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
                  />
                  <motion.text x="30" y="56" fontSize="7" fontFamily="system-ui" fontWeight="600" textAnchor="middle"
                    fill="currentColor" className="text-foreground"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    100 frames
                  </motion.text>
                  <motion.text x="30" y="69" fontSize="7" fontFamily="system-ui" textAnchor="middle"
                    fill="currentColor" className="text-muted-foreground"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
                    222 features
                  </motion.text>

                  {/* Arrow */}
                  <motion.line x1="62" y1="60" x2="82" y2="60" stroke="currentColor" className="text-border" strokeWidth="2"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.3 }}
                  />
                  <motion.polygon points="80,56 87,60 80,64" fill="currentColor" className="text-muted-foreground"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                  />

                  {/* TCN blocks */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <motion.g key={i}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                    >
                      <rect
                        x={90 + i * 28} y={25 + i * 3} width={24} height={70 - i * 6} rx="4"
                        fill="currentColor" className={i < 3 ? "text-muted" : "text-foreground"}
                        stroke="currentColor" strokeWidth="0.5"
                        style={{ fillOpacity: i < 3 ? 0.35 : 1 }}
                      />
                      <text x={102 + i * 28} y={63} fontSize="5" fontFamily="system-ui" fontWeight="700"
                        textAnchor="middle" fill="currentColor" className={i < 3 ? "text-foreground" : "text-background"}>
                        d={Math.pow(2, i)}
                      </text>
                    </motion.g>
                  ))}

                  {/* Arrow to output */}
                  <motion.line x1="258" y1="60" x2="274" y2="60" stroke="currentColor" className="text-border" strokeWidth="2"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.2, duration: 0.3 }}
                  />
                  <motion.polygon points="272,56 279,60 272,64" fill="currentColor" className="text-muted-foreground"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
                  />

                  {/* Score head */}
                  <motion.rect x="282" y="20" width="36" height="30" rx="6"
                    fill="currentColor" className="text-primary"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
                  />
                  <motion.text x="300" y="39" fontSize="6" fontFamily="system-ui" fontWeight="700"
                    fill="currentColor" className="text-primary-foreground" textAnchor="middle"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                    Score
                  </motion.text>

                  {/* Errors head */}
                  <motion.rect x="282" y="55" width="36" height="30" rx="6"
                    fill="currentColor" className="text-foreground"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.45 }}
                  />
                  <motion.text x="300" y="74" fontSize="6" fontFamily="system-ui" fontWeight="700"
                    fill="currentColor" className="text-background" textAnchor="middle"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.55 }}>
                    Errors
                  </motion.text>
                </svg>

                <div className="grid grid-cols-3 gap-3 pt-5 border-t border-border">
                  {[
                    { val: "147k", label: "Parameters" },
                    { val: "6", label: "TCN Blocks" },
                    { val: "100+", label: "Receptive Field" },
                  ].map((s, i) => (
                    <div key={i} className="bg-background rounded-xl py-3 px-2 text-center border border-border">
                      <p className="font-display text-lg font-bold text-foreground leading-none">
                        {s.val}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-card border-t border-border">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
          <div className="grid md:grid-cols-[1fr_auto] gap-10 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-background rounded-xl flex items-center justify-center border border-border">
                  <svg viewBox="0 0 20 20" className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="10" cy="5" r="2.5" />
                    <line x1="10" y1="7.5" x2="10" y2="13" />
                    <line x1="10" y1="9" x2="5" y2="13" />
                    <line x1="10" y1="9" x2="15" y2="13" />
                    <line x1="10" y1="13" x2="6" y2="18" />
                    <line x1="10" y1="13" x2="14" y2="18" />
                  </svg>
                </div>
                <span className="font-display text-lg font-bold text-foreground">
                  FitnessAQA
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                An ML-powered exercise form advisor built by Group 6 at Imperial
                College London. Automatically detects unsafe posture using only a
                standard camera.
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <p className="text-xs text-muted-foreground">
                Demystifying Machine Learning &middot; 2026
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
