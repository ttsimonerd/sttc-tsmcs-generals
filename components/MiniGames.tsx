import React, { useState, useEffect } from 'react';
import { getPoints, spendPoints, addPointsWithMultiplier } from '../services/pointsService';
import { AppView } from '../types';
import { Badge, Button, PageHeader, Panel, Stat, cn } from './ui/Primitives';
import { useToast } from './ui/Toast';

interface MiniGamesProps {
  onSelectGame: (game: AppView) => void;
}

interface GameStats {
  wins: number;
  losses: number;
  totalPlayed: number;
  highScore: number;
}

const MiniGames: React.FC<MiniGamesProps> = ({ onSelectGame }) => {
  const { toast } = useToast();
  const [points, setPoints] = useState(0);
  const [currentGame, setCurrentGame] = useState<'coin' | 'dice' | null>(null);
  const [gameResult, setGameResult] = useState<string>('');
  const [betAmount, setBetAmount] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);

  // Game stats
  const [coinStats, setCoinStats] = useState<GameStats>({
    wins: 0, losses: 0, totalPlayed: 0, highScore: 0
  });
  const [diceStats, setDiceStats] = useState<GameStats>({
    wins: 0, losses: 0, totalPlayed: 0, highScore: 0
  });

  useEffect(() => {
    setPoints(getPoints());
    loadStats();
  }, []);

  const loadStats = () => {
    const coinData = localStorage.getItem('mini_game_coin_stats');
    const diceData = localStorage.getItem('mini_game_dice_stats');

    if (coinData) setCoinStats(JSON.parse(coinData));
    if (diceData) setDiceStats(JSON.parse(diceData));
  };

  const saveStats = (game: 'coin' | 'dice', stats: GameStats) => {
    localStorage.setItem(`mini_game_${game}_stats`, JSON.stringify(stats));
  };

  const showNotif = (message: string, type: 'success' | 'error') => {
    toast(message, type);
  };

  const handleBetChange = (amount: number) => {
    if (amount > points) {
      showNotif('Not enough points.', 'error');
      return;
    }
    setBetAmount(amount);
  };

  const playCoinFlip = () => {
    if (points < betAmount) {
      showNotif('Not enough points.', 'error');
      return;
    }

    if (!spendPoints(betAmount)) {
      showNotif('Failed to place bet.', 'error');
      return;
    }

    setIsPlaying(true);
    setCurrentGame('coin');
    setGameResult('');

    setTimeout(() => {
      const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
      const isWin = result === 'Heads';

      if (isWin) {
        const baseWinnings = betAmount * 2;
        const { doubled } = addPointsWithMultiplier(baseWinnings);
        const finalWinnings = doubled ? baseWinnings * 2 : baseWinnings;
        setGameResult(`${result} · won ${finalWinnings} pts${doubled ? ' (double points)' : ''}`);
        showNotif(`+${finalWinnings} points${doubled ? ' (double points)' : ''}`, 'success');

        // Update stats
        const newStats = { ...coinStats };
        newStats.wins++;
        newStats.totalPlayed++;
        newStats.highScore = Math.max(newStats.highScore, finalWinnings);
        setCoinStats(newStats);
        saveStats('coin', newStats);
      } else {
        setGameResult(`${result} · lost ${betAmount} pts`);
        showNotif(`-${betAmount} points`, 'error');

        // Update stats
        const newStats = { ...coinStats };
        newStats.losses++;
        newStats.totalPlayed++;
        setCoinStats(newStats);
        saveStats('coin', newStats);
      }

      setPoints(getPoints());
      setIsPlaying(false);
    }, 1000);
  };

  const playDiceRoll = () => {
    if (points < betAmount) {
      showNotif('Not enough points.', 'error');
      return;
    }

    if (!spendPoints(betAmount)) {
      showNotif('Failed to place bet.', 'error');
      return;
    }

    setIsPlaying(true);
    setCurrentGame('dice');
    setGameResult('');

    setTimeout(() => {
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const total = dice1 + dice2;

      // 7 is the most common roll (6/36 = 16.67%)
      const isWin = total === 7;

      if (isWin) {
        const baseWinnings = betAmount * 3; // 2:1 payout
        const { doubled } = addPointsWithMultiplier(baseWinnings);
        const finalWinnings = doubled ? baseWinnings * 2 : baseWinnings;
        setGameResult(`Rolled ${total} · won ${finalWinnings} pts${doubled ? ' (double points)' : ''}`);
        showNotif(`+${finalWinnings} points${doubled ? ' (double points)' : ''}`, 'success');

        // Update stats
        const newStats = { ...diceStats };
        newStats.wins++;
        newStats.totalPlayed++;
        newStats.highScore = Math.max(newStats.highScore, finalWinnings);
        setDiceStats(newStats);
        saveStats('dice', newStats);
      } else {
        setGameResult(`Rolled ${total} · lost ${betAmount} pts`);
        showNotif(`-${betAmount} points`, 'error');

        // Update stats
        const newStats = { ...diceStats };
        newStats.losses++;
        newStats.totalPlayed++;
        setDiceStats(newStats);
        saveStats('dice', newStats);
      }

      setPoints(getPoints());
      setIsPlaying(false);
    }, 1000);
  };

  const getWinRate = (stats: GameStats) => {
    if (stats.totalPlayed === 0) return 0;
    return Math.round((stats.wins / stats.totalPlayed) * 100);
  };

  const quickBets = [5, 10, 25, 50, 100];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Arcade"
        title="Mini games"
        description="Bet points against the house. Every win respects active double-points boosts."
        actions={
          <div className="chip">
            <span className="text-zinc-500">SP</span>
            <span className="font-bold tabular-nums text-white">{points}</span>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            id: AppView.CRASH_GAME,
            name: 'Crash',
            tagline: 'Up to 100x',
            copy: 'Bet points and cash out before the multiplier breaks.',
          },
          {
            id: AppView.MINESWEEPER,
            name: 'Minesweeper',
            tagline: '3 difficulties',
            copy: 'Reveal safe cells and dodge the mines to take the payout.',
          },
          {
            id: AppView.SLOT_MACHINE,
            name: 'Slot machine',
            tagline: 'Up to 60x',
            copy: 'Spin the reels, match symbols, and collect free spins.',
          },
        ].map((game) => (
          <button
            key={game.id}
            type="button"
            onClick={() => onSelectGame(game.id)}
            className="panel group flex flex-col gap-2.5 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--line-strong)]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[15px] font-semibold text-white">{game.name}</span>
              <Badge>{game.tagline}</Badge>
            </div>
            <p className="text-xs leading-relaxed text-zinc-500">{game.copy}</p>
            <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-theme-primary">
              Play →
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[15px] font-semibold text-white">Coin flip</p>
              <p className="mt-0.5 text-xs text-zinc-500">Heads doubles your stake.</p>
            </div>
            <Badge tone="primary">2x</Badge>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {quickBets.map(amount => (
              <button
                key={amount}
                type="button"
                onClick={() => handleBetChange(amount)}
                disabled={isPlaying}
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

          <div className="flex gap-2">
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
              className="field field-mono"
              disabled={isPlaying}
              min="1"
              max={points}
              title="Bet amount"
              aria-label="Coin flip bet amount"
            />
            <Button
              variant="primary"
              onClick={playCoinFlip}
              disabled={isPlaying || points < betAmount}
              className="shrink-0"
            >
              {isPlaying ? 'Flipping…' : 'Flip'}
            </Button>
          </div>

          {gameResult && currentGame === 'coin' && (
            <p className="rounded-lg border border-[color:var(--line)] bg-black/25 px-3 py-2 text-center text-sm font-semibold text-zinc-200">
              {gameResult}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Stat label="Win rate" value={`${getWinRate(coinStats)}%`} tone="primary" />
            <Stat label="Best win" value={coinStats.highScore} tone="warning" />
          </div>
        </Panel>

        <Panel className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[15px] font-semibold text-white">Dice roll</p>
              <p className="mt-0.5 text-xs text-zinc-500">Roll a 7 to take three times your stake.</p>
            </div>
            <Badge tone="warning">3x</Badge>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[10, 25, 50, 100, 200].map(amount => (
              <button
                key={amount}
                type="button"
                onClick={() => handleBetChange(amount)}
                disabled={isPlaying}
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

          <div className="flex gap-2">
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
              className="field field-mono"
              disabled={isPlaying}
              min="1"
              max={points}
              title="Bet amount"
              aria-label="Dice roll bet amount"
            />
            <Button
              variant="primary"
              onClick={playDiceRoll}
              disabled={isPlaying || points < betAmount}
              className="shrink-0"
            >
              {isPlaying ? 'Rolling…' : 'Roll'}
            </Button>
          </div>

          {gameResult && currentGame === 'dice' && (
            <p className="rounded-lg border border-[color:var(--line)] bg-black/25 px-3 py-2 text-center text-sm font-semibold text-zinc-200">
              {gameResult}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Stat label="Win rate" value={`${getWinRate(diceStats)}%`} tone="primary" />
            <Stat label="Best win" value={diceStats.highScore} tone="warning" />
          </div>
        </Panel>
      </div>

      <Panel className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow">Overall</p>
          <span className="text-[10px] uppercase tracking-wider text-zinc-600">Both tables</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Wins" value={coinStats.wins + diceStats.wins} tone="primary" />
          <Stat label="Losses" value={coinStats.losses + diceStats.losses} tone="danger" />
          <Stat label="Played" value={coinStats.totalPlayed + diceStats.totalPlayed} />
          <Stat label="Best win" value={Math.max(coinStats.highScore, diceStats.highScore)} tone="warning" />
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-zinc-600">
          Results are random. Bets are deducted immediately and prizes are paid through the shared economy.
        </p>
      </Panel>
    </div>
  );
};

export default MiniGames;
