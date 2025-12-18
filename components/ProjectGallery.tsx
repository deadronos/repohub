'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import type { Project } from '@/types';
import { capitalize, truncate } from '@/utils/string';

export default function ProjectGallery({ projects }: { projects: Project[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 md:p-8">
      {projects.map((project) => (
        <motion.div
          layoutId={project.id}
          key={project.id}
          onClick={() => setSelectedId(project.id)}
          className="cursor-pointer group relative overflow-hidden rounded-2xl glass-panel h-80 transition-all hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(0,240,255,0.2)]"
          whileHover={{ scale: 1.02, y: -5 }}
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0 bg-neutral-900">
            {project.image_url && (
              <Image
                src={project.image_url}
                alt={project.title}
                fill
                className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 grayscale group-hover:grayscale-0"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-[#050510]/40 to-transparent" />
          </div>

          {/* Card Content */}
          <div className="absolute bottom-0 left-0 p-6 z-10 w-full">
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
              {project.title}
            </h3>
            <p className="text-zinc-400 text-sm line-clamp-2">{truncate(project.short_description || '', 100)}</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              {project.tags?.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-cyan-900/30 border border-cyan-500/30 text-cyan-200 px-2 py-1 rounded-full backdrop-blur-md"
                >
                  {capitalize(tag || '')}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      ))}

      {/* The Expanded Modal */}
      <AnimatePresence>
        {selectedId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedId(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              />

            {/* Expanded Card */}
            {projects.map(
              (project) =>
                project.id === selectedId && (
                  <motion.div
                    layoutId={project.id}
                    key={project.id}
                    className="relative w-full max-w-2xl bg-[#0a0a0f] rounded-3xl overflow-hidden border border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.15)] z-50 flex flex-col max-h-[90vh]"
                  >
                    {/* Close Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(null);
                      }}
                      className="absolute top-4 right-4 z-50 p-2 bg-black/60 rounded-full text-white hover:bg-white/20 transition-colors"
                    >
                      <X size={20} />
                    </button>

                    <div className="relative h-64 shrink-0 bg-neutral-900">
                      {project.image_url && (
                        <Image
                          src={project.image_url}
                          alt={project.title}
                          fill
                          className="object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent opacity-80" />
                    </div>

                    <div className="p-8 overflow-y-auto">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2 className="text-3xl font-bold text-white text-glow">
                            {project.title}
                          </h2>
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {project.tags?.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs border border-cyan-900 text-cyan-300 bg-cyan-950/30 px-2 py-1 rounded-full"
                              >
                                {capitalize(tag || '')}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <p className="text-zinc-300 leading-relaxed mb-8 whitespace-pre-wrap">
                        {project.description || project.short_description}
                      </p>

                      <div className="flex gap-4 flex-col sm:flex-row">
                        {project.demo_url && (
                          <a
                            href={project.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]"
                          >
                            <ExternalLink size={18} /> Play / Demo
                          </a>
                        )}

                        {project.repo_url && (
                          <a
                            href={project.repo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-zinc-700"
                          >
                            <Github size={18} /> View Code
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ),
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
