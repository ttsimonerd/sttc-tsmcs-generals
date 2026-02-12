import React, { useState, useEffect } from 'react';
import { DayProbability, DEFAULT_DAYS, DEFAULT_WEEKEND_RESTRICTION } from '../types';

const STORAGE_KEY = 'probability_config';

const ProbabilityConfig: React.FC = () => {
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
  };

  const handleSave = () => {
    // Validate that all probabilities sum to 90
    const invalidDay = days.find(day => day.yesProb + day.noProb !== 90);
    if (invalidDay) {
      alert(`Invalid probability for ${invalidDay.dayName}. YES + NO must equal 90% (10% reserved for Edge).`);
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
      setTimeout(() => setStatus('IDLE'), 2000);
    }, 800);
  };

  const getDayColor = (yesProb: number) => {
    if (yesProb >= 80) return 'text-emerald-400';
    if (yesProb >= 50) return 'text-yellow-400';
    if (yesProb >= 20) return 'text-orange-400';
    return 'text-red-400';
  };

  const getBarWidth = (prob: number) => {
    return `${Math.min(100, Math.max(0, prob))}%`;
  };

  const getBarColor = (yesProb: number) => {
    if (yesProb >= 80) return 'bg-emerald-500';
    if (yesProb >= 50) return 'bg-yellow-500';
    if (yesProb >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 fade-in">
      <div className="glass-panel p-8 rounded-2xl space-y-6 relative overflow-hidden border border-emerald-500/30">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Probability Configuration</h2>
            <p className="text-zinc-400 text-xs font-mono mt-1">Adjust win/loss probabilities for each day</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              disabled={status === 'SAVING'}
              className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg font-bold text-sm transition-all"
            >
              Reset Defaults
            </button>
            <button
              onClick={handleSave}
              disabled={status === 'SAVING' || !isDirty}
              className={`px-8 py-2 rounded-lg font-bold text-sm transition-all shadow-lg flex items-center gap-2
                ${status === 'SAVED'
                  ? 'bg-emerald-400 text-black'
                  : status === 'SAVING'
                    ? 'bg-emerald-600 text-white'
                    : isDirty
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                }`}
            >
              {status === 'SAVING' && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {status === 'SAVED' ? 'Saved ✓' : status === 'SAVING' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Weekend Restriction */}
        <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-700/50 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Weekend Restriction</h3>
              <p className="text-zinc-500 text-xs">Disable rolls on Saturday and Sunday</p>
            </div>
            <button
              onClick={() => { setWeekendEnabled(!weekendEnabled); setIsDirty(true); }}
              title="Toggle Weekend Restriction"
              aria-label="Toggle Weekend Restriction"
              className={`relative w-16 h-8 rounded-full transition-all duration-300 ${weekendEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
                }`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300 ${weekendEnabled ? 'left-9' : 'left-1'
                }`} />
            </button>
          </div>

          {weekendEnabled && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Restriction Message</label>
              <input
                type="text"
                value={weekendMessage}
                onChange={(e) => { setWeekendMessage(e.target.value); setIsDirty(true); }}
                className="w-full bg-black/40 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-300 font-mono text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                placeholder="Enter message displayed on weekends..."
              />
            </div>
          )}
        </div>

        {/* Punishment Redirection Probability */}
        <div className="p-6 bg-zinc-900/50 rounded-xl border border-red-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-red-400">Punishment Redirection</h3>
              <p className="text-zinc-500 text-xs">Probability of being redirected to Punishment Wheel after Arbiter roll</p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                max="100"
                value={punishmentRedirectionProb}
                onChange={(e) => { setPunishmentRedirectionProb(Math.min(100, Math.max(0, parseInt(e.target.value) || 0))); setIsDirty(true); }}
                className="w-20 bg-black/40 border border-red-500/50 rounded-lg px-3 py-2 text-red-400 font-bold text-center focus:outline-none focus:border-red-400 transition-all"
              />
              <span className="text-red-400 font-bold">%</span>
            </div>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
              style={{ width: `${punishmentRedirectionProb}%` }}
            />
          </div>
        </div>

        {/* Day Probabilities */}
        <div className="space-y-4">
          <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Daily Probabilities</label>

          <div className="grid gap-4">
            {days.map((day) => {
              const isWeekend = day.dayNumber >= 5;

              return (
                <div
                  key={day.dayNumber}
                  className={`p-4 rounded-xl border transition-all ${isWeekend
                    ? 'bg-zinc-900/30 border-zinc-800 opacity-60'
                    : 'bg-zinc-800/30 border-white/5'
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold uppercase tracking-wider ${isWeekend ? 'text-zinc-500' : 'text-white'
                        }`}>
                        {day.dayName}
                      </span>
                      {isWeekend && (
                        <span className="text-[10px] px-2 py-0.5 bg-zinc-700 text-zinc-400 rounded-full">
                          {weekendEnabled ? 'Disabled' : 'Active'}
                        </span>
                      )}
                    </div>
                    <div className={`text-2xl font-black font-mono ${getDayColor(day.yesProb)}`}>
                      {day.yesProb}% / {day.noProb}%
                    </div>
                  </div>

                  {/* Progress Bar - showing YES, NO, and Edge portions */}
                  <div className="h-4 bg-zinc-900 rounded-full overflow-hidden flex mb-4">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${(day.yesProb / 90) * 100}%` }}
                    />
                    <div
                      className="h-full bg-red-500 transition-all duration-300"
                      style={{ width: `${(day.noProb / 90) * 100}%` }}
                    />
                    <div
                      className="h-full bg-purple-500 transition-all duration-300"
                      style={{ width: '11.11%' }}
                      title="Edge: 10%"
                    />
                  </div>

                  {/* Sliders */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-emerald-400 font-bold uppercase">YES Probability</label>
                        <span className="text-xs text-zinc-500 font-mono">{day.yesProb}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="90"
                        value={day.yesProb}
                        title={`${day.dayName} YES Probability`}
                        aria-label={`${day.dayName} YES Probability`}
                        onChange={(e) => handleDayChange(day.dayNumber, 'yesProb', e.target.value)}
                        disabled={isWeekend && weekendEnabled}
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isWeekend && weekendEnabled
                          ? 'bg-zinc-800 cursor-not-allowed'
                          : 'bg-zinc-700 accent-emerald-500'
                          }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-red-400 font-bold uppercase">NO Probability</label>
                        <span className="text-xs text-zinc-500 font-mono">{day.noProb}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="90"
                        value={day.noProb}
                        title={`${day.dayName} NO Probability`}
                        aria-label={`${day.dayName} NO Probability`}
                        onChange={(e) => handleDayChange(day.dayNumber, 'noProb', e.target.value)}
                        disabled={isWeekend && weekendEnabled}
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isWeekend && weekendEnabled
                          ? 'bg-zinc-800 cursor-not-allowed'
                          : 'bg-zinc-700 accent-red-500'
                          }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual Week Preview */}
        <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-700/50">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Week Overview</h3>
          <div className="flex gap-2">
            {days.map((day) => {
              const isWeekend = day.dayNumber >= 5;
              const isRestricted = isWeekend && weekendEnabled;

              return (
                <div
                  key={day.dayNumber}
                  className={`flex-1 p-3 rounded-lg text-center space-y-2 ${isRestricted
                    ? 'bg-zinc-800/50 border border-zinc-700/50'
                    : 'bg-zinc-800/30 border border-white/5'
                    }`}
                >
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{day.dayName.slice(0, 3)}</div>
                  <div className={`text-lg font-bold ${getDayColor(isRestricted ? 0 : day.yesProb)}`}>
                    {isRestricted ? '✕' : `${day.yesProb}%`}
                  </div>
                  <div className="h-2 bg-zinc-900 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: isRestricted ? '0%' : `${(day.yesProb / 90) * 100}%` }}
                    />
                    <div
                      className="h-full bg-red-500"
                      style={{ width: isRestricted ? '0%' : `${(day.noProb / 90) * 100}%` }}
                    />
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: isRestricted ? '0%' : '11.11%' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-[10px]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-500"></div>
              <span className="text-zinc-500">YES</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              <span className="text-zinc-500">NO</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500"></div>
              <span className="text-zinc-500">EDGE (10%)</span>
            </div>
          </div>
        </div>

        {/* Edge Probability Info */}
        <div className="p-6 bg-purple-900/20 rounded-xl border border-purple-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <span className="text-xl">🥴</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-purple-400">Edge Result</h3>
              <p className="text-xs text-zinc-500">Special bonus outcome</p>
            </div>
          </div>
          <div className="flex items-center justify-between bg-black/30 p-4 rounded-lg">
            <div>
              <p className="text-sm text-zinc-400">Fixed Probability</p>
              <p className="text-xs text-zinc-600">Cannot be modified by owner</p>
            </div>
            <div className="text-3xl font-black text-purple-400">10%</div>
          </div>
          <p className="text-xs text-zinc-500 mt-3">
            When triggered, displays: "Edge X days and when you come back release the load with [random supply] 🥴"
            <br />
            <span className="text-purple-400">Automatically grants 1 consolation supply.</span>
          </p>
        </div>

        {/* Footer Info */}
        <div className="flex justify-between items-center text-[10px] text-zinc-600 font-mono pt-4 border-t border-zinc-800">
          <span>Changes take effect immediately after saving</span>
          <span>System Version: 1.5.0</span>
        </div>
      </div>
    </div>
  );
};

export default ProbabilityConfig;
