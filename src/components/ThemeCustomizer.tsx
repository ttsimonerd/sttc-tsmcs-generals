import React, { useState, useEffect } from 'react';

const THEMES = [
    { id: 'emerald', name: 'Emerald', primary: '#10b981', primaryHover: '#059669', accent: '#06b6d4', bg: 'from-emerald-500/10' },
    { id: 'purple', name: 'Purple', primary: '#8b5cf6', primaryHover: '#7c3aed', accent: '#a855f7', bg: 'from-purple-500/10' },
    { id: 'rose', name: 'Rose', primary: '#f43f5e', primaryHover: '#e11d48', accent: '#ec4899', bg: 'from-rose-500/10' },
    { id: 'amber', name: 'Amber', primary: '#f59e0b', primaryHover: '#d97706', accent: '#fbbf24', bg: 'from-amber-500/10' },
    { id: 'cyan', name: 'Cyan', primary: '#06b6d4', primaryHover: '#0891b2', accent: '#22d3ee', bg: 'from-cyan-500/10' },
    { id: 'red', name: 'Red', primary: '#ef4444', primaryHover: '#dc2626', accent: '#f87171', bg: 'from-red-500/10' },
];

const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0, 0, 0';
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
};

const ThemeCustomizer: React.FC = () => {
    const [activeTheme, setActiveTheme] = useState('emerald');

    useEffect(() => {
        const saved = localStorage.getItem('app-theme');
        if (saved) setActiveTheme(saved);
    }, []);

    const handleThemeSelect = (themeId: string) => {
        const theme = THEMES.find(t => t.id === themeId);
        if (!theme) return;

        setActiveTheme(themeId);
        localStorage.setItem('app-theme', themeId);

        // Apply to CSS variables immediately
        const root = document.documentElement;
        root.style.setProperty('--color-primary', theme.primary);
        root.style.setProperty('--color-primary-hover', theme.primaryHover);
        root.style.setProperty('--color-accent', theme.accent);
        root.style.setProperty('--color-primary-rgb', hexToRgb(theme.primary));
        root.style.setProperty('--color-accent-rgb', hexToRgb(theme.accent));
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Visual Interface</h1>
                <p className="text-zinc-500 text-sm mt-1">Reconfigure system aesthetics and resonance</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {THEMES.map(theme => (
                    <button
                        key={theme.id}
                        onClick={() => handleThemeSelect(theme.id)}
                        className={`glass-panel p-6 rounded-3xl border-white/10 text-left transition-all duration-500 flex flex-col space-y-4 hover:scale-[1.03] group ${activeTheme === theme.id ? 'border-theme-primary/50 shadow-2xl shadow-theme-primary/10' : ''
                            }`}
                    >
                        <div className={`h-24 w-full rounded-2xl bg-gradient-to-br ${theme.bg} to-zinc-900 flex items-center justify-center`}>
                            <div className="flex gap-2">
                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.primary }}></div>
                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.accent }}></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-white tracking-tight">{theme.name}</span>
                            {activeTheme === theme.id && (
                                <span className="text-[10px] bg-theme-primary/20 text-theme-primary px-2 py-1 rounded font-black uppercase tracking-widest">Active</span>
                            )}
                        </div>
                        <div className="flex gap-1.5 overflow-hidden">
                            <div className="h-1 flex-1 rounded-full opacity-30" style={{ backgroundColor: theme.primary }}></div>
                            <div className="h-1 w-8 rounded-full opacity-30" style={{ backgroundColor: theme.accent }}></div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="glass-panel p-8 rounded-3xl border-white/5 space-y-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Theme Preview</h3>
                <div className="p-10 rounded-2xl bg-zinc-900/50 border border-white/5 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-theme-primary"></div>
                        <div className="space-y-1">
                            <div className="h-4 w-32 bg-white/10 rounded"></div>
                            <div className="h-2 w-20 bg-white/5 rounded"></div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-8 w-24 rounded-lg bg-theme-primary"></div>
                        <div className="h-8 w-24 rounded-lg border border-white/10 bg-white/5"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeCustomizer;
