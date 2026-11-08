import React, { useState, useEffect } from 'react';
import { getVipSupplies, saveVipSupplies, resetVipSupplies, DEFAULT_VIP_SUPPLIES } from '../services/pointsService';
import { Badge, Button, EmptyState, PageHeader, Panel } from './ui/Primitives';
import { useToast } from './ui/Toast';
import { logAudit } from '../services/auditService';

const VipSupplies: React.FC = () => {
  const { toast } = useToast();
  const [supplies, setSupplies] = useState<string[]>([]);
  const [newSupply, setNewSupply] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState('');

  useEffect(() => {
    setSupplies(getVipSupplies());
  }, []);

  const handleSave = () => {
    saveVipSupplies(supplies);
    toast('VIP supplies saved.', 'success');
    logAudit('Saved VIP supplies', `${supplies.length} in pool`);
  };

  const handleReset = () => {
    if (confirm('Reset all VIP supplies to defaults?')) {
      resetVipSupplies();
      setSupplies(DEFAULT_VIP_SUPPLIES);
      toast('VIP supplies reset to defaults.', 'info');
      logAudit('Reset VIP supplies');
    }
  };

  const handleAddSupply = () => {
    if (newSupply.trim()) {
      setSupplies([...supplies, newSupply.trim()]);
      setNewSupply('');
      toast('Supply added. Save to apply it.', 'info');
    }
  };

  const handleDeleteSupply = (index: number) => {
    if (confirm('Delete this supply?')) {
      setSupplies(supplies.filter((_, i) => i !== index));
      toast('Supply removed. Save to apply it.', 'info');
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
      toast('Supply updated. Save to apply it.', 'info');
    }
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditForm('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configure"
        title="VIP supplies"
        description="The pool a VIP Choice purchase draws from. Players receive one random premium supply."
        actions={
          <>
            <Button variant="secondary" onClick={handleReset}>Reset defaults</Button>
            <Button variant="primary" onClick={handleSave}>Save changes</Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <Panel tone="accent" className="space-y-3 p-5">
          <p className="eyebrow">Add supply</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={newSupply}
              onChange={(e) => setNewSupply(e.target.value)}
              placeholder="Enter premium supply name…"
              aria-label="New VIP supply name"
              className="field"
              onKeyDown={(e) => e.key === 'Enter' && handleAddSupply()}
            />
            <Button variant="primary" onClick={handleAddSupply} disabled={!newSupply.trim()} className="sm:w-auto">
              Add
            </Button>
          </div>
          <p className="text-[11px] text-zinc-600">
            Additions live in this session until you save.
          </p>
        </Panel>

        <Panel className="flex flex-col justify-between gap-3 p-5">
          <p className="eyebrow">Pool size</p>
          <div>
            <p className="stat-value text-white">{supplies.length}</p>
            <p className="mt-1 text-[11px] text-zinc-500">premium supplies available</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="warning">VIP only</Badge>
            <Badge>1 per purchase</Badge>
          </div>
        </Panel>
      </div>

      <Panel className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow">Premium supply pool</p>
          <span className="text-[10px] uppercase tracking-wider text-zinc-600">Index order matters</span>
        </div>

        {supplies.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No premium supplies yet"
              description="Add the first supply above, then save the pool to make it live."
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {supplies.map((supply, index) => (
              <div
                key={`${supply}-${index}`}
                className={
                  editingIndex === index
                    ? 'rounded-xl border border-amber-400/40 bg-amber-400/[0.06] p-3'
                    : 'rounded-xl border border-[color:var(--line)] bg-black/25 p-3 transition-colors hover:border-[color:var(--line-strong)]'
                }
              >
                {editingIndex === index ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editForm}
                      onChange={(e) => setEditForm(e.target.value)}
                      aria-label="Edit supply name"
                      placeholder="Supply name…"
                      className="field"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="primary" onClick={() => handleEditSave(index)} className="flex-1">
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleEditCancel} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="shrink-0 rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="truncate text-[13px] text-zinc-100">{supply}</span>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditStart(index)}
                        title={`Edit ${supply}`}
                        aria-label={`Edit ${supply}`}
                        className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-white"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSupply(index)}
                        title={`Delete ${supply}`}
                        aria-label={`Delete ${supply}`}
                        className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-300"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>

      <div className="grid gap-2 sm:grid-cols-2">
        <Panel tone="muted" className="p-4">
          <p className="eyebrow">How it is used</p>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
            Buying VIP Choice grants one random supply from this pool, in addition to the VIP badge.
          </p>
        </Panel>
        <Panel tone="muted" className="p-4">
          <p className="eyebrow">Storage</p>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
            Saved to the shared VIP supply key, so every account draws from the same pool.
          </p>
        </Panel>
      </div>
    </div>
  );
};

export default VipSupplies;
