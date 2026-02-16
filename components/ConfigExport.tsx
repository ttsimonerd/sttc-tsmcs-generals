import React, { useState } from 'react';
import { exportMasterConfig, importMasterConfig, deepResetSystem } from '../services/configExportService';

const ConfigExport: React.FC = () => {
    const [isImporting, setIsImporting] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);

    const showNotif = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleExport = () => {
        exportMasterConfig();
        showNotif('Master configuration exported! 📥');
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (confirm('Importing this file will overwrite all current system settings. Continue?')) {
            setIsImporting(true);
            const success = await importMasterConfig(file);
            setIsImporting(false);

            if (success) {
                showNotif('Configuration applied! Refreshing system...');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                showNotif('Error: Invalid configuration file. ❌');
            }
        }
    };

    const handleDeepReset = () => {
        if (confirm('CRITICAL ACTION: This will wipe ALL custom data and restore factory defaults. Are you absolutely sure?')) {
            deepResetSystem();
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Project Solidifier</h1>
                    <p className="text-zinc-500 text-sm mt-1">Export and import the definitive ecosystem state</p>
                </div>
                {notification && (
                    <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg animate-fade-in">
                        <span className="text-emerald-400 text-sm">{notification}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Section */}
                <section className="glass-panel p-8 rounded-3xl border border-white/10 flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-white">Save Definitive State</h2>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            Downloads a snapshot of all materials, riddles, game settings, and passwords into a single JSON file.
                        </p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 group"
                    >
                        EXPORT AS JSON
                        <span className="group-hover:translate-y-1 transition-transform">↓</span>
                    </button>
                </section>

                {/* Import Section */}
                <section className="glass-panel p-8 rounded-3xl border border-white/10 flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-white">Restore Snapshot</h2>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            Upload a previously exported configuration to instantly apply all saved parameters to this project instance.
                        </p>
                    </div>
                    <label className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 cursor-pointer flex items-center justify-center gap-2 group">
                        {isImporting ? 'PROCESSING...' : 'UPLOAD SNAPSHOT'}
                        {!isImporting && <span className="group-hover:-translate-y-1 transition-transform">↑</span>}
                        <input type="file" accept=".json" onChange={handleFileChange} className="hidden" disabled={isImporting} />
                    </label>
                </section>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-red-500/20 bg-red-500/5 mt-10 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-red-500 uppercase tracking-widest">Ecosystem Reset</h2>
                        <p className="text-zinc-500 text-xs">Danger: This reverts all Master Control settings to factory defaults.</p>
                    </div>
                </div>
                <button
                    onClick={handleDeepReset}
                    className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl text-sm font-bold transition-all"
                >
                    PERFORM DEEP SYSTEM RESET
                </button>
            </div>
        </div>
    );
};

export default ConfigExport;
