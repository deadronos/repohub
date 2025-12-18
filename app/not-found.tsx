import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050510] text-center p-4">
      <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600 mb-4 animate-pulse">
        404
      </h1>
      <h2 className="text-2xl text-white mb-8">System Malfunction: Sector Not Found</h2>
      <Link
        href="/"
        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)]"
      >
        Return to Base
      </Link>
    </div>
  );
}
