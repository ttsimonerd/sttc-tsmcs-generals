import React, { useState, useEffect, useCallback, useRef } from 'react';
import { addPoints, getPoints, addPointsWithMultiplier } from '../services/pointsService';
import confetti from 'canvas-confetti';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

const DIFFICULTY_SETTINGS = {
  EASY: { gridSize: 5, mineCount: 3, points: 5 },
  MEDIUM: { gridSize: 7, mineCount: 5, points: 15 },
  HARD: { gridSize: 10, mineCount: 8, points: 30 },
};

const Minesweeper: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState<'IDLE' | 'PLAYING' | 'WON' | 'LOST'>('IDLE');
  const [revealedCount, setRevealedCount] = useState(0);
  const [points, setPoints] = useState(0);
  const [flagMode, setFlagMode] = useState(false);
  const [wonPoints, setWonPoints] = useState(0);
  const [wasDoubled, setWasDoubled] = useState(false);
  
  const currentSettings = DIFFICULTY_SETTINGS[difficulty];

  const initializeGrid = useCallback(() => {
    const { gridSize, mineCount } = currentSettings;
    const newGrid: Cell[][] = [];

    for (let i = 0; i < gridSize; i++) {
      newGrid[i] = [];
      for (let j = 0; j < gridSize; j++) {
        newGrid[i][j] = {
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0,
        };
      }
    }

    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      if (!newGrid[row][col].isMine) {
        newGrid[row][col].isMine = true;
        minesPlaced++;
      }
    }

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (!newGrid[i][j].isMine) {
          let count = 0;
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              const ni = i + di;
              const nj = j + dj;
              if (ni >= 0 && ni < gridSize && nj >= 0 && nj < gridSize && newGrid[ni][nj].isMine) {
                count++;
              }
            }
          }
          newGrid[i][j].adjacentMines = count;
        }
      }
    }

    setGrid(newGrid);
    setGameOver('PLAYING');
    setRevealedCount(0);
  }, [currentSettings]);

  useEffect(() => {
    initializeGrid();
    setPoints(getPoints());
  }, [initializeGrid]);

  const triggerWinConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#06b6d4', '#fbbf24', '#f43f5e'],
    });
  };

  const revealCell = (row: number, col: number) => {
    if (gameOver !== 'PLAYING' || grid[row][col].isRevealed || grid[row][col].isFlagged) {
      return;
    }

    const newGrid = [...grid.map(row => [...row])];
    const cell = newGrid[row][col];

    if (cell.isMine) {
      cell.isRevealed = true;
      setGrid(newGrid);
      setGameOver('LOST');
      return;
    }

    const floodFill = (r: number, c: number) => {
      if (r < 0 || r >= newGrid.length || c < 0 || c >= newGrid.length) return;
      if (newGrid[r][c].isRevealed || newGrid[r][c].isFlagged || newGrid[r][c].isMine) return;

      newGrid[r][c].isRevealed = true;
      setRevealedCount(prev => prev + 1);

      if (newGrid[r][c].adjacentMines === 0) {
        for (let di = -1; di <= 1; di++) {
          for (let dj = -1; dj <= 1; dj++) {
            floodFill(r + di, c + dj);
          }
        }
      }
    };

    floodFill(row, col);
    setGrid(newGrid);

    const { gridSize, mineCount } = currentSettings;
    const safeCells = gridSize * gridSize - mineCount;
    const totalRevealed = newGrid.flat().filter(cell => cell.isRevealed).length;

    if (totalRevealed >= safeCells) {
      const basePointsWon = currentSettings.points;
      const { doubled } = addPointsWithMultiplier(basePointsWon);
      const finalPointsWon = doubled ? basePointsWon * 2 : basePointsWon;
      setWonPoints(finalPointsWon);
      setWasDoubled(doubled);
      setPoints(getPoints());
      setGameOver('WON');
      setTimeout(triggerWinConfetti, 300);
    }
  };

  const toggleFlag = (row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (gameOver !== 'PLAYING' || grid[row][col].isRevealed) return;

    const newGrid = [...grid.map(row => [...row])];
    newGrid[row][col].isFlagged = !newGrid[row][col].isFlagged;
    setGrid(newGrid);
  };

  const handleCellClick = (row: number, col: number) => {
    if (flagMode) {
      toggleFlag(row, col, { preventDefault: () => {} } as React.MouseEvent);
    } else {
      revealCell(row, col);
    }
  };

  const getCellColor = (cell: Cell) => {
    if (!cell.isRevealed) return 'bg-zinc-700 hover:bg-zinc-600';
    if (cell.isMine) return 'bg-red-600';
    switch (cell.adjacentMines) {
      case 0: return 'bg-zinc-800';
      case 1: return 'bg-blue-900/50';
      case 2: return 'bg-green-900/50';
      case 3: return 'bg-yellow-900/50';
      case 4: return 'bg-orange-900/50';
      case 5: return 'bg-red-900/50';
      default: return 'bg-purple-900/50';
    }
  };

  const getTextColor = (adjacentMines: number) => {
    switch (adjacentMines) {
      case 1: return 'text-blue-400';
      case 2: return 'text-green-400';
      case 3: return 'text-yellow-400';
      case 4: return 'text-orange-400';
      case 5: return 'text-red-400';
      case 6: return 'text-purple-400';
      default: return 'text-white';
    }
  };

  const { gridSize } = currentSettings;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Minesweeper</h2>
        <p className="text-zinc-400">Avoid the mines to win points!</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-xl border border-white/10">
        <div className="flex items-center gap-4">
          <div className="text-zinc-400 text-sm">
            <span className="text-white font-bold">{points}</span> pts
          </div>
          <div className="text-zinc-500 text-xs">
            | Revealed: {revealedCount}/{gridSize * gridSize - currentSettings.mineCount}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="difficulty-select" className="text-zinc-500 text-sm">Difficulty:</label>
          <select
            id="difficulty-select"
            title="Game Difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            disabled={gameOver === 'PLAYING'}
            className="bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="EASY">Easy (+{DIFFICULTY_SETTINGS.EASY.points} pts)</option>
            <option value="MEDIUM">Medium (+{DIFFICULTY_SETTINGS.MEDIUM.points} pts)</option>
            <option value="HARD">Hard (+{DIFFICULTY_SETTINGS.HARD.points} pts)</option>
          </select>
        </div>

        <button
          onClick={() => setFlagMode(!flagMode)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            flagMode
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : 'bg-zinc-800 text-zinc-400 border border-zinc-600'
          }`}
        >
          🚩 Flag Mode: {flagMode ? 'ON' : 'OFF'}
        </button>
      </div>

      {gameOver !== 'PLAYING' && (
        <div className={`p-6 rounded-xl text-center animate-fade-in ${
          gameOver === 'WON'
            ? 'bg-emerald-500/20 border border-emerald-500/30'
            : gameOver === 'LOST'
            ? 'bg-red-500/20 border border-red-500/30'
            : 'bg-zinc-800/50 border border-white/5'
        }`}>
          {gameOver === 'WON' && (
            <>
              <p className="text-4xl mb-2 animate-bounce">🎉</p>
              <p className="text-emerald-400 font-bold text-xl">VICTORY!</p>
              <p className="text-zinc-400 text-sm">+{wonPoints} points{wasDoubled && <span className="text-yellow-400 ml-1">(2x!)</span>}</p>
            </>
          )}
          {gameOver === 'LOST' && (
            <>
              <p className="text-4xl mb-2 animate-pulse">💥</p>
              <p className="text-red-400 font-bold text-xl">BOMB EXPLODED!</p>
              <p className="text-zinc-400 text-sm">Better luck next time!</p>
            </>
          )}
          {gameOver === 'IDLE' && (
            <>
              <p className="text-4xl mb-2">💣</p>
              <p className="text-white font-bold text-xl">Ready to Play?</p>
            </>
          )}
        </div>
      )}

      <div className="flex justify-center">
        <div
          className="grid gap-1 p-3 glass-panel rounded-xl border border-white/10"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onContextMenu={(e) => toggleFlag(rowIndex, colIndex, e)}
                disabled={gameOver !== 'PLAYING'}
                className={`
                  w-10 h-10 md:w-12 md:h-12 rounded-lg font-bold text-lg md:text-xl
                  flex items-center justify-center transition-all
                  ${getCellColor(cell)}
                  ${!cell.isRevealed && gameOver === 'PLAYING' ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                  ${cell.isRevealed ? '' : 'border border-white/5 shadow-lg'}
                  ${cell.isRevealed && cell.adjacentMines === 0 ? 'animate-reveal' : ''}
                `}
              >
                {cell.isRevealed ? (
                  cell.isMine ? (
                    <span className="animate-bounce">💣</span>
                  ) : cell.adjacentMines > 0 ? (
                    <span className={getTextColor(cell.adjacentMines)}>{cell.adjacentMines}</span>
                  ) : null
                ) : cell.isFlagged ? (
                  <span className="animate-pulse">🚩</span>
                ) : null}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={initializeGrid}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-emerald-500/20"
        >
          {gameOver === 'PLAYING' ? '🔄 Reset' : '🎮 New Game'}
        </button>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-3">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">How to Play</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-zinc-400">
          <div className="space-y-1">
            <p className="text-white font-medium">🎯 Goal</p>
            <p>Reveal all safe cells without hitting a mine!</p>
          </div>
          <div className="space-y-1">
            <p className="text-white font-medium">🚩 Flag Mode</p>
            <p>Toggle to mark suspected mines with flags.</p>
          </div>
          <div className="space-y-1">
            <p className="text-white font-medium">💰 Rewards</p>
            <p>Win {currentSettings.points} points by clearing all safe cells!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Minesweeper;

