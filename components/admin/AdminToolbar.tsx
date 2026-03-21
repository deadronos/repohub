'use client';

import { Plus, Trash2 } from 'lucide-react';

interface AdminToolbarProps {
  onAddNew: () => void;
  onDeleteSelected: () => void;
  selectedCount: number;
  orderStatus: 'idle' | 'saving' | 'saved';
}

export default function AdminToolbar({
  onAddNew,
  onDeleteSelected,
  selectedCount,
  orderStatus,
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
        <button
          onClick={onDeleteSelected}
          className="bg-red-600/20 hover:bg-red-600/40 text-red-500 hover:text-red-200 border border-red-900/50 font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all"
        >
          <Trash2 size={18} /> Delete Selected ({selectedCount})
        </button>
      )}

      {orderStatus === 'saving' && (
        <span className="text-sm text-cyan-300">Saving order...</span>
      )}
      {orderStatus === 'saved' && <span className="text-sm text-emerald-300">Order saved</span>}
    </div>
  );
}
