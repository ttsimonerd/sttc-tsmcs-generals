import React, { useState, useEffect, useRef } from 'react';
import { getPunishments, savePunishments, addPoints, ensurePunishmentDifficulty, DIFFICULTY_POINTS, DIFFICULTY_COLORS, ITEM_IDS, hasItem, useFromInventory, addPointsWithMultiplier } from '../services/pointsService';
import { PunishmentOption, PunishmentDifficulty } from '../types';

interface PunishmentWheelProps {
  isOwner?: boolean;
  forcedSupply?: string;
  onComplete?: () => void;
}

// Difficulty icons helper
const DIFFICULTY_ICONS: Record<PunishmentDifficulty, string> = {
  free: '⭐',
  easy: '🟢',
  medium: '🟡',
  hard: '🟠',
  extreme: '🔴',
};

const DIFFICULTY_LABELS: Record<PunishmentDifficulty, string> = {
  free: 'Free Pass',
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  extreme: 'Extreme',
};

const PunishmentWheel: React.FC<PunishmentWheelProps> = ({ isOwner = false, forcedSupply, onComplete }) => {
  const [punishments, setPunishments] = useState<PunishmentOption[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<PunishmentOption | null>(null);
  const [rotation, setRotation] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [newPunishment, setNewPunishment] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<PunishmentDifficulty>('medium');
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const [wasDoubled, setWasDoubled] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPunishments(getPunishments());
  }, []);

  const spinWheel = () => {
    if (isSpinning || punishments.length === 0) return;

    setIsSpinning(true);
    setResult(null);
    setSkipped(false);
    setWasDoubled(false);

    const randomIndex = Math.floor(Math.random() * punishments.length);
    const segmentAngle = 360 / punishments.length;
    const targetAngle = 360 - (randomIndex * segmentAngle) - (segmentAngle / 2);
    const spins = 5 + Math.random() * 3;
    const finalRotation = rotation + (spins * 360) + targetAngle;

    setRotation(finalRotation);

    setTimeout(() => {
      const punishment = punishments[randomIndex];
      setResult(punishment);
      setIsSpinning(false);

      // Check if player can skip this punishment
      const hasSkipItem = hasItem(ITEM_IDS.SKIP_PUNISHMENT);
      setCanSkip(hasSkipItem && punishment.difficulty !== 'free');

      // Award points based on difficulty (with double points multiplier)
      const basePoints = DIFFICULTY_POINTS[punishment.difficulty] || 0;
      if (basePoints > 0) {
        const { total, doubled } = addPointsWithMultiplier(basePoints);
        setPointsEarned(doubled ? basePoints * 2 : basePoints);
        setWasDoubled(doubled);
      }
    }, 4000);
  };

  const handleSkipPunishment = () => {
    if (useFromInventory(ITEM_IDS.SKIP_PUNISHMENT)) {
      setSkipped(true);
      setCanSkip(false);
    }
  };

  const handleAddPunishment = () => {
    if (!newPunishment.trim()) return;

    const newOption: PunishmentOption = {
      id: Date.now().toString(),
      text: newPunishment.trim(),
      description: newDescription.trim(),
      color: DIFFICULTY_COLORS[newDifficulty],
      difficulty: newDifficulty,
    };

    const updated = [...punishments, newOption];
    setPunishments(updated);
    savePunishments(updated);
    setNewPunishment('');
    setNewDescription('');
    setNewDifficulty('medium');
  };

  const handleRemovePunishment = (id: string) => {
    const updated = punishments.filter(p => p.id !== id);
    setPunishments(updated);
    savePunishments(updated);
  };

  const segmentAngle = punishments.length > 0 ? 360 / punishments.length : 360;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Punishment Wheel</h1>
          <p className="text-zinc-500 text-sm mt-1">Spin to receive your fate</p>
        </div>
        {isOwner && (
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${editMode ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
          >
            {editMode ? '✕ Close Editor' : '⚙ Edit Options'}
          </button>
        )}
      </div>

      {/* Edit Mode (Owner Only) */}
      {isOwner && editMode && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 animate-fade-in">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Manage Punishments</h2>

          {/* Add new */}
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={newPunishment}
              onChange={(e) => setNewPunishment(e.target.value)}
              placeholder="Enter new punishment..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAddPunishment()}
            />
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description (use {supply} for dynamic text)..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAddPunishment()}
            />
            <div className="flex gap-2">
              <select
                value={newDifficulty}
                title="Punishment Difficulty"
                aria-label="Punishment Difficulty"
                onChange={(e) => setNewDifficulty(e.target.value as PunishmentDifficulty)}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50"
              >
                <option value="free">⭐ Free Pass</option>
                <option value="easy">🟢 Easy</option>
                <option value="medium">🟡 Medium</option>
                <option value="hard">🟠 Hard</option>
                <option value="extreme">🔴 Extreme</option>
              </select>
              <button
                onClick={handleAddPunishment}
                disabled={!newPunishment.trim()}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
            {punishments.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-white text-sm">{p.text}</span>
                  {p.description && <span className="text-zinc-500 text-[10px] italic">({p.description.slice(0, 20)}...)</span>}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400"
                    title={DIFFICULTY_LABELS[p.difficulty]}
                  >
                    {DIFFICULTY_ICONS[p.difficulty]}
                  </span>
                </div>
                <button
                  onClick={() => handleRemovePunishment(p.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wheel */}
      <div className="flex flex-col items-center gap-8">
        <div className="relative w-72 h-72 sm:w-96 sm:h-96">
          {/* Pointer */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-white drop-shadow-lg" />
          </div>

          {/* Wheel */}
          <div
            ref={wheelRef}
            className="w-full h-full rounded-full shadow-2xl overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {punishments.map((punishment, i) => {
                const startAngle = i * segmentAngle;
                const endAngle = (i + 1) * segmentAngle;
                const startRad = (startAngle - 90) * Math.PI / 180;
                const endRad = (endAngle - 90) * Math.PI / 180;
                const x1 = 100 + 95 * Math.cos(startRad);
                const y1 = 100 + 95 * Math.sin(startRad);
                const x2 = 100 + 95 * Math.cos(endRad);
                const y2 = 100 + 95 * Math.sin(endRad);
                const largeArc = segmentAngle > 180 ? 1 : 0;
                const d = `M 100 100 L ${x1} ${y1} A 95 95 0 ${largeArc} 1 ${x2} ${y2} Z`;

                // Text position
                const midAngle = (startAngle + segmentAngle / 2 - 90) * Math.PI / 180;
                const textX = 100 + 60 * Math.cos(midAngle);
                const textY = 100 + 60 * Math.sin(midAngle);
                const textRotation = startAngle + segmentAngle / 2;

                return (
                  <g key={punishment.id}>
                    <path d={d} fill={punishment.color} stroke="#1f1f23" strokeWidth="1" />
                    <text
                      x={textX}
                      y={textY - 5}
                      fill="white"
                      fontSize="6"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textRotation}, ${textX}, ${textY - 5})`}
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                    >
                      {punishment.text.length > 12 ? punishment.text.slice(0, 10) + '...' : punishment.text}
                    </text>
                    {/* Difficulty icon below text */}
                    <text
                      x={textX}
                      y={textY + 8}
                      fill="white"
                      fontSize="8"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textRotation}, ${textX}, ${textY + 8})`}
                    >
                      {DIFFICULTY_ICONS[punishment.difficulty]}
                    </text>
                  </g>
                );
              })}
              {/* Center circle */}
              <circle cx="100" cy="100" r="20" fill="#1f1f23" stroke="#3f3f46" strokeWidth="2" />
              <text x="100" y="100" fill="white" fontSize="16" textAnchor="middle" dominantBaseline="middle">
                🎯
              </text>
            </svg>
          </div>
        </div>

        {/* Spin button */}
        <button
          onClick={spinWheel}
          disabled={isSpinning || punishments.length === 0}
          className="px-10 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white rounded-xl font-bold text-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isSpinning ? 'SPINNING...' : '🎰 SPIN THE WHEEL'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="glass-panel p-8 rounded-2xl border border-white/10 text-center space-y-4 animate-fade-in">
          <p className="text-zinc-400 uppercase tracking-widest text-xs">Your Punishment</p>

          {skipped ? (
            <div className="space-y-3">
              <div className="text-4xl sm:text-5xl font-black py-4 text-zinc-600 line-through">
                {result.text}
              </div>
              <div className="text-2xl font-bold text-emerald-400 animate-pulse">
                🛡️ PUNISHMENT SKIPPED!
              </div>
              <p className="text-zinc-500 text-sm">You used a Skip Punishment item</p>
            </div>
          ) : (
            <div
              className="text-4xl sm:text-5xl font-black py-4"
              style={{ color: result.color }}
            >
              {result.text}
            </div>
          )}

          {result.description && (
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-zinc-300 text-sm italic">
              " {result.description.replace('{supply}', forcedSupply || 'special equipment')} "
            </div>
          )}

          {pointsEarned && !skipped && (
            <p className="text-emerald-400 text-sm">
              🎉 You earned <span className="font-bold">{pointsEarned}</span> points!
              {wasDoubled && <span className="text-yellow-400 ml-2">(2x DOUBLED!)</span>}
              <span className="text-zinc-500 ml-2">({result.difficulty} difficulty)</span>
            </p>
          )}

          {canSkip && !skipped && (
            <button
              onClick={handleSkipPunishment}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
            >
              🛡️ USE SKIP PUNISHMENT
            </button>
          )}

          <button
            onClick={() => {
              setResult(null);
              setCanSkip(false);
              setSkipped(false);
              if (onComplete) onComplete();
            }}
            className="text-zinc-500 hover:text-white text-sm underline underline-offset-4 transition-colors"
          >
            {forcedSupply ? 'Complete Punishment' : 'Clear result'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PunishmentWheel;
