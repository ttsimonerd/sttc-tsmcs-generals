import React from 'react';

const GameTuner: React.FC = () => {
    return (
        <div className="glass-panel p-8 rounded-2xl border border-white/10">
            <h1 className="text-2xl font-bold text-white mb-4">Game Tuner</h1>
            <p className="text-zinc-400">Adjust game payouts and difficulty.</p>
        </div>
    );
};

export default GameTuner;
