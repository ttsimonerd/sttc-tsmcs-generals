import React, { useState, useEffect } from 'react';
import { applyTheme, getSavedTheme, THEME_PRESETS } from '../services/themeService';
import { resetWins, loadWeekData } from '../services/rngService';

const SystemControl: React.FC = () => {
    const [broadcast, setBroadcast] = useState('');
    const [currentTheme, setCurrentTheme] = useState('');
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        setBroadcast(localStorage.getItem('system-broadcast') || '');
        setCurrentTheme(getSavedTheme());
    }, []);

    const showNotif = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const updateBroadcast = () => {
        if (broadcast.trim()) {
            localStorage.setItem('system-broadcast', broadcast);
            showNotif('Global broadcast sent! 📢');
        } else {
            localStorage.removeItem('system-broadcast');
            showNotif('Broadcast cleared.');
        }
    };

    const handleThemeChange = (id: string) => {
        applyTheme(id);
        setCurrentTheme(id);
        showNotif('System theme updated! ✨');
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">System Control</h1>
                    <p className="text-zinc-500 text-sm mt-1">Global broadcasts and ecosystem aesthetics</p>
                </div>
                {notification && (
                    <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg animate-fade-in">
                        <span className="text-emerald-400 text-sm">{notification}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Broadcast Manager */}
                <section className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-white">Broadcast Manager</h2>
                    </div>

                    <div className="space-y-4">
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Set a message that will appear for all users in real-time. Leave empty to clear the broadcast.
                        </p>
                        <textarea
                            value={broadcast}
                            onChange={(e) => setBroadcast(e.target.value)}
                            placeholder="System announcement..."
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-blue-500/50 min-h-[120px] resize-none font-mono"
                        />
                        <button
                            onClick={updateBroadcast}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
                        >
                            UPDATE GLOBAL BROADCAST
                        </button>
                        <button
                            onClick={() => { setBroadcast(''); localStorage.removeItem('system-broadcast'); showNotif('Broadcast cleared.'); }}
                            className="w-full py-2 text-zinc-500 hover:text-white text-xs transition-all"
                        >
                            Clear Current Message
                        </button>
                    </div>
                </section>

                {/* Theme Presets */}
                <section className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-white">Ecosystem Themes</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {THEME_PRESETS.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => handleThemeChange(theme.id)}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${currentTheme === theme.id
                                    ? 'bg-white/10 border-white/20 ring-2 ring-white/10'
                                    : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
                                    }`}
                            >
                                <div
                                    className="w-10 h-10 rounded-lg shadow-inner flex items-center justify-center overflow-hidden"
                                    style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
                                >
                                    <span className="text-white text-xs font-bold opacity-30">ABC</span>
                                </div>
                                <div className="text-left">
                                    <p className={`text-xs font-bold ${currentTheme === theme.id ? 'text-white' : 'text-zinc-400'}`}>{theme.name}</p>
                                    <div className="flex gap-1 mt-1">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primary }} />
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent }} />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Technical Note</h3>
                        <p className="text-[10px] text-zinc-600 leading-relaxed italic">
                            Themes apply dynamic CSS variables to the global scope. All interface components are designed to react instantly to these aesthetic shifts.
                        </p>
                    </div>
                </section>
            </div>

            {/* Debug & Maintenance Zone */}
            <div className="mt-8 pt-8 border-t border-white/10">
                <h2 className="text-xl font-bold text-red-500 mb-6 flex items-center gap-2">
                    <span className="text-2xl">⚡</span> DANGER ZONE
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={() => {
                            if (confirm('Reset your daily/weekly win progress to 0?')) {
                                resetWins();
                                showNotif('Win counter reset to 0.');
                            }
                        }}
                        className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl hover:bg-red-900/40 transition-all text-left group"
                    >
                        <h3 className="text-red-400 font-bold group-hover:text-red-300 transition-colors">Reset Win Counter</h3>
                        <p className="text-red-500/60 text-xs mt-1">Forces the daily "wins" counter back to 0.</p>
                    </button>
                    {/* Placeholder for future debug tools */}
                </div>
            </div>
        </div>
    );
};

export default SystemControl;
