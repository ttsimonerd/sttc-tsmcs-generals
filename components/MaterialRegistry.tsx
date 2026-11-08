import React, { useState, useEffect } from 'react';
import { MATERIALS_LIST } from '../data/materials';
import { ItemAction } from '../types';
import type { Material } from '../types';
import { Badge, Button, PageHeader, Panel, Stat } from './ui/Primitives';
import { useToast } from './ui/Toast';
import { logAudit } from '../services/auditService';

const STORAGE_KEY = 'materials_registry_data';

const MaterialRegistry: React.FC = () => {
    const { toast } = useToast();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newMaterial, setNewMaterial] = useState({ name: '', action: ItemAction.NONE, actionValue: 0 });

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            setMaterials(JSON.parse(stored));
        } else {
            setMaterials(MATERIALS_LIST.map(name => ({ name, action: ItemAction.NONE, actionValue: 0 })));
        }
    }, []);

    const handleSave = (updatedList: Material[]) => {
        setMaterials(updatedList);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    };

    const handleAdd = () => {
        if (!newMaterial.name.trim()) return;
        if (materials.some(m => m.name.toLowerCase() === newMaterial.name.trim().toLowerCase())) {
            toast('That material is already in the pool.', 'error');
            return;
        }
        const updated = [{ ...newMaterial, name: newMaterial.name.trim() }, ...materials];
        handleSave(updated);
        setNewMaterial({ name: '', action: ItemAction.NONE, actionValue: 0 });
        toast('Material added to the drop pool.', 'success');
        logAudit('Added material', newMaterial.name.trim());
    };

    const handleDelete = (name: string) => {
        if (confirm(`Remove "${name}" from the drop pool?`)) {
            const updated = materials.filter(m => m.name !== name);
            handleSave(updated);
            toast('Material removed.', 'info');
            logAudit('Removed material', name);
        }
    };

    const handleReset = () => {
        if (confirm('Reset material pool to the authentic default list?')) {
            handleSave(MATERIALS_LIST.map(name => ({ name, action: ItemAction.NONE, actionValue: 0 })));
            toast('Pool reset to defaults.', 'info');
            logAudit('Reset material pool');
        }
    };

    const filteredMaterials = materials.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isCustom = Boolean(localStorage.getItem(STORAGE_KEY));

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Configure"
                title="Material registry"
                description="The Arbiter's drop pool. Each supply can carry an action that fires when it is pulled."
                actions={
                    <Button variant="danger" onClick={handleReset}>
                        Reset to defaults
                    </Button>
                }
            />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
                <div className="space-y-6">
                    <Panel tone="accent" className="space-y-4 p-5">
                        <div>
                            <p className="eyebrow">New supply</p>
                            <p className="mt-1 text-xs text-zinc-500">Added to the top of the pool.</p>
                        </div>

                        <div>
                            <label className="field-label" htmlFor="material-name">Name</label>
                            <input
                                id="material-name"
                                type="text"
                                value={newMaterial.name}
                                onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                placeholder="Enter supply name…"
                                className="field"
                            />
                        </div>

                        <div>
                            <label className="field-label" htmlFor="material-action">Assigned action</label>
                            <select
                                id="material-action"
                                value={newMaterial.action}
                                onChange={(e) => setNewMaterial({ ...newMaterial, action: e.target.value as ItemAction })}
                                className="field"
                            >
                                {Object.values(ItemAction).map(action => (
                                    <option key={action} value={action} className="bg-[#0b0d12]">
                                        {action.replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="field-label" htmlFor="material-value">Action value</label>
                            <input
                                id="material-value"
                                type="number"
                                value={newMaterial.actionValue}
                                onChange={(e) => setNewMaterial({ ...newMaterial, actionValue: parseInt(e.target.value) || 0 })}
                                className="field field-mono"
                            />
                        </div>

                        <Button
                            variant="primary"
                            onClick={handleAdd}
                            disabled={!newMaterial.name.trim()}
                            className="w-full"
                        >
                            Add to drop pool
                        </Button>
                    </Panel>

                    <Panel className="space-y-3 p-5">
                        <p className="eyebrow">Registry</p>
                        <div className="grid grid-cols-2 gap-2">
                            <Stat label="Supplies" value={materials.length} />
                            <Stat
                                label="Source"
                                value={isCustom ? 'Custom' : 'Default'}
                                tone={isCustom ? 'warning' : 'primary'}
                            />
                        </div>
                    </Panel>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <svg
                            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="search"
                            placeholder="Search supplies…"
                            aria-label="Search materials"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="field pl-10"
                        />
                    </div>

                    <Panel className="overflow-hidden">
                        <div className="max-h-[620px] overflow-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 z-10 bg-[#0b0d12]">
                                    <tr className="border-b border-[color:var(--line)]">
                                        <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">Supply</th>
                                        <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">Action</th>
                                        <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">Remove</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMaterials.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-14 text-center text-sm text-zinc-500">
                                                No supplies match “{searchTerm}”.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredMaterials.map((m) => (
                                            <tr key={m.name} className="group border-b border-[color:var(--line)] last:border-0 hover:bg-white/[0.02]">
                                                <td className="px-4 py-3 text-[13px] font-medium text-zinc-100">{m.name}</td>
                                                <td className="px-4 py-3">
                                                    <Badge tone={m.action && m.action !== ItemAction.NONE ? 'primary' : 'default'}>
                                                        {m.action ? m.action.replace(/_/g, ' ') : 'none'}
                                                        {m.actionValue ? ` · ${m.actionValue}` : ''}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(m.name)}
                                                        title={`Remove ${m.name}`}
                                                        aria-label={`Remove ${m.name}`}
                                                        className="rounded-lg border border-transparent p-2 text-zinc-600 transition-colors hover:border-red-500/25 hover:bg-red-500/10 hover:text-red-300 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Panel>
                </div>
            </div>
        </div>
    );
};

export default MaterialRegistry;
