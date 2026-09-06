"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface SlideData {
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  imageUrl: string;
}

const slides: SlideData[] = [
  {
    title: "Invisible Errors",
    subtitle: "The Anatomy of Injury",
    description:
      "Knee valgus, elbow flare, shoulder impingement — small angular errors that compound into serious injuries over time, entirely invisible to the lifter without real-time tracking.",
    accent: "#E8613C",
    imageUrl:
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=900&h=1200&fit=crop&q=80",
  },
  {
    title: "Structural Failure",
    subtitle: "Under Heavy Load",
    description:
      "Lumbar rounding creates dangerous shear forces on the spine. It’s a biomechanical issue that must be caught instantly before chronic damage occurs.",
    accent: "#52525B",
    imageUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&h=1200&fit=crop&q=80",
  },
  {
    title: "Asymmetric Loading",
    subtitle: "Chronic Imbalance",
    description:
      "Left-right imbalances and uneven loading patterns lead to overuse injuries that develop gradually. Our TCN maps both sides of the body simultaneously.",
    accent: "#A1A1AA",
    imageUrl:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=900&h=1200&fit=crop&q=80",
  },
  {
    title: "Blind Spots",
    subtitle: "Depth & Tempo",
    description:
      "Hitting parallel requires precise feedback. With real-time MediaPipe joint tracking, we instantly flag shallow reps and erratic movement velocities.",
    accent: "#3F3F46",
    imageUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&h=1200&fit=crop&q=80",
  },
];

const STYLE_ID = "elegant-carousel-styles";

export default function ElegantCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const SLIDE_DURATION = 6000;
  const TRANSITION_DURATION = 800;

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.innerHTML = `
      .carousel-wrapper {
        position: relative;
        width: 100%;
        overflow: hidden;
        border-radius: 1.5rem;
        background-color: var(--background);
        border: 1px solid var(--border);
        color: var(--foreground);
        font-family: inherit;
      }
      .carousel-bg-wash {
        position: absolute;
        inset: 0;
        opacity: 0.5;
        transition: background 1.2s ease;
        pointer-events: none;
      }
      .carousel-inner {
        position: relative;
        display: grid;
        grid-template-columns: 1fr;
        min-height: 600px;
        z-index: 10;
      }
      @media (min-width: 768px) {
        .carousel-inner {
          grid-template-columns: 1fr 1fr;
          min-height: 500px;
        }
      }
      .carousel-content {
        padding: 3rem 2rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      @media (min-width: 768px) {
        .carousel-content {
          padding: 4rem;
        }
      }
      .carousel-content-inner {
        position: relative;
        max-width: 400px;
        margin: 0 auto;
        width: 100%;
      }
      .carousel-collection-num {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-family: var(--font-mono), monospace;
        font-size: 0.75rem;
        letter-spacing: 0.1em;
        color: var(--muted-foreground);
        margin-bottom: 2.5rem;
      }
      .carousel-num-line {
        height: 1px;
        width: 2rem;
        background-color: currentColor;
      }
      .carousel-title {
        font-family: var(--font-mono), monospace;
        font-size: 2.5rem;
        line-height: 1.1;
        font-weight: 600;
        margin-bottom: 1rem;
        letter-spacing: -0.02em;
        color: var(--foreground);
      }
      @media (min-width: 768px) {
        .carousel-title { font-size: 3rem; }
      }
      .carousel-subtitle {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        font-weight: 600;
        margin-bottom: 2rem;
        transition: color 0.8s ease;
      }
      .carousel-description {
        color: var(--muted-foreground);
        font-size: 0.95rem;
        line-height: 1.7;
        margin-bottom: 3rem;
      }
      .carousel-nav-arrows {
        display: flex;
        gap: 1rem;
      }
      .carousel-arrow-btn {
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        border: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--foreground);
        background: transparent;
        transition: all 0.3s ease;
        cursor: pointer;
      }
      .carousel-arrow-btn:hover {
        background: var(--foreground);
        color: var(--background);
      }
      .carousel-image-container {
        position: relative;
        padding: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      @media (min-width: 768px) {
        .carousel-image-container { padding: 4rem 4rem 4rem 0; }
      }
      .carousel-image-frame {
        position: relative;
        width: 100%;
        height: 100%;
        aspect-ratio: 3/4;
        overflow: hidden;
        border-radius: 1rem;
        background: var(--muted);
      }
      .carousel-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: grayscale(80%);
        transition: transform 6s ease-out, filter 1.2s ease;
      }
      .carousel-wrapper:hover .carousel-image {
        transform: scale(1.05);
        filter: grayscale(40%);
      }
      .carousel-image-overlay {
        position: absolute;
        inset: 0;
        mix-blend-mode: multiply;
        transition: background 1.2s ease;
      }
      .carousel-progress-bar {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        background: var(--border);
        height: 3px;
        z-index: 20;
      }
      .carousel-progress-item {
        flex: 1;
        position: relative;
        cursor: pointer;
        border: none;
        background: transparent;
        padding: 0;
      }
      .carousel-progress-track {
        position: absolute;
        inset: 0;
        background: transparent;
      }
      .carousel-progress-fill {
        height: 100%;
        background: var(--foreground);
        transition: width 0.1s linear, background-color 0.8s ease;
      }
      
      /* Transitions */
      .visible {
        opacity: 1;
        transform: translateY(0);
        transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .transitioning {
        opacity: 0;
        transform: translateY(16px);
        transition: opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      }
      
      /* Staggering */
      .carousel-collection-num { transition-delay: 0.1s; }
      .carousel-title { transition-delay: 0.15s; }
      .carousel-subtitle { transition-delay: 0.2s; }
      .carousel-description { transition-delay: 0.25s; }
      
      .transitioning.carousel-collection-num { transition-delay: 0s; transform: translateY(-8px); }
      .transitioning.carousel-title { transition-delay: 0.05s; transform: translateY(-8px); }
      .transitioning.carousel-subtitle { transition-delay: 0.1s; transform: translateY(-8px); }
      .transitioning.carousel-description { transition-delay: 0.15s; transform: translateY(-8px); }
      
      .carousel-image-frame.visible {
        opacity: 1;
        transform: scale(1);
        transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .carousel-image-frame.transitioning {
        opacity: 0.5;
        transform: scale(0.97);
        transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      }
    `;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  const goToSlide = useCallback(
    (index: number, dir?: "next" | "prev") => {
      if (isTransitioning || index === currentIndex) return;
      setDirection(dir || (index > currentIndex ? "next" : "prev"));
      setIsTransitioning(true);
      setProgress(0);

      setTimeout(() => {
        setCurrentIndex(index);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, TRANSITION_DURATION / 2);
    },
    [isTransitioning, currentIndex]
  );

  const goNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % slides.length;
    goToSlide(nextIndex, "next");
  }, [currentIndex, goToSlide]);

  const goPrev = useCallback(() => {
    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    goToSlide(prevIndex, "prev");
  }, [currentIndex, goToSlide]);

  useEffect(() => {
    if (isPaused) return;

    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 100 / (SLIDE_DURATION / 50);
      });
    }, 50);

    intervalRef.current = setInterval(() => {
      goNext();
    }, SLIDE_DURATION);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [currentIndex, isPaused, goNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 60) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <div
      className="carousel-wrapper"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="carousel-bg-wash"
        style={{
          background: `radial-gradient(ellipse at 70% 50%, ${currentSlide.accent}12 0%, transparent 70%)`,
        }}
      />

      <div className="carousel-inner">
        {/* Left: Text Content */}
        <div className="carousel-content">
          <div className="carousel-content-inner">
            <div className={`carousel-collection-num ${isTransitioning ? "transitioning" : "visible"}`}>
              <span className="carousel-num-line" />
              <span className="carousel-num-text">
                {String(currentIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </span>
            </div>

            <h2 className={`carousel-title ${isTransitioning ? "transitioning" : "visible"}`}>
              {currentSlide.title}
            </h2>

            <p
              className={`carousel-subtitle ${isTransitioning ? "transitioning" : "visible"}`}
              style={{ color: currentSlide.accent }}
            >
              {currentSlide.subtitle}
            </p>

            <p className={`carousel-description ${isTransitioning ? "transitioning" : "visible"}`}>
              {currentSlide.description}
            </p>

            <div className="carousel-nav-arrows">
              <button onClick={goPrev} className="carousel-arrow-btn" aria-label="Previous slide">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <button onClick={goNext} className="carousel-arrow-btn" aria-label="Next slide">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Image */}
        <div className="carousel-image-container">
          <div className={`carousel-image-frame ${isTransitioning ? "transitioning" : "visible"}`}>
            <img src={currentSlide.imageUrl} alt={currentSlide.title} className="carousel-image" />
            <div
              className="carousel-image-overlay"
              style={{
                background: `linear-gradient(135deg, ${currentSlide.accent}22 0%, transparent 50%)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="carousel-progress-bar">
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="carousel-progress-item"
            aria-label={`Go to slide ${index + 1}`}
          >
            <div className="carousel-progress-track">
              <div
                className="carousel-progress-fill"
                style={{
                  width: index === currentIndex ? `${progress}%` : index < currentIndex ? "100%" : "0%",
                  backgroundColor: index === currentIndex ? currentSlide.accent : "currentColor",
                  opacity: index === currentIndex ? 1 : index < currentIndex ? 0.3 : 0,
                }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
