import React, { useState, useEffect } from 'react';
import { getTunerConfig, saveTunerConfig, resetTunerConfig } from '../services/gameTunerService';
import type { GameTunerConfig } from '../services/gameTunerService';
import { Badge, Button, PageHeader, Panel } from './ui/Primitives';
import { useToast } from './ui/Toast';
import { logAudit } from '../services/auditService';

const GameTuner: React.FC = () => {
    const { toast } = useToast();
    const [config, setConfig] = useState<GameTunerConfig | null>(null);

    useEffect(() => {
        setConfig(getTunerConfig());
    }, []);

    const handleSave = () => {
        if (config) {
            saveTunerConfig(config);
            toast('Game parameters updated.', 'success');
            logAudit('Saved game tuner settings');
        }
    };

    const handleReset = () => {
        if (confirm('Reset all game parameters to defaults?')) {
            resetTunerConfig();
            setConfig(getTunerConfig());
            toast('Factory settings restored.', 'info');
            logAudit('Reset game tuner');
        }
    };

    if (!config) {
        return (
            <Panel className="p-8">
                <p className="text-sm text-zinc-500">Loading tuner…</p>
            </Panel>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Configure"
                title="Game tuner"
                description="Multipliers, costs and difficulty for every mini-game. Changes apply to all players once saved."
                actions={
                    <>
                        <Button variant="secondary" onClick={handleReset}>Reset factory</Button>
                        <Button variant="primary" onClick={handleSave}>Apply changes</Button>
                    </>
                }
            />

            <div className="grid gap-6 xl:grid-cols-2">
                <Panel className="space-y-5 p-5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <span className="grid h-9 w-9 place-items-center rounded-lg bg-red-500/10 text-[12px] font-bold text-red-300">C</span>
                            <p className="text-[15px] font-semibold text-white">Crash</p>
                        </div>
                        <Badge tone="danger">{config.crash.speed.toFixed(2)}x speed</Badge>
                    </div>

                    <div className="rounded-xl border border-[color:var(--line)] bg-black/25 p-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500" htmlFor="crash-speed">
                                Multiplier growth speed
                            </label>
                            <span className="font-mono text-xs font-bold text-red-300">{config.crash.speed.toFixed(2)}x</span>
                        </div>
                        <input
                            id="crash-speed"
                            type="range"
                            min="0.1"
                            max="2.0"
                            step="0.05"
                            value={config.crash.speed}
                            onChange={(e) => setConfig({
                                ...config,
                                crash: { ...config.crash, speed: parseFloat(e.target.value) }
                            })}
                            className="mt-3 w-full accent-red-500"
                        />
                        <p className="mt-2 text-[10px] leading-relaxed text-zinc-600">
                            Higher values make the multiplier climb faster, so cashing out high becomes harder.
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <p className="eyebrow">Crash point distribution</p>
                            <span className="text-[10px] uppercase tracking-wider text-zinc-600">Sum ≈ 1.00</span>
                        </div>
                        <div className="mt-2.5 grid grid-cols-2 gap-2">
                            {config.crash.distribution.map((dist, i) => (
                                <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-[color:var(--line)] bg-black/25 px-3 py-2">
                                    <span className="font-mono text-xs text-zinc-300">{dist.value}x</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="1"
                                        aria-label={`Probability of ${dist.value}x`}
                                        value={dist.prob}
                                        onChange={(e) => {
                                            const newDist = [...config.crash.distribution];
                                            newDist[i] = { ...dist, prob: parseFloat(e.target.value) || 0 };
                                            setConfig({ ...config, crash: { ...config.crash, distribution: newDist } });
                                        }}
                                        className="field w-16 px-2 py-1 text-right font-mono text-xs text-red-300"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </Panel>

                <Panel className="space-y-5 p-5">
                    <div className="flex items-center gap-2.5">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-400/10 text-[12px] font-bold text-amber-300">S</span>
                        <p className="text-[15px] font-semibold text-white">Slots</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="field-label" htmlFor="slot-cost">Spin cost</label>
                            <input
                                id="slot-cost"
                                type="number"
                                value={config.slots.spinCost}
                                onChange={(e) => setConfig({
                                    ...config,
                                    slots: { ...config.slots, spinCost: parseInt(e.target.value) || 0 }
                                })}
                                className="field field-mono font-bold text-amber-300"
                            />
                        </div>
                        <div>
                            <label className="field-label" htmlFor="slot-free">Free spin interval</label>
                            <input
                                id="slot-free"
                                type="number"
                                value={config.slots.freeSpinInterval}
                                onChange={(e) => setConfig({
                                    ...config,
                                    slots: { ...config.slots, freeSpinInterval: parseInt(e.target.value) || 1 }
                                })}
                                className="field field-mono font-bold text-amber-300"
                            />
                        </div>
                    </div>

                    <div>
                        <p className="eyebrow">Symbol multipliers &amp; weights</p>
                        <div className="mt-2.5 space-y-1.5">
                            {['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '👑'].map((emoji, i) => (
                                <div key={emoji} className="flex items-center gap-3 rounded-lg border border-[color:var(--line)] bg-black/25 px-3 py-2">
                                    <span className="w-6 text-base leading-none">{emoji}</span>
                                    <div className="grid flex-1 grid-cols-2 gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] uppercase tracking-wider text-zinc-600">Mult</span>
                                            <input
                                                type="number"
                                                aria-label={`Multiplier for ${emoji}`}
                                                value={config.slots.multipliers[i]}
                                                onChange={(e) => {
                                                    const newMults = [...config.slots.multipliers];
                                                    newMults[i] = parseInt(e.target.value) || 0;
                                                    setConfig({ ...config, slots: { ...config.slots, multipliers: newMults } });
                                                }}
                                                className="field w-full px-2 py-1 text-right font-mono text-xs text-amber-300"
                                            />
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] uppercase tracking-wider text-zinc-600">Weight</span>
                                            <input
                                                type="number"
                                                aria-label={`Weight for ${emoji}`}
                                                value={config.slots.weights[i]}
                                                onChange={(e) => {
                                                    const newWeights = [...config.slots.weights];
                                                    newWeights[i] = parseInt(e.target.value) || 0;
                                                    setConfig({ ...config, slots: { ...config.slots, weights: newWeights } });
                                                }}
                                                className="field w-full px-2 py-1 text-right font-mono text-xs text-zinc-200"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Panel>

                <Panel className="space-y-5 p-5 xl:col-span-2">
                    <div className="flex items-center gap-2.5">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10 text-[12px] font-bold text-emerald-300">M</span>
                        <div>
                            <p className="text-[15px] font-semibold text-white">Minesweeper</p>
                            <p className="text-[11px] text-zinc-500">Difficulty, board size and payout per clear</p>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                        {(['EASY', 'MEDIUM', 'HARD'] as const).map(diff => {
                            const tone =
                                diff === 'EASY' ? 'text-emerald-300' : diff === 'MEDIUM' ? 'text-amber-300' : 'text-red-300';
                            return (
                                <div key={diff} className="rounded-xl border border-[color:var(--line)] bg-black/25 p-4">
                                    <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${tone}`}>{diff}</p>

                                    <div className="mt-3 space-y-2.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <label className="text-xs text-zinc-400" htmlFor={`grid-${diff}`}>Grid size</label>
                                            <input
                                                id={`grid-${diff}`}
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
                                                className="field w-16 px-2 py-1 text-right font-mono text-xs"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <label className="text-xs text-zinc-400" htmlFor={`mines-${diff}`}>Mine count</label>
                                            <input
                                                id={`mines-${diff}`}
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
                                                className="field w-16 px-2 py-1 text-right font-mono text-xs"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between gap-2 border-t border-[color:var(--line)] pt-2.5">
                                            <label className="text-xs font-semibold text-zinc-300" htmlFor={`points-${diff}`}>Points reward</label>
                                            <input
                                                id={`points-${diff}`}
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
                                                className="field w-20 px-2 py-1 text-right font-mono text-xs font-bold text-emerald-300"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Panel>
            </div>
        </div>
    );
};

export default GameTuner;
