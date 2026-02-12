import React, { useState } from 'react';
import type { ActionLog } from '../types';
import { DEFAULT_DAYS, DEFAULT_WEEKEND_RESTRICTION } from '../types';

import { addPoints } from '../services/pointsService';

const RngTactician: React.FC = () => {
    const [logs, setLogs] = useState<ActionLog[]>([]);
    const [isRolling, setIsRolling] = useState(false);
    const [result, setResult] = useState<'YES' | 'NO' | null>(null);

    const getProbability = () => {
        const now = new Date();
        const day = (now.getDay() + 6) % 7; // Convert to 0=Monday
        const config = DEFAULT_DAYS.find(d => d.dayNumber === day);
        return config || DEFAULT_DAYS[0];
    };

    const handleRoll = () => {
        setIsRolling(true);
        setResult(null);

        const prob = getProbability();
        const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;

        setTimeout(() => {
            if (isWeekend && DEFAULT_WEEKEND_RESTRICTION.enabled) {
                const newLog: ActionLog = {
                    id: Date.now().toString(),
                    time: new Date().toLocaleTimeString(),
                    message: DEFAULT_WEEKEND_RESTRICTION.message,
                    type: 'error'
                };
                setLogs(prev => [newLog, ...prev]);
                setIsRolling(false);
                return;
            }

            const roll = Math.random() * 100;
            const isYes = roll < prob.yesProb;
            const outcome = isYes ? 'YES' : 'NO';

            setResult(outcome);

            const newLog: ActionLog = {
                id: Date.now().toString(),
                time: new Date().toLocaleTimeString(),
                message: `Roll Outcome: ${outcome} (${roll.toFixed(1)}% vs ${prob.yesProb}% threshold)`,
                type: isYes ? 'success' : 'neutral'
            };

            if (isYes) addPoints(10); // Reward for 'Yes' roll

            setLogs(prev => [newLog, ...prev]);
            setIsRolling(false);
        }, 1500);
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-black gradient-theme-text tracking-tighter uppercase italic">The Arbiter</h1>
                <p className="text-zinc-500 text-sm tracking-[0.2em] uppercase">RNG Decision Matrix</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Roll Panel */}
                <div className="glass-panel p-8 rounded-3xl border-white/10 flex flex-col items-center justify-center space-y-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10 text-center">
                        <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center text-4xl font-bold transition-all duration-500 ${isRolling ? 'border-theme-primary animate-spin' :
                            result === 'YES' ? 'border-emerald-500 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]' :
                                result === 'NO' ? 'border-red-500 text-red-400' : 'border-zinc-800 text-zinc-600'
                            }`}>
                            {isRolling ? '?' : result || '---'}
                        </div>
                    </div>

                    <button
                        onClick={handleRoll}
                        disabled={isRolling}
                        className={`relative z-10 w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${isRolling ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-white text-black hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl'
                            }`}
                    >
                        {isRolling ? 'Executing Calculation...' : 'Initiate Sequence'}
                    </button>

                    <div className="text-[10px] text-zinc-600 uppercase tracking-widest">
                        Current favorability: {getProbability().yesProb}%
                    </div>
                </div>

                {/* Logs Panel */}
                <div className="glass-panel rounded-3xl border-white/10 flex flex-col h-[400px]">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Action Registry</h2>
                        <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-zinc-500">{logs.length} entries</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {logs.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-zinc-700 text-xs italic">
                                Registry currently empty...
                            </div>
                        ) : (
                            logs.map(log => (
                                <div key={log.id} className="text-xs flex gap-3 animate-fade-in-up">
                                    <span className="text-zinc-600 font-mono shrink-0">[{log.time}]</span>
                                    <span className={`${log.type === 'success' ? 'text-emerald-400' :
                                        log.type === 'error' ? 'text-red-400' :
                                            log.type === 'warning' ? 'text-amber-400' : 'text-zinc-400'
                                        }`}>
                                        {log.message}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RngTactician;
