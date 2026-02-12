import React, { useState } from 'react';
import type { DayProbability } from '../types';
import { DEFAULT_DAYS, DEFAULT_WEEKEND_RESTRICTION } from '../types';


const ProbabilityConfig: React.FC = () => {
    const [days, setDays] = useState<DayProbability[]>(DEFAULT_DAYS);
    const [weekendRestriction, setWeekendRestriction] = useState(DEFAULT_WEEKEND_RESTRICTION);
    const [notification, setNotification] = useState<string | null>(null);

    const showNotif = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleProbChange = (dayNumber: number, field: 'yesProb' | 'noProb', value: string) => {
        const numValue = parseInt(value) || 0;
        const clampedValue = Math.min(100, Math.max(0, numValue));

        setDays(prev => prev.map(day => {
            if (day.dayNumber === dayNumber) {
                const updated = { ...day, [field]: clampedValue };
                // Ensure they don't exceed 100 together if needed, 
                // but usually they don't have to sum to 100 if there's a neutral outcome
                return updated;
            }
            return day;
        }));
    };

    const handleSave = () => {
        // In a real app, this would save to localStorage or an API
        showNotif('Probability configuration saved to matrix.');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Probability Matrix</h1>
                    <p className="text-zinc-500 text-sm mt-1">Configure roll outcomes for the Arbiter</p>
                </div>
                <div className="flex items-center gap-3">
                    {notification && (
                        <span className="text-theme-primary text-xs font-bold uppercase tracking-widest animate-fade-in">{notification}</span>
                    )}
                    <button
                        onClick={handleSave}
                        className="bg-theme-primary hover:bg-theme-primary-hover text-white px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-theme-primary/20"
                    >
                        Save Configuration
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Days Config */}
                <div className="glass-panel p-6 rounded-2xl border-white/10 space-y-4">
                    <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Weekly Weights</h2>
                    <div className="space-y-3">
                        {days.map(day => (
                            <div key={day.dayNumber} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-white/5 group hover:border-white/10 transition-all">
                                <span className="text-sm font-bold text-zinc-300 w-24">{day.dayName}</span>
                                <div className="flex items-center gap-4">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] text-zinc-600 uppercase">Yes %</label>
                                        <input
                                            type="number"
                                            value={day.yesProb}
                                            onChange={(e) => handleProbChange(day.dayNumber, 'yesProb', e.target.value)}
                                            className="w-16 bg-black/40 border border-zinc-800 rounded-lg px-2 py-1.5 text-emerald-400 text-center font-bold text-sm focus:outline-none focus:border-emerald-500/50"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] text-zinc-600 uppercase">No %</label>
                                        <input
                                            type="number"
                                            value={day.noProb}
                                            onChange={(e) => handleProbChange(day.dayNumber, 'noProb', e.target.value)}
                                            className="w-16 bg-black/40 border border-zinc-800 rounded-lg px-2 py-1.5 text-red-400 text-center font-bold text-sm focus:outline-none focus:border-red-500/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Restrictions Config */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-2xl border-white/10 space-y-4">
                        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Weekend Protocol</h2>
                        <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-white">Enforce Lockout</p>
                                <p className="text-[10px] text-zinc-500">Disable rolls on Sat/Sun</p>
                            </div>
                            <button
                                onClick={() => setWeekendRestriction(prev => ({ ...prev, enabled: !prev.enabled }))}
                                className={`w-12 h-6 rounded-full transition-all relative ${weekendRestriction.enabled ? 'bg-theme-primary' : 'bg-zinc-800'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${weekendRestriction.enabled ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-1">Lockout Message</label>
                            <input
                                type="text"
                                value={weekendRestriction.message}
                                onChange={(e) => setWeekendRestriction(prev => ({ ...prev, message: e.target.value }))}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-theme-primary/50"
                            />
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border-amber-500/20 bg-amber-500/5 space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-amber-500">⚠️</span>
                            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Protocol Warning</h3>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            Changes to the probability matrix are applied immediately to all system Arbiter processes.
                            Users will be subject to the updated bias weights on their next roll initiation.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProbabilityConfig;
