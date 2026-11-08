import React, { useState, useEffect, useRef, useCallback } from 'react';
import { spendPoints, getPoints, addPointsWithMultiplier } from '../services/pointsService';
import confetti from 'canvas-confetti';
import { Badge, Button, PageHeader, Panel, cn } from './ui/Primitives';

type GameState = 'IDLE' | 'RISING' | 'CASHED_OUT' | 'CRASHED';

import { getTunerConfig } from '../services/gameTunerService';

const CrashGame: React.FC = () => {
  const [config] = useState(getTunerConfig().crash);
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

    for (const { value, prob } of config.distribution) {
      cumulative += prob;
      if (roll < cumulative) {
        return value;
      }
    }
    return 2.00;
  }, [config]);

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
    // Owner-tunable growth rate: the round reaches its crash point after 1/speed seconds,
    // so a higher speed means less time to cash out.
    const speed = config.speed > 0 ? config.speed : 0.5;

    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const newMultiplier = 1 + Math.pow(elapsed * speed, 2) * (crashPoint - 1);
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

  const pillTone = (crash: number) =>
    crash < 2 ? 'text-red-300' : crash < 5 ? 'text-amber-300' : 'text-emerald-300';

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mini game"
        title="Crash"
        description="The multiplier climbs until it breaks. Cash out before it does."
        actions={
          <div className="chip">
            <span className="text-zinc-500">SP</span>
            <span className="font-bold tabular-nums text-white">{points}</span>
          </div>
        }
      />

      <Panel tone="muted" className="flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-zinc-600">Recent</span>
          {history.length === 0 ? (
            <span className="text-xs text-zinc-600">No rounds yet</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {history.slice(0, 5).map((crash, i) => (
                <span key={i} className={cn('rounded-md bg-white/[0.04] px-1.5 py-0.5 font-mono text-[11px] font-semibold', pillTone(crash))}>
                  {crash.toFixed(2)}x
                </span>
              ))}
            </div>
          )}
        </div>
        <Badge tone={gameState === 'RISING' ? 'primary' : gameState === 'CRASHED' ? 'danger' : gameState === 'CASHED_OUT' ? 'warning' : 'default'}>
          {gameState === 'RISING' ? 'In flight' : gameState === 'CRASHED' ? 'Crashed' : gameState === 'CASHED_OUT' ? 'Cashed out' : 'Idle'}
        </Badge>
      </Panel>

      <Panel className="p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div>
            <p className="eyebrow">{gameState === 'RISING' ? 'Live multiplier' : 'Multiplier'}</p>
            <p
              className={cn(
                'mt-2 font-mono text-6xl font-black tabular-nums transition-colors duration-300 sm:text-7xl',
                getMultiplierColor()
              )}
            >
              {multiplier.toFixed(2)}x
            </p>

            {gameState === 'CASHED_OUT' && (
              <p className="mt-2 text-sm font-semibold text-emerald-300">
                Cashed out · +{payout} pts{wasDoubled ? ' · double points applied' : ''}
              </p>
            )}
            {gameState === 'CRASHED' && (
              <p className="mt-2 text-sm font-semibold text-red-300">
                Crashed at {lastCrashRef.current.toFixed(2)}x
              </p>
            )}
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-75',
                multiplier < 2 ? 'bg-zinc-500' : multiplier < 5 ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-400 to-red-500'
              )}
              style={{ width: `${Math.min(100, (multiplier / 10) * 100)}%` }}
            />
          </div>

          {gameState === 'IDLE' && (
            <div className="w-full max-w-sm space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-[color:var(--line)] bg-black/25 px-3 py-2">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500">Bet</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBetAmount(Math.max(1, betAmount - 5))}
                    aria-label="Decrease bet"
                    className="grid h-7 w-7 place-items-center rounded-lg border border-[color:var(--line)] text-base leading-none text-zinc-300 transition-colors hover:border-[color:var(--line-strong)] hover:text-white"
                  >
                    −
                  </button>
                  <span className="w-20 text-center font-mono text-sm font-bold tabular-nums text-white">{betAmount} pts</span>
                  <button
                    type="button"
                    onClick={() => setBetAmount(Math.min(points, betAmount + 5))}
                    aria-label="Increase bet"
                    className="grid h-7 w-7 place-items-center rounded-lg border border-[color:var(--line)] text-base leading-none text-zinc-300 transition-colors hover:border-[color:var(--line-strong)] hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-1.5">
                {[10, 25, 50, 100].map(amount => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setBetAmount(Math.min(points, amount))}
                    disabled={points < amount}
                    className={cn(
                      'rounded-lg border px-2.5 py-1 font-mono text-[11px] font-semibold transition-all disabled:opacity-30',
                      betAmount === amount
                        ? 'border-theme-primary-soft bg-theme-primary-soft text-white'
                        : 'border-[color:var(--line)] text-zinc-400 hover:border-[color:var(--line-strong)] hover:text-white'
                    )}
                  >
                    {amount}
                  </button>
                ))}
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={startGame}
                disabled={points < betAmount || betAmount < 1}
                className="w-full"
              >
                Start round
              </Button>
            </div>
          )}

          {gameState === 'RISING' && (
            <Button
              size="lg"
              onClick={cashOut}
              className="w-full max-w-sm bg-amber-400 text-black hover:brightness-105"
            >
              Cash out at {multiplier.toFixed(2)}x
            </Button>
          )}

          {(gameState === 'CASHED_OUT' || gameState === 'CRASHED') && (
            <Button size="lg" variant="secondary" onClick={resetGame} className="w-full max-w-sm">
              Play again
            </Button>
          )}
        </div>
      </Panel>

      <div className="grid gap-6 md:grid-cols-3">
        <Panel className="p-5">
          <p className="eyebrow">Round history</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {history.length === 0 ? (
              <p className="text-xs text-zinc-600">No rounds played yet.</p>
            ) : (
              history.map((crash, i) => (
                <span
                  key={i}
                  className={cn('rounded-lg bg-white/[0.04] px-2 py-1 font-mono text-xs font-semibold', pillTone(crash))}
                >
                  {crash.toFixed(2)}x
                </span>
              ))
            )}
          </div>
        </Panel>

        <Panel tone="muted" className="p-5 md:col-span-2">
          <p className="eyebrow">How it works</p>
          <div className="mt-3 grid gap-3 text-xs leading-relaxed text-zinc-500 sm:grid-cols-3">
            <div>
              <p className="text-[13px] font-medium text-zinc-200">Bet</p>
              <p className="mt-0.5">Your stake is taken when the round starts.</p>
            </div>
            <div>
              <p className="text-[13px] font-medium text-zinc-200">Cash out</p>
              <p className="mt-0.5">Stake × multiplier is paid instantly.</p>
            </div>
            <div>
              <p className="text-[13px] font-medium text-zinc-200">Crash</p>
              <p className="mt-0.5">Miss the window and the stake is lost.</p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default CrashGame;
