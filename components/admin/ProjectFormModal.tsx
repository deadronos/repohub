'use client';

import { X } from 'lucide-react';
import type { Project } from '@/types';
import ProjectForm from '@/components/AdminProjectForm';

type ProjectFormModalProps = {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onComplete: () => void;
};

export default function ProjectFormModal({
  isOpen,
  project,
  onClose,
  onComplete,
}: ProjectFormModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0a0f] border border-zinc-800 w-full max-w-3xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <button
          onClick={onClose}
          aria-label="Close project form"
          className="absolute top-4 right-4 text-zinc-500 hover:text-white"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">
          {project ? 'Edit Project' : 'Initialize New Project'}
        </h2>

        <ProjectForm project={project} onComplete={onComplete} />
      </div>
    </div>
  );
}
