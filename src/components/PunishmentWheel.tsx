import React, { useState } from 'react';

interface PunishmentWheelProps {
    isOwner?: boolean;
}

const DEFAULT_PUNISHMENTS = [
    "10 Pushups",
    "No Snacks for 1 Hour",
    "Drink a glass of water",
    "Clean your desk",
    "Do a 30-second plank",
    "Mute for 5 minutes",
    "Write a 50-word essay",
    "Sing a song",
];

const PunishmentWheel: React.FC<PunishmentWheelProps> = ({ isOwner = false }) => {
    const [punishments, setPunishments] = useState(DEFAULT_PUNISHMENTS);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState<string | null>(null);

    const spinWheel = () => {
        if (isSpinning) return;

        setIsSpinning(true);
        setResult(null);

        const extraSpins = 5 + Math.floor(Math.random() * 5);
        const randomDegree = Math.floor(Math.random() * 360);
        const newRotation = rotation + (extraSpins * 360) + randomDegree;

        setRotation(newRotation);

        setTimeout(() => {
            setIsSpinning(false);
            const actualDegree = newRotation % 360;
            const segmentSize = 360 / punishments.length;
            // The pointer is at the top (0 deg), but CSS rotation is clockwise.
            // We need to find which segment landed at the top.
            // (360 - actualDegree) gives the relative position of the top pointer.
            const segmentIndex = Math.floor(((360 - (actualDegree % 360)) % 360) / segmentSize);
            setResult(punishments[segmentIndex]);
        }, 4000);
    };

    return (
        <div className="space-y-8 animate-fade-in flex flex-col items-center">
            <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-white uppercase italic tracking-tighter">Punishment Wheel</h1>
                <p className="text-zinc-500 text-sm mt-1">Accept the verdict of the rotation</p>
            </div>

            <div className="relative mt-12 mb-20 group">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-6 h-8 bg-theme-primary z-20 clip-path-triangle shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)]"></div>

                {/* Wheel */}
                <div
                    className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full border-8 border-zinc-800 relative transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1) overflow-hidden shadow-2xl"
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    {punishments.map((p, i) => {
                        const angle = (360 / punishments.length) * i;
                        return (
                            <div
                                key={i}
                                className="absolute top-0 left-0 w-full h-full"
                                style={{ transform: `rotate(${angle}deg)` }}
                            >
                                <div
                                    className={`absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1/2 bg-white/10 origin-bottom`}
                                ></div>
                                <div
                                    className="absolute top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-zinc-300 uppercase tracking-widest text-center max-w-[60px]"
                                    style={{ transform: 'rotate(0deg)' }}
                                >
                                    {p}
                                </div>
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((Math.PI / 180) * (-(360 / punishments.length) / 2 - 90))}% ${50 + 50 * Math.sin((Math.PI / 180) * (-(360 / punishments.length) / 2 - 90))}%, ${50 + 50 * Math.cos((Math.PI / 180) * ((360 / punishments.length) / 2 - 90))}% ${50 + 50 * Math.sin((Math.PI / 180) * ((360 / punishments.length) / 2 - 90))}%)`,
                                        backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.2)'
                                    }}
                                ></div>
                            </div>
                        );
                    })}
                </div>

                {/* Hub */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-zinc-900 border-4 border-zinc-800 rounded-full z-10 shadow-lg"></div>
            </div>

            <div className="w-full max-w-md space-y-6">
                <button
                    onClick={spinWheel}
                    disabled={isSpinning}
                    className={`w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] transition-all ${isSpinning ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:scale-[1.02] active:scale-[0.98] shadow-xl'
                        }`}
                >
                    {isSpinning ? 'The Wheel Decides...' : 'Engage Rotation'}
                </button>

                {result && !isSpinning && (
                    <div className="glass-panel p-6 rounded-2xl border-theme-primary/30 text-center animate-pop-in">
                        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Verdict</p>
                        <h2 className="text-2xl font-bold font-theme-primary text-theme-primary">{result}</h2>
                    </div>
                )}
            </div>

            {isOwner && (
                <div className="w-full max-w-2xl glass-panel p-6 rounded-2xl border-white/5 mt-12 space-y-4">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Punishment Configuration</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {punishments.map((p, i) => (
                            <div key={i} className="flex gap-2">
                                <input
                                    type="text"
                                    value={p}
                                    onChange={(e) => {
                                        const updated = [...punishments];
                                        updated[i] = e.target.value;
                                        setPunishments(updated);
                                    }}
                                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-theme-primary/50"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PunishmentWheel;
