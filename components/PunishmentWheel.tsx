import React, { useState, useEffect, useRef } from 'react';
import { getPunishments, savePunishments } from '../services/pointsService';
import type { PunishmentOption } from '../types';
import { Badge, Button, PageHeader, Panel } from './ui/Primitives';
import { logAudit } from '../services/auditService';

interface PunishmentWheelProps {
  isOwner?: boolean;
  forcedSupply?: string;
  onComplete?: () => void;
}

const SEGMENT_COLORS = ['#dc2626', '#ea580c', '#d97706', '#65a30d', '#0891b2', '#7c3aed', '#db2777'];

const PunishmentWheel: React.FC<PunishmentWheelProps> = ({ isOwner = false, forcedSupply, onComplete }) => {
  const [punishments, setPunishments] = useState<PunishmentOption[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<PunishmentOption | null>(null);
  const [rotation, setRotation] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [newPunishment, setNewPunishment] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPunishments(getPunishments());
  }, []);

  const spinWheel = () => {
    if (isSpinning || punishments.length === 0) return;

    setIsSpinning(true);
    setResult(null);

    const randomIndex = Math.floor(Math.random() * punishments.length);
    const segmentAngle = 360 / punishments.length;
    const targetAngle = 360 - (randomIndex * segmentAngle) - (segmentAngle / 2);
    const spins = 5 + Math.random() * 3;
    const finalRotation = rotation + (spins * 360) + targetAngle;

    setRotation(finalRotation);

    setTimeout(() => {
      setResult(punishments[randomIndex]);
      setIsSpinning(false);
    }, 4000);
  };

  const handleAddPunishment = () => {
    if (!newPunishment.trim()) return;

    const newOption: PunishmentOption = {
      id: Date.now().toString(),
      text: newPunishment.trim(),
      description: newDescription.trim(),
      color: SEGMENT_COLORS[punishments.length % SEGMENT_COLORS.length],
    };

    const updated = [...punishments, newOption];
    setPunishments(updated);
    savePunishments(updated);
    setNewPunishment('');
    setNewDescription('');
    logAudit('Added wheel segment', newOption.text);
  };

  const handleRemovePunishment = (id: string) => {
    const updated = punishments.filter(p => p.id !== id);
    setPunishments(updated);
    savePunishments(updated);
    logAudit('Removed wheel segment', punishments.find(p => p.id === id)?.text);
  };

  const segmentAngle = punishments.length > 0 ? 360 / punishments.length : 360;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configure"
        title="Punishment wheel"
        description={
          forcedSupply
            ? `Forced redirection. Lost supply: ${forcedSupply}`
            : 'Spin to receive your fate. The owner can tune the segment list below.'
        }
        actions={
          isOwner && !forcedSupply ? (
            <Button variant={editMode ? 'danger' : 'ghost'} size="sm" onClick={() => setEditMode(!editMode)}>
              {editMode ? 'Close editor' : 'Edit segments'}
            </Button>
          ) : undefined
        }
      />

      {isOwner && editMode && (
        <Panel className="space-y-4 p-5 fade-in">
          <div className="flex items-center justify-between gap-3">
            <p className="eyebrow">Manage segments</p>
            <Badge>{punishments.length} segments</Badge>
          </div>

          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]">
            <input
              type="text"
              value={newPunishment}
              onChange={(e) => setNewPunishment(e.target.value)}
              placeholder="New punishment…"
              aria-label="New punishment"
              className="field"
              onKeyDown={(e) => e.key === 'Enter' && handleAddPunishment()}
            />
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description — {supply} is replaced at runtime"
              aria-label="Punishment description"
              className="field"
              onKeyDown={(e) => e.key === 'Enter' && handleAddPunishment()}
            />
            <Button variant="primary" onClick={handleAddPunishment} disabled={!newPunishment.trim()}>
              Add
            </Button>
          </div>

          <div className="max-h-[240px] space-y-1.5 overflow-y-auto pr-1 custom-scrollbar">
            {punishments.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-[color:var(--line)] bg-black/25 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
                  />
                  <span className="truncate text-[13px] text-zinc-100">{p.text}</span>
                  {p.description && (
                    <span className="hidden truncate text-[10px] text-zinc-600 sm:block">{p.description}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePunishment(p.id)}
                  aria-label={`Remove ${p.text}`}
                  className="shrink-0 rounded-lg p-1.5 text-zinc-600 transition-colors hover:bg-red-500/10 hover:text-red-300"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {forcedSupply && !result && (
        <Panel tone="danger" className="p-5">
          <div className="flex items-center gap-3">
            <Badge tone="danger">Mandatory</Badge>
            <p className="text-sm text-zinc-300">
              You must spin the wheel to continue. Lost supply:{' '}
              <span className="font-semibold text-red-300">{forcedSupply}</span>
            </p>
          </div>
        </Panel>
      )}

      <div className="flex flex-col items-center gap-7">
        <div className="relative h-72 w-72 sm:h-96 sm:w-96">
          <div className="absolute -top-4 left-1/2 z-20 -translate-x-1/2">
            <div className="h-0 w-0 border-l-[16px] border-r-[16px] border-t-[28px] border-l-transparent border-r-transparent border-t-white drop-shadow-lg" />
          </div>

          <div
            ref={wheelRef}
            className="h-full w-full overflow-hidden rounded-full border border-[color:var(--line-strong)] shadow-2xl"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            }}
          >
            <svg viewBox="0 0 200 200" className="h-full w-full">
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

                const midAngle = (startAngle + segmentAngle / 2 - 90) * Math.PI / 180;
                const textX = 100 + 60 * Math.cos(midAngle);
                const textY = 100 + 60 * Math.sin(midAngle);
                const textRotation = startAngle + segmentAngle / 2;

                return (
                  <g key={punishment.id}>
                    <path d={d} fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]} stroke="#0b0d12" strokeWidth="1" />
                    <text
                      x={textX}
                      y={textY}
                      fill="white"
                      fontSize="6"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                    >
                      {punishment.text.length > 12 ? punishment.text.slice(0, 10) + '...' : punishment.text}
                    </text>
                  </g>
                );
              })}
              <circle cx="100" cy="100" r="22" fill="#0b0d12" stroke="#3f3f46" strokeWidth="2" />
              <text x="100" y="100" fill="#a1a1aa" fontSize="7" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" letterSpacing="1">
                SPIN
              </text>
            </svg>
          </div>
        </div>

        <Button variant="danger" size="lg" onClick={spinWheel} disabled={isSpinning || punishments.length === 0} className="px-10">
          {isSpinning ? 'Spinning…' : 'Spin the wheel'}
        </Button>
      </div>

      {result && (
        <Panel className="space-y-4 p-6 text-center fade-in">
          <p className="eyebrow">Your punishment</p>
          <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{result.text}</p>
          {result.description && (
            <p className="mx-auto max-w-xl rounded-xl border border-[color:var(--line)] bg-black/30 p-4 text-sm italic text-zinc-300">
              “{result.description.replace('{supply}', forcedSupply || 'special equipment')}”
            </p>
          )}
          <Button
            variant="danger"
            onClick={() => {
              setResult(null);
              if (onComplete) onComplete();
            }}
          >
            Accept fate
          </Button>
        </Panel>
      )}
    </div>
  );
};

export default PunishmentWheel;
