'use client'

import { createProject } from '@/app/actions'
import { useRef } from 'react'
import { Plus } from 'lucide-react'

export default function AdminPage() {
    const formRef = useRef<HTMLFormElement>(null)

    async function handleSubmit(formData: FormData) {
        await createProject(formData)
        formRef.current?.reset()
        alert('Project added!')
    }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-8 border-b border-zinc-800 pb-4">Admin Command Center</h1>
      
      <div className="glass-panel p-8 rounded-2xl bg-zinc-900/30">
        <h2 className="text-2xl font-semibold text-white mb-6">Add New Project</h2>
        
        <form ref={formRef} action={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="flex flex-col gap-2">
                    <label className="text-sm text-zinc-400">Project Title</label>
                    <input name="title" required className="p-3 bg-black/40 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none" />
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-sm text-zinc-400">Short Description (Card)</label>
                    <input name="short_description" required className="p-3 bg-black/40 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none" />
                 </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm text-zinc-400">Full Description</label>
                <textarea name="description" rows={4} className="p-3 bg-black/40 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="flex flex-col gap-2">
                    <label className="text-sm text-zinc-400">Repo URL</label>
                    <input name="repo_url" type="url" className="p-3 bg-black/40 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none" />
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-sm text-zinc-400">Demo URL</label>
                    <input name="demo_url" type="url" className="p-3 bg-black/40 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none" />
                 </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm text-zinc-400">Tags (comma separated)</label>
                <input name="tags" placeholder="Next.js, TypeScript, AI" className="p-3 bg-black/40 border border-zinc-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none" />
            </div>

            <div className="flex flex-col gap-2">
                 <label className="text-sm text-zinc-400">Project Cover Image</label>
                 <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 flex flex-col items-center justify-center text-zinc-500 hover:border-cyan-500/50 hover:bg-cyan-900/10 transition-colors cursor-pointer relative">
                    <input type="file" name="image" accept="image/*" required className="absolute inset-0 opacity-0 cursor-pointer" />
                    <Plus className="mb-2" />
                    <span>Click or Drag to Upload</span>
                 </div>
            </div>

            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl mt-4 transition-colors">
                Initialize Project Node
            </button>
        </form>
      </div>
    </div>
  )
}
