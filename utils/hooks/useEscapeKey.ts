import { useEffect, useCallback } from 'react';

export function useEscapeKey(onEscape: () => void, enabled: boolean) {
  const handleEscape = useCallback(() => {
    onEscape();
  }, [onEscape]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleEscape]);
}
