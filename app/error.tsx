'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050510] text-center p-4">
      <h2 className="text-3xl text-red-500 font-bold mb-4">Critical System Failure</h2>
      <p className="text-zinc-400 mb-8 max-w-md">
        An unexpected error occurred within the mainframe. Diagnostic data has been logged.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-red-600/20 hover:bg-red-600/40 text-red-500 border border-red-900 rounded-lg transition-all"
      >
        Reboot System (Try Again)
      </button>
    </div>
  );
}
