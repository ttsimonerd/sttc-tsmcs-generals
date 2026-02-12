import React, { useState, useEffect } from 'react';
import { getTunerConfig, saveTunerConfig, resetTunerConfig, GameTunerConfig } from '../services/gameTunerService';

const GameTuner: React.FC = () => {
    const [config, setConfig] = useState<GameTunerConfig | null>(null);
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        setConfig(getTunerConfig());
    }, []);

    const showNotif = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSave = () => {
        if (config) {
            saveTunerConfig(config);
            showNotif('Game parameters updated! ⚙️');
        }
    };

    const handleReset = () => {
        if (confirm('Reset all game parameters to defaults?')) {
            resetTunerConfig();
            setConfig(getTunerConfig());
            showNotif('Restored factory settings.');
        }
    };

    if (!config) return <div className="text-white p-8">Loading Tuner...</div>;

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Mini-Game Tuner</h1>
                    <p className="text-zinc-500 text-sm mt-1">Adjust multipliers, difficulty, and house edge globally</p>
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
                        Reset Factory
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 transition-all font-bold shadow-lg shadow-blue-600/20"
                    >
                        APPLY CHANGES
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Crash Controller */}
                <section className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400 font-bold">C</div>
                        <h2 className="text-lg font-bold text-white">Crash Configuration</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-zinc-900/50 p-4 rounded-xl space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Multiplier Growth Speed</label>
                                <span className="text-red-400 font-mono font-bold">{config.crash.speed.toFixed(2)}x</span>
                            </div>
                            <input
                                type="range"
                                min="0.1"
                                max="2.0"
                                step="0.05"
                                value={config.crash.speed}
                                onChange={(e) => setConfig({
                                    ...config,
                                    crash: { ...config.crash, speed: parseFloat(e.target.value) }
                                })}
                                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                            />
                            <p className="text-[10px] text-zinc-600 italic">Higher = Multiplier rises faster. Harder for users to cash out high.</p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Crash Point Probabilities</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {config.crash.distribution.map((dist, i) => (
                                    <div key={i} className="bg-zinc-900/50 p-3 rounded-lg flex items-center justify-between">
                                        <span className="text-xs text-white font-mono">{dist.value}x</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            value={dist.prob}
                                            onChange={(e) => {
                                                const newDist = [...config.crash.distribution];
                                                newDist[i] = { ...dist, prob: parseFloat(e.target.value) || 0 };
                                                setConfig({ ...config, crash: { ...config.crash, distribution: newDist } });
                                            }}
                                            className="w-16 bg-zinc-800 border-none rounded px-2 py-1 text-right text-xs text-red-400 font-mono focus:ring-1 focus:ring-red-500"
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-zinc-600 text-center">Note: Probabilities should ideally sum to 1.00</p>
                        </div>
                    </div>
                </section>

                {/* Slots Controller */}
                <section className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-500 font-bold">S</div>
                        <h2 className="text-lg font-bold text-white">Slots Configuration</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-900/50 p-4 rounded-xl space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Spin Cost (pts)</label>
                            <input
                                type="number"
                                value={config.slots.spinCost}
                                onChange={(e) => setConfig({
                                    ...config,
                                    slots: { ...config.slots, spinCost: parseInt(e.target.value) || 0 }
                                })}
                                className="w-full bg-zinc-800 border-none rounded-lg px-3 py-2 text-yellow-500 font-bold"
                            />
                        </div>
                        <div className="bg-zinc-900/50 p-4 rounded-xl space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Free Spin Interval</label>
                            <input
                                type="number"
                                value={config.slots.freeSpinInterval}
                                onChange={(e) => setConfig({
                                    ...config,
                                    slots: { ...config.slots, freeSpinInterval: parseInt(e.target.value) || 1 }
                                })}
                                className="w-full bg-zinc-800 border-none rounded-lg px-3 py-2 text-yellow-500 font-bold"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Symbol Multipliers & Weights</h3>
                        <div className="space-y-2">
                            {['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '👑'].map((emoji, i) => (
                                <div key={emoji} className="bg-zinc-900/50 p-3 rounded-xl flex items-center gap-4">
                                    <span className="text-2xl w-8">{emoji}</span>
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] text-zinc-600 uppercase">Mult:</span>
                                            <input
                                                type="number"
                                                value={config.slots.multipliers[i]}
                                                onChange={(e) => {
                                                    const newMults = [...config.slots.multipliers];
                                                    newMults[i] = parseInt(e.target.value) || 0;
                                                    setConfig({ ...config, slots: { ...config.slots, multipliers: newMults } });
                                                }}
                                                className="w-full bg-zinc-800 border-none rounded px-2 py-1 text-xs text-yellow-500 font-mono"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] text-zinc-600 uppercase">Weight:</span>
                                            <input
                                                type="number"
                                                value={config.slots.weights[i]}
                                                onChange={(e) => {
                                                    const newWeights = [...config.slots.weights];
                                                    newWeights[i] = parseInt(e.target.value) || 0;
                                                    setConfig({ ...config, slots: { ...config.slots, weights: newWeights } });
                                                }}
                                                className="w-full bg-zinc-800 border-none rounded px-2 py-1 text-xs text-white font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Minesweeper Controller */}
                <section className="xl:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500 font-bold">M</div>
                        <h2 className="text-lg font-bold text-white">Minesweeper Rewards & Difficulty</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(['EASY', 'MEDIUM', 'HARD'] as const).map(diff => (
                            <div key={diff} className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 space-y-4">
                                <h3 className={`text-sm font-bold uppercase tracking-widest ${diff === 'EASY' ? 'text-emerald-400' : diff === 'MEDIUM' ? 'text-yellow-500' : 'text-red-500'
                                    }`}>{diff}</h3>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs text-zinc-500">Grid Size</label>
                                        <input
                                            type="number"
                                            value={config.minesweeper[diff].gridSize}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 1;
                                                setConfig({
                                                    ...config,
                                                    minesweeper: {
                                                        ...config.minesweeper,
                                                        [diff]: { ...config.minesweeper[diff], gridSize: val }
                                                    }
                                                });
                                            }}
                                            className="w-16 bg-zinc-800 border-none rounded-lg px-2 py-1 text-right text-sm text-white font-mono"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs text-zinc-500">Mine Count</label>
                                        <input
                                            type="number"
                                            value={config.minesweeper[diff].mineCount}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 0;
                                                setConfig({
                                                    ...config,
                                                    minesweeper: {
                                                        ...config.minesweeper,
                                                        [diff]: { ...config.minesweeper[diff], mineCount: val }
                                                    }
                                                });
                                            }}
                                            className="w-16 bg-zinc-800 border-none rounded-lg px-2 py-1 text-right text-sm text-white font-mono"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                        <label className="text-xs font-bold text-zinc-400">Points Reward</label>
                                        <input
                                            type="number"
                                            value={config.minesweeper[diff].points}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 0;
                                                setConfig({
                                                    ...config,
                                                    minesweeper: {
                                                        ...config.minesweeper,
                                                        [diff]: { ...config.minesweeper[diff], points: val }
                                                    }
                                                });
                                            }}
                                            className="w-20 bg-zinc-800 border-none rounded-lg px-2 py-1 text-right text-sm text-emerald-400 font-bold font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="fixed bottom-6 right-6 hidden md:block">
                <div className="bg-zinc-900 border border-white/10 p-1 rounded-xl shadow-2xl flex gap-1">
                    <button onClick={handleSave} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-all">Save All Changes</button>
                </div>
            </div>
        </div>
    );
};

export default GameTuner;
