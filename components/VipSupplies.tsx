import React, { useState, useEffect } from 'react';
import { getVipSupplies, saveVipSupplies, resetVipSupplies, DEFAULT_VIP_SUPPLIES } from '../services/pointsService';

const VipSupplies: React.FC = () => {
  const [supplies, setSupplies] = useState<string[]>([]);
  const [newSupply, setNewSupply] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    setSupplies(getVipSupplies());
  }, []);

  const showNotif = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = () => {
    saveVipSupplies(supplies);
    showNotif('VIP Supplies saved!');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all VIP supplies to defaults?')) {
      resetVipSupplies();
      setSupplies(DEFAULT_VIP_SUPPLIES);
      showNotif('VIP Supplies reset to defaults!');
    }
  };

  const handleAddSupply = () => {
    if (newSupply.trim()) {
      setSupplies([...supplies, newSupply.trim()]);
      setNewSupply('');
      showNotif('Supply added!');
    }
  };

  const handleDeleteSupply = (index: number) => {
    if (confirm('Are you sure you want to delete this supply?')) {
      setSupplies(supplies.filter((_, i) => i !== index));
      showNotif('Supply deleted!');
    }
  };

  const handleEditStart = (index: number) => {
    setEditingIndex(index);
    setEditForm(supplies[index]);
  };

  const handleEditSave = (index: number) => {
    if (editForm.trim()) {
      const updated = [...supplies];
      updated[index] = editForm.trim();
      setSupplies(updated);
      setEditingIndex(null);
      showNotif('Supply updated!');
    }
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditForm('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">VIP Supplies</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage premium supplies for VIP Choice rewards</p>
        </div>
        <div className="flex gap-2">
          {notification && (
            <div className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg animate-fade-in">
              <span className="text-amber-400 text-sm">{notification}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Premium Supplies</p>
            <p className="text-3xl font-bold text-white mt-1">{supplies.length}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleAddSupply}
              disabled={!newSupply.trim()}
              className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm hover:bg-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Add Supply
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg text-sm hover:bg-white/20 transition-all"
            >
              Save Changes
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/30 transition-all"
            >
              Reset to Default
            </button>
          </div>
        </div>
      </div>

      {/* Add Form */}
      <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30">
        <div className="flex gap-3">
          <input
            type="text"
            value={newSupply}
            onChange={(e) => setNewSupply(e.target.value)}
            placeholder="Enter premium supply name..."
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50"
            onKeyDown={(e) => e.key === 'Enter' && handleAddSupply()}
          />
          <button
            onClick={handleAddSupply}
            disabled={!newSupply.trim()}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>

      {/* Supplies List */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Premium Supply Pool</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto custom-scrollbar">
          {supplies.length === 0 ? (
            <div className="col-span-full text-center py-8 text-zinc-500">
              <p>No supplies yet. Add your first premium supply!</p>
            </div>
          ) : (
            supplies.map((supply, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all ${
                  editingIndex === index
                    ? 'border-amber-500/50 bg-amber-900/10'
                    : 'border-white/5 bg-zinc-900/50 hover:bg-zinc-800/50'
                }`}
              >
                {editingIndex === index ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm}
                      onChange={(e) => setEditForm(e.target.value)}
                      title="Edit Supply Name"
                      placeholder="Supply name..."
                      className="w-full bg-black/30 border border-zinc-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSave(index)}
                        className="flex-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition-all"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="flex-1 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg text-xs font-medium transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded shrink-0">#{index + 1}</span>
                      <span className="text-white text-sm truncate">{supply}</span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleEditStart(index)}
                        className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteSupply(index)}
                        className="p-1.5 bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg transition-all"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info */}
      <div className="text-center text-zinc-600 text-xs">
        <p>VIP Supplies are premium items given to players who purchase VIP Choice from the shop.</p>
        <p className="mt-1">When a player buys VIP Choice, they receive 3 random premium supplies!</p>
      </div>
    </div>
  );
};

export default VipSupplies;

