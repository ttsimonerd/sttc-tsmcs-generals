import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getPoints, addPointsWithMultiplier, spendPoints } from '../services/pointsService';
import confetti from 'canvas-confetti';
import { Badge, Button, PageHeader, Panel, cn } from './ui/Primitives';

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
    if (freeSpins > 0) {
      setFreeSpins(prev => prev - 1);
    } else if (points < config.spinCost) {
      return;
    } else {
      spendPoints(config.spinCost);
      setPoints(getPoints());
    }

    setIsSpinning(true);
    setSpinningReels([true, true, true]);
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
        message = `Three of a kind · ${r1.name}`;
      } else if (r1.emoji === r2.emoji || r2.emoji === r3.emoji || r1.emoji === r3.emoji) {
        const matching = r1.emoji === r2.emoji ? r1 : r3.emoji === r2.emoji ? r2 : r1;
        multiplier = matching.multiplier;
        message = `Pair · ${matching.name}`;
      } else {
        message = 'No match';
      }

      if (multiplier > 0) {
        const baseWinPts = multiplier * config.spinCost;
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

      const nextSpinCount = spinCount + 1;
      setSpinCount(nextSpinCount);
      if (config.freeSpinInterval > 0 && nextSpinCount % config.freeSpinInterval === 0) {
        setFreeSpins(f => f + 1);
      }
    }, 1500);
  };

  const canAffordSpin = freeSpins > 0 || points >= config.spinCost;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mini game"
        title="Slot machine"
        description={`Match symbols to win. Each spin costs ${config.spinCost} pts and every ${config.freeSpinInterval} spins earns a free one.`}
        actions={
          <>
            <div className="chip">
              <span className="text-zinc-500">SP</span>
              <span className="font-bold tabular-nums text-white">{points}</span>
            </div>
            {freeSpins > 0 && <Badge tone="warning">{freeSpins} free spin{freeSpins > 1 ? 's' : ''}</Badge>}
          </>
        }
      />

      {winAmount > 0 && (
        <Panel tone="accent" className="p-5 text-center fade-in">
          <p className="text-[15px] font-semibold text-emerald-300">{winMessage}</p>
          <p className="mt-1 text-sm text-zinc-300">
            +{winAmount} pts{wasDoubled && <span className="ml-1 text-amber-300">· double points</span>}
          </p>
        </Panel>
      )}

      <Panel className="p-5 sm:p-7">
        <div className="flex flex-col items-center gap-6">
          <div className="grid w-full max-w-md grid-cols-3 gap-2 sm:gap-4">
            {reels.map((symbol, index) => (
              <div
                key={index}
                aria-label={spinningReels[index] ? 'Reel spinning' : symbol.name}
                className={cn(
                  'flex aspect-[3/4] items-center justify-center rounded-2xl border transition-colors',
                  spinningReels[index]
                    ? 'border-[color:var(--line-strong)] bg-white/[0.04]'
                    : 'border-amber-400/25 bg-black/30'
                )}
              >
                {spinningReels[index] ? (
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-amber-400" />
                ) : (
                  <span className="text-5xl drop-shadow-lg sm:text-6xl">{symbol.emoji}</span>
                )}
              </div>
            ))}
          </div>

          <Button
            size="lg"
            onClick={spin}
            disabled={isSpinning || !canAffordSpin}
            className={cn('w-full max-w-sm', canAffordSpin && !isSpinning && 'bg-amber-400 text-black hover:brightness-105')}
          >
            {isSpinning ? 'Spinning…' : !canAffordSpin ? 'Not enough points' : `Spin${freeSpins > 0 ? ' · free' : ''}`}
          </Button>

          <p className="text-[11px] text-zinc-600">
            Spins played: <span className="font-mono text-zinc-400">{spinCount}</span>
          </p>
        </div>
      </Panel>

      <div className="grid gap-6 md:grid-cols-3">
        <Panel className="p-5 md:col-span-2">
          <p className="eyebrow">Payouts</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: '2 matching', value: '2x – 20x' },
              { label: '3 crowns', value: '60x' },
              { label: '3 diamonds', value: '30x' },
              { label: '3 stars', value: '15x' },
            ].map(row => (
              <div key={row.label} className="rounded-lg border border-[color:var(--line)] bg-black/25 px-3 py-2 text-center">
                <p className="text-[9px] uppercase tracking-wider text-zinc-600">{row.label}</p>
                <p className="mt-1 font-mono text-sm font-bold text-amber-300">{row.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {SYMBOLS.slice(-3).map(symbol => (
              <span key={symbol.emoji} className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                <span className="text-base">{symbol.emoji}</span>
                <span className="font-mono text-zinc-400">{symbols[SYMBOLS.indexOf(symbol)].multiplier}x</span>
              </span>
            ))}
          </div>
        </Panel>

        <Panel tone="muted" className="p-5">
          <p className="eyebrow">How it works</p>
          <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-zinc-500">
            <li>Every spin costs {config.spinCost} pts and always returns something on a match.</li>
            <li>Free spins are awarded every {config.freeSpinInterval} spins.</li>
            <li>Double-points bonuses apply automatically.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
};

export default SlotMachine;
