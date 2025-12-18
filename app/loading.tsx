export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#050510]">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-cyan-500/30 rounded-full animate-ping" />
        <div className="absolute top-0 left-0 w-full h-full border-t-4 border-cyan-500 rounded-full animate-spin" />
      </div>
    </div>
  );
}
