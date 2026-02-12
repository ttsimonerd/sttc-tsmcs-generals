import React, { useState } from 'react';
import { addPoints } from '../services/pointsService';

const MiniGames: React.FC = () => {
    const [status, setStatus] = useState<string>('Select a module to begin...');

    const [isProcessing, setIsProcessing] = useState(false);

    const playDice = () => {
        setIsProcessing(true);
        setStatus('Rolling multi-faceted dice...');
        setTimeout(() => {
            const roll = Math.floor(Math.random() * 6) + 1;
            const reward = roll * 5;
            addPoints(reward);
            setStatus(`Rolled a ${roll}! You earned ${reward} points.`);
            setIsProcessing(false);
        }, 1000);
    };

    const playCoin = () => {
        setIsProcessing(true);
        setStatus('Flipping gravity-defying coin...');
        setTimeout(() => {
            const isHeads = Math.random() > 0.5;
            const outcome = isHeads ? 'HEADS' : 'TAILS';
            const reward = isHeads ? 25 : 0;
            if (isHeads) addPoints(reward);
            setStatus(`Result: ${outcome}. ${isHeads ? 'Winner! +25 pts' : 'Better luck next time.'}`);
            setIsProcessing(false);
        }, 1000);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Arcade Modules</h1>
                <p className="text-zinc-500 text-sm mt-1">Acquire points through high-risk operations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dice Game */}
                <div className="glass-panel p-8 rounded-3xl border-white/10 flex flex-col items-center space-y-6 hover:border-theme-primary/30 transition-all group">
                    <div className="text-6xl group-hover:scale-110 transition-transform duration-500">🎲</div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter">Quantum Dice</h3>
                        <p className="text-zinc-500 text-xs mt-1">Reward = Roll x 5 pts</p>
                    </div>
                    <button
                        onClick={playDice}
                        disabled={isProcessing}
                        className="w-full py-3 bg-white text-black rounded-xl font-black uppercase tracking-widest text-xs hover:bg-theme-primary hover:text-white transition-all"
                    >
                        Roll Dice
                    </button>
                </div>

                {/* Coin Flip */}
                <div className="glass-panel p-8 rounded-3xl border-white/10 flex flex-col items-center space-y-6 hover:border-theme-primary/30 transition-all group">
                    <div className="text-6xl group-hover:scale-110 transition-transform duration-500">🪙</div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter">Binary Flip</h3>
                        <p className="text-zinc-500 text-xs mt-1">Heads = 25 pts | Tails = 0 pts</p>
                    </div>
                    <button
                        onClick={playCoin}
                        disabled={isProcessing}
                        className="w-full py-3 bg-white text-black rounded-xl font-black uppercase tracking-widest text-xs hover:bg-theme-primary hover:text-white transition-all"
                    >
                        Flip Coin
                    </button>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border-white/5 flex items-center justify-center min-h-[100px] text-center">
                <p className={`text-sm font-medium tracking-wide ${isProcessing ? 'animate-pulse text-theme-primary' : 'text-zinc-400'}`}>
                    {status}
                </p>
            </div>
        </div>
    );
};

export default MiniGames;
