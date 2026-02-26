"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

const STYLE_ID = "hero1-animations";

export const getRootTheme = () => {
  if (typeof document === "undefined") {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "dark"; // Defaulting to dark for our monochrome aesthetic
  }

  const root = document.documentElement;
  if (root.classList.contains("dark")) return "dark";
  if (root.getAttribute("data-theme") === "dark" || root.dataset?.theme === "dark") return "dark";
  if (root.classList.contains("light")) return "light";

  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return "dark";
};

export const useThemeSync = () => {
  const [theme, setTheme] = useState(() => getRootTheme());

  useEffect(() => {
    if (typeof document === "undefined") return;

    // Default to dark mode on initial load for our ML project
    document.documentElement.classList.add("dark");

    const sync = () => {
      const next = getRootTheme();
      setTheme((prev) => (prev === next ? prev : next));
    };

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    const media =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;

    const onMedia = () => sync();
    media?.addEventListener("change", onMedia);

    const onStorage = (event: StorageEvent) => {
      if (event.key === "hero-theme" || event.key === "bento-theme") sync();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
    }

    return () => {
      observer.disconnect();
      media?.removeEventListener("change", onMedia);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", onStorage);
      }
    };
  }, []);

  return [theme, setTheme] as const;
};

const AnimatedGlyph = ({ variant = "signal", theme = "dark" }) => {
  const stroke = theme === "dark" ? "#f5f5f5" : "#111111";
  const fill = theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(17,17,17,0.08)";

  if (variant === "satellite") {
    return (
      <svg viewBox="0 0 120 120" className="h-16 w-16" aria-hidden>
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke={stroke}
          strokeWidth="1.4"
          className="motion-safe:animate-[hero1-orbit_8s_linear_infinite] motion-reduce:animate-none"
          style={{ strokeDasharray: "12 10" }}
        />
        <circle cx="60" cy="60" r="30" fill={fill} />
        <circle
          cx="60"
          cy="12"
          r="6"
          fill={stroke}
          className="motion-safe:animate-[hero1-node_2.8s_ease-in-out_infinite] motion-reduce:animate-none"
        />
        <circle cx="60" cy="60" r="3" fill={stroke} />
      </svg>
    );
  }

  if (variant === "beacon") {
    return (
      <svg viewBox="0 0 120 120" className="h-16 w-16" aria-hidden>
        <rect
          x="26"
          y="26"
          width="68"
          height="68"
          rx="18"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.5"
          className="motion-safe:animate-[hero1-pulse_4.5s_ease-in-out_infinite] motion-reduce:animate-none"
        />
        <path
          d="M60 38v44"
          stroke={stroke}
          strokeWidth="3"
          strokeLinecap="round"
          className="motion-safe:animate-[hero1-trace_6s_ease-in-out_infinite] motion-reduce:animate-none"
        />
        <path
          d="M42 60h36"
          stroke={stroke}
          strokeWidth="3"
          strokeLinecap="round"
          className="motion-safe:animate-[hero1-trace_6s_ease-in-out_infinite] motion-reduce:animate-none"
          style={{ animationDelay: "0.45s" }}
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 120" className="h-16 w-16" aria-hidden>
      <circle cx="60" cy="60" r="52" fill="none" stroke={stroke} strokeWidth="1.5" />
      <path
        d="M22 60c8-18 20-28 38-28s30 10 38 28"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        className="motion-safe:animate-[hero1-scan_5.4s_cubic-bezier(.45,0,.2,1)_infinite] motion-reduce:animate-none"
      />
      <path
        d="M22 60c8 18 20 28 38 28s30-10 38-28"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        className="motion-safe:animate-[hero1-scan_5.4s_cubic-bezier(.45,0,.2,1)_infinite] motion-reduce:animate-none"
        style={{ animationDelay: "1.2s" }}
      />
      <circle
        cx="60"
        cy="60"
        r="6"
        fill={stroke}
        className="motion-safe:animate-[hero1-node_3.6s_ease-in-out_infinite] motion-reduce:animate-none"
      />
    </svg>
  );
};

export function HeroMonochromeLaunch() {
  const [theme, setTheme] = useThemeSync();
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.innerHTML = `
      @keyframes hero1-intro {
        0% { opacity: 0; transform: translate3d(0, 48px, 0); }
        60% { filter: blur(0); }
        100% { opacity: 1; transform: translate3d(0, 0, 0); }
      }
      @keyframes hero1-card {
        0% { opacity: 0; transform: translate3d(0, 24px, 0); }
        100% { opacity: 1; transform: translate3d(0, 0, 0); }
      }
      @keyframes hero1-orbit {
        0% { stroke-dashoffset: 0; transform: rotate(0deg); }
        100% { stroke-dashoffset: -44; transform: rotate(360deg); }
      }
      @keyframes hero1-node {
        0%, 100% { transform: translateY(0); opacity: 1; }
        50% { transform: translateY(6px); opacity: 0.6; }
      }
      @keyframes hero1-trace {
        0%, 30% { stroke-dasharray: 0 160; opacity: 0; }
        45%, 65% { stroke-dasharray: 160 0; opacity: 1; }
        100% { stroke-dasharray: 0 160; opacity: 0; }
      }
      @keyframes hero1-pulse {
        0%, 100% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.04); opacity: 1; }
      }
      @keyframes hero1-scan {
        0%, 25% { stroke-dasharray: 0 180; opacity: 0; }
        45%, 70% { stroke-dasharray: 180 0; opacity: 1; }
        100% { stroke-dasharray: 0 180; opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  useEffect(() => {
    if (!sectionRef.current || typeof window === "undefined") {
      setVisible(true);
      return;
    }

    const node = sectionRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const current = getRootTheme();
    const next = current === "dark" ? "light" : "dark";
    root.classList.toggle("dark", next === "dark");
    root.classList.toggle("light", next === "light");
    root.setAttribute("data-theme", next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage?.setItem("hero-theme", next);
      } catch (_err) {
        /* ignore */
      }
    }
    setTheme(next);
  };

  const palette = useMemo(
    () =>
      theme === "dark"
        ? {
            surface: "bg-[#050505] text-white",
            subtle: "text-white/60",
            border: "border-white/12",
            highlight: "bg-white/10",
            accent: "bg-white/5",
            shadow: "shadow-[0_40px_120px_-60px_rgba(255,255,255,0.35)]",
            background: {
              color: "#050505",
              overlays: [
                "radial-gradient(ellipse 65% 90% at 12% -10%, rgba(255,255,255,0.11), transparent 62%)",
                "radial-gradient(ellipse 45% 65% at 88% -20%, rgba(120,120,120,0.08), transparent 70%)",
              ],
              dots:
                "radial-gradient(circle at 25% 25%, rgba(250,250,250,0.08) 0.65px, transparent 1px), radial-gradient(circle at 75% 75%, rgba(250,250,250,0.08) 0.65px, transparent 1px)",
            },
          }
        : {
            surface: "bg-[#f5f5f4] text-neutral-950",
            subtle: "text-neutral-600",
            border: "border-neutral-200/80",
            highlight: "bg-neutral-100",
            accent: "bg-neutral-100/60",
            shadow: "shadow-[0_40px_120px_-60px_rgba(15,15,15,0.25)]",
            background: {
              color: "#f5f5f4",
              overlays: [
                "radial-gradient(ellipse 65% 90% at 12% -10%, rgba(15,15,15,0.08), transparent 62%)",
                "radial-gradient(ellipse 45% 65% at 88% -20%, rgba(15,15,15,0.06), transparent 70%)",
              ],
              dots:
                "radial-gradient(circle at 25% 25%, rgba(17,17,17,0.12) 0.65px, transparent 1px), radial-gradient(circle at 75% 75%, rgba(17,17,17,0.08) 0.65px, transparent 1px)",
            },
          },
    [theme]
  );

  const showcaseImage = {
    src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&auto=format&fit=crop&q=80",
    alt: "Gym athlete overhead press in monochrome lighting",
  };

  const setSpotlight = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    target.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };

  const clearSpotlight = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    target.style.removeProperty("--spot-x");
    target.style.removeProperty("--spot-y");
  };

  return (
    <div className={`relative isolate w-full transition-colors duration-700 ${palette.surface}`}>
      <div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          backgroundColor: palette.background.color,
          backgroundImage: palette.background.overlays.join(", "),
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-80"
        style={{
          backgroundImage: palette.background.dots,
          backgroundSize: "12px 12px",
          backgroundRepeat: "repeat",
        }}
      />

      <section
        ref={sectionRef}
        className={`relative flex min-h-[90vh] w-full flex-col gap-16 px-6 py-24 transition-opacity duration-700 md:gap-20 md:px-10 lg:px-16 xl:px-24 max-w-[1400px] mx-auto ${
          visible ? "motion-safe:animate-[hero1-intro_1s_cubic-bezier(.25,.9,.3,1)_forwards]" : "opacity-0"
        }`}
      >
        <header className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end flex-1">
          <div className="space-y-8">
            <div className="flex items-center gap-4 text-xs uppercase tracking-[0.4em]">
              <span className={`rounded-full border px-4 py-1 ${palette.border} ${palette.accent}`}>Fitness-AQA</span>
              <span className={palette.subtle}>ML / Computer Vision</span>
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl font-display font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl text-balance">
                Evaluate human motion with precision and deep networks.
              </h1>
              <p className={`max-w-2xl text-base md:text-lg ${palette.subtle}`}>
                A pose-based machine learning pipeline that automatically detects unsafe exercise form using standard camera input, utilizing MediaPipe and Temporal Convolutional Networks.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={toggleTheme}
                className={`group inline-flex items-center gap-3 rounded-full border px-6 py-3 text-sm font-medium transition duration-500 ${palette.border} ${palette.accent}`}
              >
                <span className="relative flex h-6 w-6 items-center justify-center">
                  <span className="absolute inset-0 rounded-full border border-current opacity-30" />
                  <span className="h-2.5 w-2.5 rounded-full bg-current transition-transform duration-500 group-hover:scale-110" />
                </span>
                {theme === "dark" ? "Activate Light Mode" : "Activate Dark Mode"}
              </button>
              <a
                href="#pipeline"
                className={`inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition duration-500 sm:ml-4 ${palette.border} hover:translate-y-[-2px]`}
              >
                Explore Architecture
                <span aria-hidden className="text-lg font-display">↗</span>
              </a>
            </div>
          </div>

          <div className="relative flex h-full w-full items-stretch overflow-hidden rounded-3xl border backdrop-blur-xl">
            <div className={`absolute inset-0 -z-10 rounded-3xl ${palette.border} ${palette.highlight}`} />
            <figure className="relative flex w-full flex-col">
              <div className="relative w-full overflow-hidden rounded-t-3xl sm:rounded-3xl lg:rounded-3xl h-full min-h-[400px]">
                <img
                  src={showcaseImage.src}
                  alt={showcaseImage.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover grayscale opacity-90 transition duration-700 ease-out hover:scale-[1.02]"
                />
                <span
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/50 mix-blend-soft-light dark:from-black/40"
                />
                <div className="pointer-events-none absolute inset-0 border border-white/10 mix-blend-overlay dark:border-white/20" />
                <div className="pointer-events-none absolute top-6 left-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-black/40 backdrop-blur-md dark:border-white/20">
                    <AnimatedGlyph variant="beacon" theme="dark" />
                  </div>
                </div>
                <span className="pointer-events-none absolute bottom-10 right-10 h-24 w-24 rounded-full border border-white/10 opacity-60 motion-safe:animate-[hero1-orbit_8s_linear_infinite]" />
                
                {/* Simulated joint tracking overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center mix-blend-overlay opacity-80">
                   <svg viewBox="0 0 200 200" className="w-full h-full" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none">
                     <circle cx="100" cy="40" r="4" fill="rgba(255,255,255,0.8)" />
                     <circle cx="70" cy="60" r="3" fill="rgba(255,255,255,0.8)" />
                     <circle cx="130" cy="60" r="3" fill="rgba(255,255,255,0.8)" />
                     <line x1="70" y1="60" x2="100" y2="40" />
                     <line x1="130" y1="60" x2="100" y2="40" />
                   </svg>
                </div>
              </div>
              <figcaption className={`flex items-center justify-between px-6 py-5 text-xs uppercase tracking-[0.35em] ${palette.subtle} absolute bottom-0 left-0 w-full bg-black/40 backdrop-blur-md border-t border-white/10`}>
                <span>Pose Capture</span>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                  TCN Stream
                </span>
              </figcaption>
            </figure>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { title: "222 Features/Frame", desc: "Normalized Joint Velocities" },
            { title: "147k Parameters", desc: "Lightweight TCN Core" },
            { title: "Zero Data Leakage", desc: "Strict Subject Splits" }
          ].map((item, index) => (
            <div
              key={item.title}
              onMouseMove={setSpotlight}
              onMouseLeave={clearSpotlight}
              className={`group relative overflow-hidden rounded-2xl border px-6 py-6 text-sm transition duration-500 ${
                palette.border
              } ${palette.highlight}`}
            >
              <span className={`block text-[10px] uppercase tracking-[0.3em] ${palette.subtle}`}>{item.desc}</span>
              <span className="mt-4 block text-lg font-display tracking-tight">{item.title}</span>
              <span
                className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(220px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(255,255,255,0.08), transparent 72%)",
                }}
              />
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full border border-current/10 opacity-70"
                style={{ animationDelay: `${index * 0.35}s` }}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
