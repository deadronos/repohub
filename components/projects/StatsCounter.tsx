'use client';

import { useEffect, useRef, useState } from 'react';

interface StatsCounterProps {
  value: number;
  label: string;
}

export default function StatsCounter({ value, label }: StatsCounterProps) {
  const ref = useRef<HTMLElement>(null);
  const [displayValue, setDisplayValue] = useState(value);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const duration = 1500;
    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;

            const startTime = performance.now();

            const tick = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const easedProgress = easeOutCubic(progress);
              const currentValue = Math.round(value * easedProgress);

              setDisplayValue(currentValue);

              if (progress < 1) {
                requestAnimationFrame(tick);
              }
            };

            requestAnimationFrame(tick);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="tabular-nums" aria-label={`${label}: ${displayValue}`}>
      {displayValue}
    </span>
  );
}