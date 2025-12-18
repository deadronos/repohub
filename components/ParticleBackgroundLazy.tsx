'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const ParticleBackground = dynamic(() => import('@/components/ParticleBackground'), {
  ssr: false,
  loading: () => null,
});

const IDLE_TIMEOUT_MS = 1500;
const FALLBACK_DELAY_MS = 200;

type WindowWithIdleCallback = Window &
  typeof globalThis & {
    requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

export default function ParticleBackgroundLazy() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: number | null = null;
    let idleCallbackId: number | null = null;

    const win = window as WindowWithIdleCallback;

    const onIdle = () => {
      if (!isMounted) return;
      setShouldRender(true);
    };

    if (typeof win.requestIdleCallback === 'function') {
      idleCallbackId = win.requestIdleCallback(onIdle, { timeout: IDLE_TIMEOUT_MS });
    } else {
      timeoutId = win.setTimeout(onIdle, FALLBACK_DELAY_MS);
    }

    return () => {
      isMounted = false;
      if (idleCallbackId !== null && typeof win.cancelIdleCallback === 'function') {
        win.cancelIdleCallback(idleCallbackId);
      }
      if (timeoutId !== null) {
        win.clearTimeout(timeoutId);
      }
    };
  }, []);

  if (!shouldRender) return null;
  return <ParticleBackground />;
}
