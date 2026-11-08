import React, { useState, useEffect, useCallback } from 'react';
import { getPoints, addPointsWithMultiplier } from '../services/pointsService';
import confetti from 'canvas-confetti';
import { Badge, Button, PageHeader, Panel, cn } from './ui/Primitives';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

import { getTunerConfig } from '../services/gameTunerService';

const Minesweeper: React.FC = () => {
  const [config] = useState(getTunerConfig().minesweeper);

  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState<'IDLE' | 'PLAYING' | 'WON' | 'LOST'>('IDLE');
  const [revealedCount, setRevealedCount] = useState(0);
  const [points, setPoints] = useState(0);
  const [flagMode, setFlagMode] = useState(false);
  const [wonPoints, setWonPoints] = useState(0);
  const [wasDoubled, setWasDoubled] = useState(false);

  const currentSettings = config[difficulty];

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
      toggleFlag(row, col, { preventDefault: () => { } } as React.MouseEvent);
    } else {
      revealCell(row, col);
    }
  };

  const getCellColor = (cell: Cell) => {
    if (!cell.isRevealed) return 'bg-white/[0.07] hover:bg-white/[0.13]';
    if (cell.isMine) return 'bg-red-600/80';
    switch (cell.adjacentMines) {
      case 0: return 'bg-white/[0.02]';
      case 1: return 'bg-blue-900/40';
      case 2: return 'bg-green-900/40';
      case 3: return 'bg-yellow-900/40';
      case 4: return 'bg-orange-900/40';
      case 5: return 'bg-red-900/40';
      default: return 'bg-purple-900/40';
    }
  };

  const getTextColor = (adjacentMines: number) => {
    switch (adjacentMines) {
      case 1: return 'text-blue-300';
      case 2: return 'text-green-300';
      case 3: return 'text-yellow-300';
      case 4: return 'text-orange-300';
      case 5: return 'text-red-300';
      case 6: return 'text-purple-300';
      default: return 'text-white';
    }
  };

  const { gridSize } = currentSettings;
  const safeCells = gridSize * gridSize - currentSettings.mineCount;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mini game"
        title="Minesweeper"
        description="Clear every safe cell without touching a mine."
        actions={
          <>
            <select
              id="difficulty-select"
              title="Game difficulty"
              aria-label="Game difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              disabled={gameOver === 'PLAYING'}
              className="field w-auto py-2 text-xs"
            >
              <option value="EASY" className="bg-[#0b0d12]">Easy · +{config.EASY.points}</option>
              <option value="MEDIUM" className="bg-[#0b0d12]">Medium · +{config.MEDIUM.points}</option>
              <option value="HARD" className="bg-[#0b0d12]">Hard · +{config.HARD.points}</option>
            </select>

            <Button
              variant={flagMode ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFlagMode(!flagMode)}
              aria-pressed={flagMode}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 21V4m0 1h11l-2.5 4L17 13H6" />
              </svg>
              Flag mode {flagMode ? 'on' : 'off'}
            </Button>

            <Button variant="primary" size="sm" onClick={initializeGrid}>
              {gameOver === 'PLAYING' ? 'Reset board' : 'New game'}
            </Button>
          </>
        }
      />

      <Panel tone="muted" className="flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex items-center gap-2">
          <div className="chip">
            <span className="text-zinc-500">SP</span>
            <span className="font-bold tabular-nums text-white">{points}</span>
          </div>
          <span className="text-[11px] text-zinc-500">
            Revealed <span className="font-mono text-zinc-300">{revealedCount}</span> / {safeCells}
          </span>
        </div>
        <Badge tone={gameOver === 'WON' ? 'primary' : gameOver === 'LOST' ? 'danger' : 'default'}>
          {gameOver === 'PLAYING' ? 'In progress' : gameOver === 'WON' ? 'Cleared' : gameOver === 'LOST' ? 'Hit a mine' : 'Ready'}
        </Badge>
      </Panel>

      {gameOver !== 'PLAYING' && (
        <Panel
          tone={gameOver === 'WON' ? 'accent' : gameOver === 'LOST' ? 'danger' : 'muted'}
          className="p-5 text-center fade-in"
        >
          {gameOver === 'WON' && (
            <>
              <p className="text-[15px] font-semibold text-emerald-300">Board cleared</p>
              <p className="mt-1 text-sm text-zinc-400">
                +{wonPoints} pts{wasDoubled && <span className="ml-1 text-amber-300">· double points</span>}
              </p>
            </>
          )}
          {gameOver === 'LOST' && (
            <>
              <p className="text-[15px] font-semibold text-red-300">Mine triggered</p>
              <p className="mt-1 text-sm text-zinc-500">Press reset for a fresh board.</p>
            </>
          )}
          {gameOver === 'IDLE' && (
            <p className="text-sm text-zinc-400">Pick a difficulty and clear the board.</p>
          )}
        </Panel>
      )}

      <div className="flex justify-center">
        <Panel className="inline-block p-2.5 sm:p-3">
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            }}
          >
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  type="button"
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onContextMenu={(e) => toggleFlag(rowIndex, colIndex, e)}
                  disabled={gameOver !== 'PLAYING'}
                  aria-label={`Cell ${rowIndex + 1}, ${colIndex + 1}`}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-md text-sm font-bold transition-all sm:h-11 sm:w-11 sm:text-base',
                    getCellColor(cell),
                    !cell.isRevealed && gameOver === 'PLAYING' ? 'cursor-pointer hover:scale-[1.04]' : 'cursor-default'
                  )}
                >
                  {cell.isRevealed ? (
                    cell.isMine ? (
                      <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <circle cx="12" cy="12" r="5" />
                        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    ) : cell.adjacentMines > 0 ? (
                      <span className={getTextColor(cell.adjacentMines)}>{cell.adjacentMines}</span>
                    ) : null
                  ) : cell.isFlagged ? (
                    <svg className="h-4 w-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 21V4m0 1h11l-2.5 4L17 13H6" />
                    </svg>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel className="p-5">
          <p className="eyebrow">Current board</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-[color:var(--line)] bg-black/25 px-3 py-2">
              <p className="text-[9px] uppercase tracking-wider text-zinc-600">Grid</p>
              <p className="font-mono text-sm font-bold text-white">{gridSize}×{gridSize}</p>
            </div>
            <div className="rounded-lg border border-[color:var(--line)] bg-black/25 px-3 py-2">
              <p className="text-[9px] uppercase tracking-wider text-zinc-600">Mines</p>
              <p className="font-mono text-sm font-bold text-white">{currentSettings.mineCount}</p>
            </div>
          </div>
        </Panel>

        <Panel tone="muted" className="p-5">
          <p className="eyebrow">How it works</p>
          <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-zinc-500">
            <li>Reveal safe cells; the first mine ends the round.</li>
            <li>Toggle flag mode (or right-click) to mark suspected mines.</li>
            <li>Clearing every safe cell pays {currentSettings.points} pts on this difficulty.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
};

export default Minesweeper;
