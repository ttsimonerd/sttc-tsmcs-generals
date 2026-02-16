import React, { useState, useEffect } from 'react';
import { getPoints, addPoints, spendPoints, addPointsWithMultiplier, isDoublePointsActive, getDoublePointsRemaining } from '../services/pointsService';
import { AppView } from '../types';

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
  const [points, setPoints] = useState(0);
  const [currentGame, setCurrentGame] = useState<'coin' | 'dice' | null>(null);
  const [gameResult, setGameResult] = useState<string>('');
  const [betAmount, setBetAmount] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

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

  const showNotif = (message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBetChange = (amount: number) => {
    if (amount > points) {
      showNotif("Not enough points!", 'error');
      return;
    }
    setBetAmount(amount);
  };

  const playCoinFlip = () => {
    if (points < betAmount) {
      showNotif("Not enough points!", 'error');
      return;
    }

    if (!spendPoints(betAmount)) {
      showNotif("Failed to place bet!", 'error');
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
        setGameResult(`🎉 ${result}! You won ${finalWinnings} points!${doubled ? ' (2x!)' : ''}`);
        showNotif(`+${finalWinnings} points!${doubled ? ' (2x!)' : ''}`, 'success');
        
        // Update stats
        const newStats = { ...coinStats };
        newStats.wins++;
        newStats.totalPlayed++;
        newStats.highScore = Math.max(newStats.highScore, finalWinnings);
        setCoinStats(newStats);
        saveStats('coin', newStats);
      } else {
        setGameResult(`😢 ${result}! You lost ${betAmount} points.`);
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
      showNotif("Not enough points!", 'error');
      return;
    }

    if (!spendPoints(betAmount)) {
      showNotif("Failed to place bet!", 'error');
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
        setGameResult(`🎉 Rolled ${total}! You won ${finalWinnings} points!${doubled ? ' (2x!)' : ''}`);
        showNotif(`+${finalWinnings} points!${doubled ? ' (2x!)' : ''}`, 'success');
        
        // Update stats
        const newStats = { ...diceStats };
        newStats.wins++;
        newStats.totalPlayed++;
        newStats.highScore = Math.max(newStats.highScore, finalWinnings);
        setDiceStats(newStats);
        saveStats('dice', newStats);
      } else {
        setGameResult(`😢 Rolled ${total}! You lost ${betAmount} points.`);
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Mini Games</h1>
          <p className="text-zinc-500 text-sm mt-1">Test your luck and earn points</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-xl">
            <span className="text-amber-400 font-bold text-xl">💰 {points} pts</span>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-xl border animate-fade-in ${
          notification.type === 'success' 
            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
            : notification.type === 'error'
            ? 'bg-red-500/20 border-red-500/30 text-red-400'
            : 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Game Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Crash Game Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 hover:scale-[1.02] transition-all cursor-pointer group" onClick={() => onSelectGame(AppView.CRASH_GAME)}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">Crash Game</h2>
            <div className="text-4xl">📈</div>
          </div>
          <p className="text-zinc-400 text-sm">Bet points and cash out before the multiplier crashes! Multipliers up to 100x!</p>
          <button className="w-full py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all">
            PLAY CRASH
          </button>
        </div>

        {/* Minesweeper Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 hover:scale-[1.02] transition-all cursor-pointer group" onClick={() => onSelectGame(AppView.MINESWEEPER)}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">Minesweeper</h2>
            <div className="text-4xl">💣</div>
          </div>
          <p className="text-zinc-400 text-sm">Reveal safe cells and avoid the mines to win points. Multiple difficulties available.</p>
          <button className="w-full py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-bold group-hover:bg-blue-600 group-hover:text-white transition-all">
            PLAY MINESWEEPER
          </button>
        </div>

        {/* Slot Machine Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 hover:scale-[1.02] transition-all cursor-pointer group" onClick={() => onSelectGame(AppView.SLOT_MACHINE)}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">Slot Machine</h2>
            <div className="text-4xl">🎰</div>
          </div>
          <p className="text-zinc-400 text-sm">Spin the reels and match symbols for huge payouts! Win up to 60x your bet!</p>
          <button className="w-full py-2 bg-yellow-600/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-sm font-bold group-hover:bg-yellow-600 group-hover:text-black transition-all">
            PLAY SLOTS
          </button>
        </div>

        {/* Coin Flip */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Coin Flip</h2>
            <div className="text-4xl">🪙</div>
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {[5, 10, 25, 50, 100].map(amount => (
                <button
                  key={amount}
                  onClick={() => handleBetChange(amount)}
                  disabled={isPlaying}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    betAmount === amount
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  } ${points < amount ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {amount} pts
                </button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                disabled={isPlaying}
                min="1"
                max={points}
                title="Bet Amount"
                aria-label="Bet Amount"
              />
              <button
                onClick={playCoinFlip}
                disabled={isPlaying || points < betAmount}
                className={`px-4 py-1 rounded-lg font-medium transition-all ${
                  isPlaying || points < betAmount
                    ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105'
                }`}
              >
                {isPlaying ? 'Spinning...' : 'Flip Coin'}
              </button>
            </div>
          </div>

          {gameResult && currentGame === 'coin' && (
            <div className="p-4 bg-zinc-900/50 rounded-lg border border-white/5 text-center">
              <p className="text-lg font-bold">{gameResult}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-zinc-900/50 rounded-lg">
              <div className="text-zinc-400">Win Rate</div>
              <div className="text-emerald-400 font-bold">{getWinRate(coinStats)}%</div>
            </div>
            <div className="text-center p-3 bg-zinc-900/50 rounded-lg">
              <div className="text-zinc-400">High Score</div>
              <div className="text-amber-400 font-bold">{coinStats.highScore} pts</div>
            </div>
          </div>
        </div>

        {/* Dice Roll */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Dice Roll</h2>
            <div className="text-4xl">🎲</div>
          </div>
          
          <div className="space-y-3">
            <p className="text-zinc-400 text-sm">Roll a 7 to win 3x your bet!</p>
            
            <div className="flex gap-2 flex-wrap">
              {[10, 25, 50, 100, 200].map(amount => (
                <button
                  key={amount}
                  onClick={() => handleBetChange(amount)}
                  disabled={isPlaying}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    betAmount === amount
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  } ${points < amount ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {amount} pts
                </button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                disabled={isPlaying}
                min="1"
                max={points}
                title="Bet Amount"
                aria-label="Bet Amount"
              />
              <button
                onClick={playDiceRoll}
                disabled={isPlaying || points < betAmount}
                className={`px-4 py-1 rounded-lg font-medium transition-all ${
                  isPlaying || points < betAmount
                    ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105'
                }`}
              >
                {isPlaying ? 'Rolling...' : 'Roll Dice'}
              </button>
            </div>
          </div>

          {gameResult && currentGame === 'dice' && (
            <div className="p-4 bg-zinc-900/50 rounded-lg border border-white/5 text-center">
              <p className="text-lg font-bold">{gameResult}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-zinc-900/50 rounded-lg">
              <div className="text-zinc-400">Win Rate</div>
              <div className="text-emerald-400 font-bold">{getWinRate(diceStats)}%</div>
            </div>
            <div className="text-center p-3 bg-zinc-900/50 rounded-lg">
              <div className="text-zinc-400">High Score</div>
              <div className="text-amber-400 font-bold">{diceStats.highScore} pts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Overall Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-zinc-900/50 rounded-lg">
            <div className="text-zinc-400 text-sm">Total Wins</div>
            <div className="text-emerald-400 text-2xl font-bold">{coinStats.wins + diceStats.wins}</div>
          </div>
          <div className="text-center p-4 bg-zinc-900/50 rounded-lg">
            <div className="text-zinc-400 text-sm">Total Losses</div>
            <div className="text-red-400 text-2xl font-bold">{coinStats.losses + diceStats.losses}</div>
          </div>
          <div className="text-center p-4 bg-zinc-900/50 rounded-lg">
            <div className="text-zinc-400 text-sm">Total Played</div>
            <div className="text-white text-2xl font-bold">{coinStats.totalPlayed + diceStats.totalPlayed}</div>
          </div>
          <div className="text-center p-4 bg-zinc-900/50 rounded-lg">
            <div className="text-zinc-400 text-sm">Best Win</div>
            <div className="text-amber-400 text-2xl font-bold">{Math.max(coinStats.highScore, diceStats.highScore)} pts</div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="text-center text-zinc-600 text-xs">
        <p>Games are for entertainment. Results are determined by random chance.</p>
      </div>
    </div>
  );
};

export default MiniGames;
