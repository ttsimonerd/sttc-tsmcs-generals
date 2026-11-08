import React, { useEffect, useState } from 'react';
import { DEFAULT_DAYS, DEFAULT_WEEKEND_RESTRICTION } from '../types';
import type { DayProbability } from '../types';
import { Badge, Button, PageHeader, Panel, cn } from './ui/Primitives';
import { useToast } from './ui/Toast';
import { logAudit } from '../services/auditService';

const STORAGE_KEY = 'probability_config';

const ProbabilityConfig: React.FC = () => {
  const { toast } = useToast();
  const [days, setDays] = useState<DayProbability[]>(DEFAULT_DAYS);
  const [weekendEnabled, setWeekendEnabled] = useState(DEFAULT_WEEKEND_RESTRICTION.enabled);
  const [weekendMessage, setWeekendMessage] = useState(DEFAULT_WEEKEND_RESTRICTION.message);
  const [punishmentRedirectionProb, setPunishmentRedirectionProb] = useState(10);
  const [status, setStatus] = useState<'IDLE' | 'SAVING' | 'SAVED'>('IDLE');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.days) {
        setDays(parsed.days);
        setWeekendEnabled(parsed.weekendRestriction?.enabled ?? true);
        setWeekendMessage(parsed.weekendRestriction?.message ?? DEFAULT_WEEKEND_RESTRICTION.message);
        setPunishmentRedirectionProb(parsed.punishmentRedirectionProb ?? 10);
      }
    }
  }, []);

  const handleDayChange = (dayNumber: number, field: 'yesProb' | 'noProb', value: string) => {
    const numValue = Math.min(90, Math.max(0, parseInt(value) || 0));

    setDays(prev => prev.map(day => {
      if (day.dayNumber !== dayNumber) return day;

      // Auto-calculate the other field to always sum to 90 (YES + NO = 90%, Edge = 10%)
      if (field === 'yesProb') {
        return { ...day, yesProb: numValue, noProb: 90 - numValue };
      } else {
        return { ...day, noProb: numValue, yesProb: 90 - numValue };
      }
    }));
    setIsDirty(true);
  };

  const handleReset = () => {
    setDays(DEFAULT_DAYS);
    setWeekendEnabled(DEFAULT_WEEKEND_RESTRICTION.enabled);
    setWeekendMessage(DEFAULT_WEEKEND_RESTRICTION.message);
    setPunishmentRedirectionProb(10);
    setIsDirty(true);
    toast('Defaults restored. Save to apply them.', 'info');
    logAudit('Restored default probabilities');
  };

  const handleSave = () => {
    // Validate that all probabilities sum to 90
    const invalidDay = days.find(day => day.yesProb + day.noProb !== 90);
    if (invalidDay) {
      toast(`${invalidDay.dayName}: YES + NO must equal 90% (10% is reserved for edge).`, 'error');
      return;
    }

    setStatus('SAVING');

    const config = {
      days,
      weekendRestriction: {
        enabled: weekendEnabled,
        message: weekendMessage
      },
      punishmentRedirectionProb
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

    // Dispatch event to notify other components
    window.dispatchEvent(new Event('probability-config-updated'));

    setTimeout(() => {
      setStatus('SAVED');
      setIsDirty(false);
      toast('Probability config saved.', 'success');
      logAudit('Saved probability config', `redirection ${punishmentRedirectionProb}% · weekend ${weekendEnabled ? 'on' : 'off'}`);
      setTimeout(() => setStatus('IDLE'), 2000);
    }, 800);
  };

  const getDayColor = (yesProb: number) => {
    if (yesProb >= 80) return 'text-emerald-400';
    if (yesProb >= 50) return 'text-yellow-400';
    if (yesProb >= 20) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configure"
        title="Probability configuration"
        description="Outcome rates for each day of the week. YES and NO must always total 90% — the remaining 10% is reserved for the edge result."
        actions={
          <>
            <Button variant="secondary" onClick={handleReset} disabled={status === 'SAVING'}>
              Reset defaults
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={status === 'SAVING' || !isDirty}>
              {status === 'SAVED' ? 'Saved' : status === 'SAVING' ? 'Saving…' : 'Save changes'}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="eyebrow">Scheduling</p>
              <p className="mt-1.5 text-sm font-semibold text-white">Weekend restriction</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                Blocks every roll on Saturday and Sunday while the custom message is shown instead.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setWeekendEnabled(!weekendEnabled); setIsDirty(true); }}
              role="switch"
              aria-checked={weekendEnabled}
              aria-label="Weekend restriction"
              className={cn(
                'relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200',
                weekendEnabled ? 'border-transparent bg-theme-primary' : 'border-[color:var(--line-strong)] bg-white/[0.08]'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 rounded-full bg-white shadow transition-all duration-200',
                  weekendEnabled ? 'left-[22px]' : 'left-0.5'
                )}
                style={{ height: 18, width: 18 }}
              />
            </button>
          </div>

          {weekendEnabled && (
            <div className="mt-4 space-y-1.5 fade-in">
              <label className="field-label" htmlFor="weekend-message">Blocked-day message</label>
              <input
                id="weekend-message"
                type="text"
                value={weekendMessage}
                onChange={(e) => { setWeekendMessage(e.target.value); setIsDirty(true); }}
                className="field"
                placeholder="Shown instead of a roll on weekends…"
              />
            </div>
          )}

          <div className="hairline my-4" />

          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Punishment redirection</p>
              <p className="mt-0.5 text-xs text-zinc-500">Chance of a forced wheel spin after a roll.</p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="100"
                aria-label="Punishment redirection percentage"
                value={punishmentRedirectionProb}
                onChange={(e) => { setPunishmentRedirectionProb(Math.min(100, Math.max(0, parseInt(e.target.value) || 0))); setIsDirty(true); }}
                className="field w-16 py-1.5 text-center font-mono font-bold text-red-300"
              />
              <span className="text-sm font-semibold text-zinc-500">%</span>
            </div>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
              style={{ width: `${punishmentRedirectionProb}%` }}
            />
          </div>
        </Panel>

        <Panel className="p-5">
          <p className="eyebrow">Week overview</p>
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {days.map((day) => {
              const locked = day.dayNumber >= 5 && weekendEnabled;
              return (
                <div
                  key={day.dayNumber}
                  className={cn(
                    'rounded-lg border px-1 py-2 text-center',
                    locked ? 'border-[color:var(--line)] bg-white/[0.01]' : 'border-[color:var(--line)] bg-black/25'
                  )}
                >
                  <p className="text-[9px] uppercase tracking-wider text-zinc-600">{day.dayName.slice(0, 3)}</p>
                  <p className={cn('mt-1 text-sm font-bold tabular-nums', locked ? 'text-zinc-600' : getDayColor(day.yesProb))}>
                    {locked ? '—' : `${day.yesProb}%`}
                  </p>
                  <div className="mt-1.5 flex h-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full bg-emerald-500/80" style={{ width: locked ? '0%' : `${(day.yesProb / 90) * 100}%` }} />
                    <div className="h-full bg-red-500/70" style={{ width: locked ? '0%' : `${(day.noProb / 90) * 100}%` }} />
                    <div className="h-full bg-violet-500/70" style={{ width: locked ? '0%' : '11.11%' }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-wider text-zinc-500">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-emerald-500/80" /> Yes</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-red-500/70" /> No</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-violet-500/70" /> Edge 10%</span>
          </div>
        </Panel>
      </div>

      <Panel className="p-5">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Daily probabilities</p>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">YES + NO = 90%</p>
        </div>

        <div className="mt-4 space-y-2.5">
          {days.map((day) => {
            const isWeekend = day.dayNumber >= 5;
            const locked = isWeekend && weekendEnabled;

            return (
              <div
                key={day.dayNumber}
                className={cn(
                  'rounded-xl border px-4 py-3 transition-colors',
                  locked ? 'border-[color:var(--line)] bg-white/[0.01] opacity-70' : 'border-[color:var(--line)] bg-black/25'
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-[13px] font-semibold', locked ? 'text-zinc-500' : 'text-white')}>
                      {day.dayName}
                    </span>
                    {isWeekend && (
                      <Badge tone={locked ? 'danger' : 'default'}>{locked ? 'Blocked' : 'Active'}</Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5 font-mono text-[13px] font-semibold tabular-nums">
                    <span className="text-emerald-400">{day.yesProb}%</span>
                    <span className="text-zinc-600">/</span>
                    <span className="text-red-400">{day.noProb}%</span>
                  </div>
                </div>

                <div className="mt-2.5 flex h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full bg-emerald-500/80 transition-all duration-300" style={{ width: `${(day.yesProb / 90) * 100}%` }} />
                  <div className="h-full bg-red-500/70 transition-all duration-300" style={{ width: `${(day.noProb / 90) * 100}%` }} />
                  <div className="h-full bg-violet-500/70 transition-all duration-300" style={{ width: '11.11%' }} />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Yes</label>
                      <span className="font-mono text-[11px] text-zinc-500">{day.yesProb}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={day.yesProb}
                      title={`${day.dayName} YES probability`}
                      aria-label={`${day.dayName} YES probability`}
                      onChange={(e) => handleDayChange(day.dayNumber, 'yesProb', e.target.value)}
                      disabled={locked}
                      className="mt-1 w-full accent-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-red-400">No</label>
                      <span className="font-mono text-[11px] text-zinc-500">{day.noProb}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={day.noProb}
                      title={`${day.dayName} NO probability`}
                      aria-label={`${day.dayName} NO probability`}
                      onChange={(e) => handleDayChange(day.dayNumber, 'noProb', e.target.value)}
                      disabled={locked}
                      className="mt-1 w-full accent-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel tone="muted" className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-white">Edge result</p>
              <Badge tone="warning">Fixed</Badge>
            </div>
            <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-zinc-500">
              A 10% outcome that cannot be edited here. It grants one consolation supply and reads
              “Edge X days — come back and release the load with a random supply.”
            </p>
          </div>
          <p className="font-mono text-2xl font-bold text-violet-300">10%</p>
        </div>
      </Panel>

      <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-700">
        Changes take effect immediately after saving · System version 1.5.0
      </p>
    </div>
  );
};

export default ProbabilityConfig;
