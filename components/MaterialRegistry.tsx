import React, { useState, useEffect } from 'react';
import { MATERIALS_LIST } from '../data/materials';

const STORAGE_KEY = 'materials_registry_data';

const MaterialRegistry: React.FC = () => {
    const [materials, setMaterials] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newMaterial, setNewMaterial] = useState('');
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            setMaterials(JSON.parse(stored));
        } else {
            setMaterials([...MATERIALS_LIST]);
        }
    }, []);

    const showNotif = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSave = (updatedList: string[]) => {
        setMaterials(updatedList);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    };

    const handleAdd = () => {
        if (!newMaterial.trim()) return;
        if (materials.includes(newMaterial.trim())) {
            showNotif('Material already exists!');
            return;
        }
        const updated = [newMaterial.trim(), ...materials];
        handleSave(updated);
        setNewMaterial('');
        showNotif('Material added! 🧪');
    };

    const handleDelete = (material: string) => {
        if (confirm(`Remove "${material}" from the drop pool?`)) {
            const updated = materials.filter(m => m !== material);
            handleSave(updated);
            showNotif('Material removed.');
        }
    };

    const handleReset = () => {
        if (confirm('Reset material pool to the authentic default list?')) {
            handleSave([...MATERIALS_LIST]);
            showNotif('Pool reset to defaults.');
        }
    };

    const filteredMaterials = materials.filter(m =>
        m.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Material Registry</h1>
                    <p className="text-zinc-500 text-sm mt-1">Manage the Arbiter's drop pool for Edge & Rewards</p>
                </div>
                <div className="flex gap-2">
                    {notification && (
                        <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg animate-fade-in">
                            <span className="text-emerald-400 text-sm">{notification}</span>
                        </div>
                    )}
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm hover:bg-red-500/20 transition-all font-medium"
                    >
                        Reset to Default
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Add Component */}
                <div className="md:col-span-1 space-y-6">
                    <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-4">
                        <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Add New Material</h2>
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={newMaterial}
                                onChange={(e) => setNewMaterial(e.target.value)}
                                placeholder="Enter supply name..."
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            />
                            <button
                                onClick={handleAdd}
                                disabled={!newMaterial.trim()}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                            >
                                + ADD TO DROP POOL
                            </button>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Registry Stats</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Total Materials:</span>
                                <span className="text-white font-mono font-bold">{materials.length}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Registry State:</span>
                                <span className={`font-bold ${localStorage.getItem(STORAGE_KEY) ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {localStorage.getItem(STORAGE_KEY) ? 'Custom' : 'Default'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* List Component */}
                <div className="md:col-span-2 space-y-4">
                    <div className="relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search registry..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono text-sm"
                        />
                    </div>

                    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-zinc-900 z-10">
                                    <tr className="border-b border-white/10">
                                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">#</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Material Name</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredMaterials.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-zinc-500 italic">
                                                No materials found matching your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredMaterials.map((m, i) => (
                                            <tr key={m} className={`hover:bg-white/5 transition-colors group ${searchTerm && m.toLowerCase().includes(searchTerm.toLowerCase()) ? 'bg-emerald-500/5' : ''}`}>
                                                <td className="px-6 py-4 text-zinc-600 font-mono text-xs">{materials.indexOf(m) + 1}</td>
                                                <td className="px-6 py-4 text-white font-medium">{m}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDelete(m)}
                                                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                        title="Delete Material"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaterialRegistry;
