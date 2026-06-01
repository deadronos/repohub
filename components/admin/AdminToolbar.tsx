'use client';

import { Brush, Plus, Star, StarOff, Trash2 } from 'lucide-react';

interface AdminToolbarProps {
  onAddNew: () => void;
  onFeatureSelected: () => void;
  onUnfeatureSelected: () => void;
  onDeleteSelected: () => void;
  onCleanupStorage: () => void;
  selectedCount: number;
  orderStatus: 'idle' | 'saving' | 'saved';
  featureStatus: 'idle' | 'saving';
  cleanupStatus: 'idle' | 'cleaning' | 'cleaned';
}

export default function AdminToolbar({
  onAddNew,
  onFeatureSelected,
  onUnfeatureSelected,
  onDeleteSelected,
  onCleanupStorage,
  selectedCount,
  orderStatus,
  featureStatus,
  cleanupStatus,
}: AdminToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-8">
      <button
        onClick={onAddNew}
        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
      >
        <Plus size={18} /> Add New Project
      </button>

      {selectedCount > 0 && (
        <>
          <button
            onClick={onFeatureSelected}
            disabled={featureStatus === 'saving'}
            className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Star size={18} /> Feature Selected ({selectedCount})
          </button>

          <button
            onClick={onUnfeatureSelected}
            disabled={featureStatus === 'saving'}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <StarOff size={18} /> Unfeature Selected ({selectedCount})
          </button>

          <button
            onClick={onDeleteSelected}
            className="bg-red-600/20 hover:bg-red-600/40 text-red-500 hover:text-red-200 border border-red-900/50 font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all"
          >
            <Trash2 size={18} /> Delete Selected ({selectedCount})
          </button>
        </>
      )}

      {featureStatus === 'saving' && (
        <span className="text-sm text-amber-300">Updating featured projects...</span>
      )}
      {orderStatus === 'saving' && (
        <span className="text-sm text-cyan-300">Saving order...</span>
      )}
      {orderStatus === 'saved' && <span className="text-sm text-emerald-300">Order saved</span>}

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onCleanupStorage}
          disabled={cleanupStatus === 'cleaning'}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Brush size={18} /> Cleanup Storage
        </button>
        {cleanupStatus === 'cleaning' && (
          <span className="text-sm text-cyan-300">Scanning storage...</span>
        )}
        {cleanupStatus === 'cleaned' && (
          <span className="text-sm text-emerald-300">Storage cleaned</span>
        )}
      </div>
    </div>
  );
}
