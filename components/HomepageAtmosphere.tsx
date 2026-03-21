'use client';

import { useEffect, useRef } from 'react';

export default function HomepageAtmosphere() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId = 0;
    let cursorX = 0;
    let cursorY = 0;
    let scrollY = 0;

    const sync = () => {
      container.style.setProperty('--cursor-x', String(cursorX));
      container.style.setProperty('--cursor-y', String(cursorY));
      container.style.setProperty('--scroll-y', String(scrollY));
      rafId = 0;
    };

    const scheduleSync = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(sync);
    };

    const handlePointerMove = (event: PointerEvent) => {
      cursorX = Math.round((event.clientX / window.innerWidth - 0.5) * 120);
      cursorY = Math.round((event.clientY / window.innerHeight - 0.5) * 120);
      scheduleSync();
    };

    const handleScroll = () => {
      scrollY = Math.min(window.scrollY, 1600);
      scheduleSync();
    };

    handleScroll();

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', handleScroll);

      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="homepage-atmosphere"
    >
      <div className="homepage-atmosphere__wash" />

      <div className="homepage-atmosphere__grid homepage-grid" />

      <div className="homepage-atmosphere__orb homepage-atmosphere__orb--cyan" />

      <div className="homepage-atmosphere__orb homepage-atmosphere__orb--indigo" />

      <div className="homepage-atmosphere__orb homepage-atmosphere__orb--fuchsia" />

      <div className="homepage-atmosphere__fade" />
    </div>
  );
}
