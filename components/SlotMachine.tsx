import React, { useState, useEffect, useCallback, useRef } from 'react';
import { addPoints, getPoints, addPointsWithMultiplier } from '../services/pointsService';
import confetti from 'canvas-confetti';

interface SlotSymbol {
  emoji: string;
  name: string;
  multiplier: number;
}

const SYMBOLS: SlotSymbol[] = [
  { emoji: '🍒', name: 'Cherry', multiplier: 2 },
  { emoji: '🍋', name: 'Lemon', multiplier: 2 },
  { emoji: '🍊', name: 'Orange', multiplier: 3 },
  { emoji: '🍇', name: 'Grape', multiplier: 3 },
  { emoji: '⭐', name: 'Star', multiplier: 5 },
  { emoji: '💎', name: 'Diamond', multiplier: 10 },
  { emoji: '👑', name: 'Crown', multiplier: 20 },
];

import { getTunerConfig } from '../services/gameTunerService';

const SlotMachine: React.FC = () => {
  const [config] = useState(getTunerConfig().slots);
  const [reels, setReels] = useState<SlotSymbol[]>([
    SYMBOLS[0],
    SYMBOLS[0],
    SYMBOLS[0],
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningReels, setSpinningReels] = useState([false, false, false]);
  const [points, setPoints] = useState(0);
  const [winAmount, setWinAmount] = useState(0);
  const [winMessage, setWinMessage] = useState('');
  const [spinCount, setSpinCount] = useState(0);
  const [freeSpins, setFreeSpins] = useState(0);
  const [wasDoubled, setWasDoubled] = useState(false);
  const finalReelsRef = useRef<SlotSymbol[]>([SYMBOLS[0], SYMBOLS[0], SYMBOLS[0]]);

  useEffect(() => {
    setPoints(getPoints());
  }, []);

  const symbols = SYMBOLS.map((s, i) => ({
    ...s,
    multiplier: config.multipliers[i]
  }));

  const getWeightedSymbol = useCallback(() => {
    const totalWeight = config.weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < config.weights.length; i++) {
      random -= config.weights[i];
      if (random <= 0) {
        return symbols[i];
      }
    }
    return symbols[0];
  }, [config, symbols]);

  const spin = () => {
    // ...
    if (freeSpins > 0) {
      setFreeSpins(prev => prev - 1);
    } else if (points < config.spinCost) {
      return;
    } else {
      const newPoints = getPoints() - config.spinCost;
      setPoints(newPoints);
    }

    setIsSpinning(true);
    setWinAmount(0);
    setWinMessage('');
    setWasDoubled(false);

    // Pre-determine final results
    const finalResults: SlotSymbol[] = [
      getWeightedSymbol(),
      getWeightedSymbol(),
      getWeightedSymbol(),
    ];
    finalReelsRef.current = finalResults;

    const spinSymbols = SYMBOLS;

    // Animate each reel
    [0, 1, 2].forEach((reelIndex) => {
      let counter = 0;
      const maxSpins = 10 + reelIndex * 3;

      const spinInterval = setInterval(() => {
        setReels(prev => {
          const newReels = [...prev];
          newReels[reelIndex] = spinSymbols[Math.floor(Math.random() * spinSymbols.length)];
          return newReels;
        });
        counter++;

        if (counter >= maxSpins) {
          clearInterval(spinInterval);
          // Set to the pre-determined final result
          setReels(prev => {
            const newReels = [...prev];
            newReels[reelIndex] = finalResults[reelIndex];
            return newReels;
          });

          setSpinningReels(prev => {
            const newSpinning = [...prev];
            newSpinning[reelIndex] = false;
            return newSpinning;
          });
        }
      }, 100);
    });

    setTimeout(() => {
      setIsSpinning(false);
      setSpinningReels([false, false, false]);

      // Use the pre-determined final results
      const [r1, r2, r3] = finalReelsRef.current;
      let multiplier = 0;
      let message = '';

      if (r1.emoji === r2.emoji && r2.emoji === r3.emoji) {
        multiplier = r1.multiplier * 3;
        message = `JACKPOT! 3x ${r1.name}`;
      } else if (r1.emoji === r2.emoji || r2.emoji === r3.emoji || r1.emoji === r3.emoji) {
        const matching = r1.emoji === r2.emoji ? r1 : r3.emoji === r2.emoji ? r2 : r1;
        multiplier = matching.multiplier;
        message = `PAIR! 2x ${matching.name}`;
      } else {
        message = 'No win this time...';
      }

      if (multiplier > 0) {
        const baseWinPts = multiplier * 5;
        const { doubled } = addPointsWithMultiplier(baseWinPts);
        const finalWinPts = doubled ? baseWinPts * 2 : baseWinPts;
        setWinAmount(finalWinPts);
        setWinMessage(message);
        setWasDoubled(doubled);
        setPoints(getPoints());

        if (multiplier >= 30) {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#fbbf24', '#f59e0b', '#ef4444', '#10b981'],
          });
        } else if (multiplier >= 15) {
          confetti({
            particleCount: 75,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#fbbf24', '#f59e0b'],
          });
        } else {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#10b981', '#06b6d4'],
          });
        }
      }

      setSpinCount(prev => {
        const newCount = prev + 1;
        if (newCount % 10 === 0) {
          setFreeSpins(f => f + 1);
        }
        return newCount;
      });
    }, 1500);
  };

  const canAffordSpin = points >= 5 || freeSpins > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Slot Machine</h2>
        <p className="text-zinc-400">Match symbols to win! (No losses - only 5 pts to play)</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-xl border border-white/10">
        <div className="text-zinc-400 text-sm">
          <span className="text-white font-bold">{points}</span> pts
        </div>
        <div className="text-zinc-500 text-xs">
          Spin Cost: 5 pts | 1 free spin every 10 spins
        </div>
        {freeSpins > 0 && (
          <div className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
            {freeSpins} FREE SPIN{freeSpins > 1 ? 'S' : ''}
          </div>
        )}
      </div>

      {winAmount > 0 && (
        <div className="p-6 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-center animate-fade-in-up">
          <p className="text-4xl mb-2 animate-bounce">🎉</p>
          <p className="text-emerald-400 font-bold text-2xl">{winMessage}</p>
          <p className="text-white font-bold text-xl">+{winAmount} pts{wasDoubled && <span className="text-yellow-400 ml-2">(2x!)</span>}</p>
        </div>
      )}

      <div className="glass-panel p-8 rounded-2xl border border-white/10">
        <div className="flex justify-center gap-4 mb-8">
          {reels.map((symbol, index) => (
            <div
              key={index}
              className={`
                w-24 h-32 md:w-32 md:h-40 rounded-2xl border-4 flex items-center justify-center
                ${spinningReels[index]
                  ? 'bg-zinc-800 border-zinc-600 animate-pulse'
                  : 'bg-gradient-to-br from-zinc-800 to-zinc-900 border-yellow-500/50'
                }
              `}
            >
              <span className="text-5xl md:text-6xl filter drop-shadow-lg">
                {spinningReels[index] ? (
                  <span className="animate-spin">🎰</span>
                ) : (
                  <span>{symbol.emoji}</span>
                )}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-6 mb-6 text-sm">
          {SYMBOLS.slice(-3).map(symbol => (
            <div key={symbol.emoji} className="text-center">
              <span className="text-2xl">{symbol.emoji}</span>
              <p className="text-zinc-500">{symbol.multiplier}x</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={spin}
            disabled={isSpinning || !canAffordSpin}
            className={`
              px-12 py-4 rounded-xl font-bold text-xl transition-all
              hover:scale-105 active:scale-95 shadow-lg
              ${!canAffordSpin
                ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                : isSpinning
                  ? 'bg-zinc-600 text-zinc-400 cursor-wait'
                  : 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black'
              }
            `}
          >
            {isSpinning ? (
              <span className="animate-pulse">SPINNING...</span>
            ) : !canAffordSpin ? (
              'NOT ENOUGH POINTS'
            ) : (
              `SPIN${freeSpins > 0 ? ' (FREE)' : ''}`
            )}
          </button>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-white/5">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Payout Table</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-zinc-900/50 p-3 rounded-lg text-center">
            <p className="text-zinc-500 text-xs mb-1">2 matching</p>
            <p className="text-white font-bold">2x - 20x</p>
          </div>
          <div className="bg-zinc-900/50 p-3 rounded-lg text-center">
            <p className="text-zinc-500 text-xs mb-1">3x Crown</p>
            <p className="text-yellow-400 font-bold">60x</p>
          </div>
          <div className="bg-zinc-900/50 p-3 rounded-lg text-center">
            <p className="text-zinc-500 text-xs mb-1">3x Diamond</p>
            <p className="text-cyan-400 font-bold">30x</p>
          </div>
          <div className="bg-zinc-900/50 p-3 rounded-lg text-center">
            <p className="text-zinc-500 text-xs mb-1">3x Star</p>
            <p className="text-yellow-300 font-bold">15x</p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-3">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">How to Play</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-zinc-400">
          <div className="space-y-1">
            <p className="text-white font-medium">Cost</p>
            <p>Only 5 points per spin! No losses.</p>
          </div>
          <div className="space-y-1">
            <p className="text-white font-medium">Payouts</p>
            <p>Match 2 symbols for small win, 3 for big!</p>
          </div>
          <div className="space-y-1">
            <p className="text-white font-medium">Free Spins</p>
            <p>Get 1 free spin for every 10 plays!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotMachine;

