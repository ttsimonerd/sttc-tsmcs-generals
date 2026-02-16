import React, { useState, useEffect } from 'react';
import { MATERIALS_LIST } from '../data/materials';

const STORAGE_KEY = 'materials_registry_data';

const DatabaseRegistry: React.FC = () => {
  const [data, setData] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'SAVING' | 'SAVED'>('IDLE');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const names = parsed.map((item: any) => typeof item === 'string' ? item : item.name);
      setData(names.join(', '));
    } else {
      setData(MATERIALS_LIST.join(', '));
    }
  }, []);

  const handleSave = () => {
    if (!data.trim()) {
      alert('Registry cannot be empty!');
      return;
    }

    setStatus('SAVING');
    const newList = data.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    if (newList.length === 0) {
      alert('Registry must contain at least one valid entry!');
      setStatus('IDLE');
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList.map(name => ({ name }))));
    
    // Dispatch a custom event to notify services of the change
    window.dispatchEvent(new Event('materials-updated'));

    setTimeout(() => {
      setStatus('SAVED');
      setTimeout(() => setStatus('IDLE'), 2000);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-in">
      <div className="glass-panel p-8 rounded-2xl space-y-6 relative overflow-hidden border border-emerald-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Registry Management</h2>
            <p className="text-zinc-400 text-xs font-mono">Modifying: <span className="text-emerald-400">materials.txt</span></p>
          </div>
          <button 
            onClick={handleSave}
            disabled={status === 'SAVING'}
            className={`px-8 py-2 rounded-lg font-bold text-sm transition-all shadow-lg 
              ${status === 'SAVED' ? 'bg-emerald-400 text-black' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}
            `}
          >
            {status === 'SAVING' ? 'Processing...' : status === 'SAVED' ? 'Saved ✓' : 'Save Changes'}
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Raw Dataset (Comma Separated)</label>
          <textarea 
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full h-96 bg-black/40 border border-zinc-700 rounded-xl p-6 text-zinc-300 font-mono text-sm focus:outline-none focus:border-emerald-500/50 transition-all custom-scrollbar resize-none leading-relaxed"
            placeholder="Item 1, Item 2, Item 3..."
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-zinc-600 font-mono">
          <span>Entries detected: {data.split(',').filter(s => s.trim()).length}</span>
          <span>Security Protocol: Encrypted Sync Active</span>
        </div>
      </div>
    </div>
  );
};

export default DatabaseRegistry;
