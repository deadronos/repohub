import { login } from '@/app/actions'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md p-8 rounded-2xl glass-panel bg-zinc-900/50 border border-zinc-800">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">System Access</h1>
        <form className="flex flex-col gap-4">
          <input
            className="p-3 bg-black/50 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
            name="email"
            placeholder="you@example.com"
            required
          />
          <input
            className="p-3 bg-black/50 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
            type="password"
            name="password"
            placeholder="••••••••"
            required
          />
          <button
            formAction={login}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg mt-2 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  )
}
