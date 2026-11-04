'use client';

import { useEffect, useRef } from 'react';

export default function HomepageAtmosphere() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Mutable effect-local state: these values are only read/written by
    // animation-frame callbacks and event listeners, never during render.
    const state = { rafId: 0, cursorX: 0, cursorY: 0, scrollY: 0 };

    const sync = () => {
      container.style.setProperty('--cursor-x', String(state.cursorX));
      container.style.setProperty('--cursor-y', String(state.cursorY));
      container.style.setProperty('--scroll-y', String(state.scrollY));
      state.rafId = 0;
    };

    const scheduleSync = () => {
      if (state.rafId) return;
      state.rafId = window.requestAnimationFrame(sync);
    };

    const handlePointerMove = (event: PointerEvent) => {
      state.cursorX = Math.round((event.clientX / window.innerWidth - 0.5) * 120);
      state.cursorY = Math.round((event.clientY / window.innerHeight - 0.5) * 120);
      scheduleSync();
    };

    const handleScroll = () => {
      state.scrollY = Math.min(window.scrollY, 1600);
      scheduleSync();
    };

    handleScroll();

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', handleScroll);

      if (state.rafId) {
        window.cancelAnimationFrame(state.rafId);
      }
    };
  }, []);

  return (
    <div ref={containerRef} aria-hidden="true" className="homepage-atmosphere">
      <div className="homepage-atmosphere__wash" />

      <div className="homepage-atmosphere__grid homepage-grid" />

      <div className="homepage-atmosphere__orb homepage-atmosphere__orb--cyan" />

      <div className="homepage-atmosphere__orb homepage-atmosphere__orb--indigo" />

      <div className="homepage-atmosphere__orb homepage-atmosphere__orb--fuchsia" />

      <div className="homepage-atmosphere__fade" />
    </div>
  );
}
