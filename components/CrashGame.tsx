import React, { useState, useEffect, useRef, useCallback } from 'react';
import { addPoints, spendPoints, getPoints, addPointsWithMultiplier } from '../services/pointsService';
import confetti from 'canvas-confetti';

type GameState = 'IDLE' | 'RISING' | 'CASHED_OUT' | 'CRASHED';

const CrashGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [multiplier, setMultiplier] = useState(1.00);
  const [betAmount, setBetAmount] = useState(10);
  const [points, setPoints] = useState(0);
  const [payout, setPayout] = useState(0);
  const [wasDoubled, setWasDoubled] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastCrashRef = useRef<number>(1.00);

  useEffect(() => {
    setPoints(getPoints());
  }, []);

  const generateCrashPoint = useCallback(() => {
    const roll = Math.random();
    let cumulative = 0;
    const distribution = [
      { value: 1.01, prob: 0.05 },
      { value: 1.10, prob: 0.08 },
      { value: 1.50, prob: 0.12 },
      { value: 2.00, prob: 0.15 },
      { value: 3.00, prob: 0.20 },
      { value: 5.00, prob: 0.15 },
      { value: 10.00, prob: 0.10 },
      { value: 20.00, prob: 0.08 },
      { value: 50.00, prob: 0.05 },
      { value: 100.00, prob: 0.02 },
    ];

    for (const { value, prob } of distribution) {
      cumulative += prob;
      if (roll < cumulative) {
        return value;
      }
    }
    return 2.00;
  }, []);

  const startGame = () => {
    if (betAmount > points) return;
    if (betAmount < 1) return;

    spendPoints(betAmount);
    setPoints(getPoints());
    setPayout(0);
    setMultiplier(1.00);
    setGameState('RISING');

    const crashPoint = generateCrashPoint();
    lastCrashRef.current = crashPoint;

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const newMultiplier = 1 + Math.pow(elapsed * 0.5, 2) * (crashPoint - 1);
      setMultiplier(Math.min(newMultiplier, crashPoint));

      if (newMultiplier >= crashPoint) {
        setGameState('CRASHED');
        setHistory(prev => [crashPoint, ...prev].slice(0, 10));
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const cashOut = () => {
    if (gameState !== 'RISING') return;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const baseWinAmount = Math.floor(betAmount * multiplier);
    const { doubled } = addPointsWithMultiplier(baseWinAmount);
    const finalWinAmount = doubled ? baseWinAmount * 2 : baseWinAmount;
    setPayout(finalWinAmount);
    setWasDoubled(doubled);
    setPoints(getPoints());
    setGameState('CASHED_OUT');

    if (multiplier >= 3) {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#10b981'],
      });
    } else if (multiplier >= 2) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4'],
      });
    }
  };

  const resetGame = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setGameState('IDLE');
    setMultiplier(1.00);
    setPayout(0);
  };

  const getMultiplierColor = () => {
    if (multiplier < 1.5) return 'text-zinc-400';
    if (multiplier < 2) return 'text-emerald-400';
    if (multiplier < 3) return 'text-yellow-400';
    if (multiplier < 5) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Crash</h2>
        <p className="text-zinc-400">Cash out before it crashes!</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-xl border border-white/10">
        <div className="text-zinc-400 text-sm">
          <span className="text-white font-bold">{points}</span> pts
        </div>
        <div className="flex gap-2">
          {history.slice(0, 5).map((crash, i) => (
            <span
              key={i}
              className={`text-xs px-2 py-1 rounded ${
                crash < 2 ? 'bg-red-500/20 text-red-400' :
                crash < 5 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}
            >
              {crash.toFixed(2)}x
            </span>
          ))}
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-white/10 text-center space-y-6">
        <div className="relative">
          <div className={`text-6xl md:text-7xl font-black font-mono ${getMultiplierColor()} transition-colors duration-300`}>
            {multiplier.toFixed(2)}x
          </div>
          {gameState === 'CASHED_OUT' && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-black text-sm font-bold px-3 py-1 rounded-full animate-bounce">
              CASHED OUT! +{payout} pts{wasDoubled && ' (2x!)'}
            </div>
          )}
          {gameState === 'CRASHED' && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-shake">
              CRASHED @ {lastCrashRef.current.toFixed(2)}x
            </div>
          )}
        </div>

        <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`absolute left-0 top-0 h-full transition-all duration-75 rounded-full ${
              multiplier < 2 ? 'bg-zinc-500' :
              multiplier < 5 ? 'bg-emerald-500' :
              'bg-gradient-to-r from-yellow-500 to-red-500'
            }`}
            style={{ width: `${Math.min(100, (multiplier / 10) * 100)}%` }}
          />
        </div>

        {gameState === 'IDLE' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setBetAmount(Math.max(1, betAmount - 5))}
                className="w-12 h-12 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white text-xl font-bold transition-all active:scale-95"
              >
                -
              </button>
              <div className="text-center">
                <p className="text-zinc-500 text-xs uppercase tracking-widest">Bet Amount</p>
                <p className="text-2xl font-bold text-white">{betAmount} pts</p>
              </div>
              <button
                onClick={() => setBetAmount(Math.min(points, betAmount + 5))}
                className="w-12 h-12 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white text-xl font-bold transition-all active:scale-95"
              >
                +
              </button>
            </div>

            <div className="flex justify-center gap-2">
              {[10, 25, 50, 100].map(amount => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(Math.min(points, amount))}
                  disabled={points < amount}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    betAmount === amount
                      ? 'bg-emerald-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  } disabled:opacity-50`}
                >
                  {amount}
                </button>
              ))}
            </div>

            <button
              onClick={startGame}
              disabled={points < betAmount || betAmount < 1}
              className="px-12 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              START CRASH
            </button>
          </div>
        )}

        {gameState === 'RISING' && (
          <button
            onClick={cashOut}
            className="px-12 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black rounded-xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-yellow-500/25 animate-pulse"
          >
            CASH OUT @ {multiplier.toFixed(2)}x
          </button>
        )}

        {(gameState === 'CASHED_OUT' || gameState === 'CRASHED') && (
          <button
            onClick={resetGame}
            className="px-8 py-4 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
          >
            Play Again
          </button>
        )}
      </div>

      <div className="glass-panel p-6 rounded-xl border border-white/5">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Recent Crashes</h3>
        <div className="flex flex-wrap gap-2">
          {history.length === 0 ? (
            <p className="text-zinc-600 text-sm italic">No games played yet</p>
          ) : (
            history.map((crash, i) => (
              <span
                key={i}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                  crash < 2 ? 'bg-red-500/20 text-red-400' :
                  crash < 5 ? 'bg-yellow-500/20 text-yellow-400' :
                  crash < 10 ? 'bg-green-500/20 text-green-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}
              >
                {crash.toFixed(2)}x
              </span>
            ))
          )}
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-3">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">How to Play</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-zinc-400">
          <div className="space-y-1">
            <p className="text-white font-medium">Goal</p>
            <p>Cash out before the multiplier crashes!</p>
          </div>
          <div className="space-y-1">
            <p className="text-white font-medium">Payout</p>
            <p>Your bet x multiplier = winnings</p>
          </div>
          <div className="space-y-1">
            <p className="text-white font-medium">Risk</p>
            <p>If you crash, you lose your bet!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrashGame;

