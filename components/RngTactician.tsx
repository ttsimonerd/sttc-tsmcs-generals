import React, { useState, useEffect, useRef, useCallback } from 'react';
import { rollWithLimitDetailed, checkMultiple, getMaterials, loadWeekData, resetWins, getEdgeSupply } from '../services/rngService';
import type { RollOutcome } from '../services/rngService';
import { ItemAction } from '../types';
import type { RiddleResponse, FailedLog, ActionLog, Material } from '../types';
import { getPoints, canClaimDailyBonus, claimDailyBonus, ITEM_IDS, useFromInventory, getInventoryCount, addPointsWithMultiplier, getDoublePointsRemaining, processItemAction, addToInventory } from '../services/pointsService';

// Local type aliases to avoid inline generic unions in hooks (Babel parsing workaround)
type Step = 'IDLE' | 'ROLLING' | 'ROLLED' | 'MULTIPLE_OFFER' | 'MATERIALS_OFFER' | 'SHOW_MATERIALS';
type RedeemerStatus = 'IDLE' | 'CORRECT' | 'WRONG';

import { getRiddles } from '../services/riddleService';
import { PageHeader, Panel, Stat } from './ui/Primitives';

// All possible results for the roulette (used for actual game logic)
const ROULETTE_RESULTS = ['No 🥶', 'Yes 🥵', 'No 🥶', 'Yes 🥵', 'Dont Break The Rule!', 'Edge 7 days... 🥴'];

// Roulette Wheel Component - simplified and robust
const RouletteWheel: React.FC<{
  isSpinning: boolean;
  onComplete: (result: string) => void;
  finalResult: string;
  finalOutcome: RollOutcome;
}> = ({ isSpinning, onComplete, finalResult, finalOutcome }) => {
  const wheelRef = useRef(null as HTMLDivElement | null);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const animationRef = useRef(null as number | null);
  const rotationRef = useRef(0 as number);

  const segmentAngle = 360 / ROULETTE_RESULTS.length;
  const isEdgeResult = finalOutcome === 'EDGE';

  // Spin to the exact segment center under the top pointer
  useEffect(() => {
    if (!isSpinning) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    // Map the outcome onto a wheel segment. This must always resolve: a message that
    // matched no segment (a custom weekend message, say) used to abort the animation, so
    // the wheel spun forever and onComplete never fired.
    const segmentByOutcome: Record<RollOutcome, number> = {
      YES: 1,
      NO: 0,
      LIMIT: 4,
      BLOCKED: 4,
      EDGE: ROULETTE_RESULTS.findIndex((r) => r.includes('Edge')),
    };
    const targetIndex = Math.max(0, segmentByOutcome[finalOutcome]);

    const extraTurns = 4 * 360; // 4 full spins
    const segmentCenter = targetIndex * segmentAngle + segmentAngle / 2;
    // Align the segment center to the top pointer (270deg)
    const centerOffset = 270; // degrees (top)
    let target = centerOffset - segmentCenter;

    // Normalize target to [0, 360)
    target = ((target % 360) + 360) % 360;

    const start = rotationRef.current % 360;
    const end = start + extraTurns + target;

    const duration = isEdgeResult ? 5000 : 3000;
    const startTime = performance.now();

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const p = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(p);
      const current = start + (end - start) * eased;
      rotationRef.current = current;
      setRotation(current);

      if (p < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        rotationRef.current = end;
        setRotation(end);
        setShowResult(true);
        onComplete(finalResult);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isSpinning, finalOutcome, segmentAngle, isEdgeResult, onComplete]);

  // Reset result visuals when not spinning
  useEffect(() => {
    if (!isSpinning) {
      setShowResult(false);
    }
  }, [isSpinning]);

  // Colors for segments
  const segmentColors = ['#3f3f46', '#27272a'];

  return (
    <div className="relative w-72 h-72 md:w-96 md:h-96">
      {/* Pointer */}
      <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-30">
        <div
          className={`w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[35px] ${showResult
            ? finalResult.includes('Edge')
              ? 'border-t-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]'
              : 'border-t-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]'
            : 'border-t-zinc-400 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]'
            }`}
        />
      </div>

      {/* Wheel */}
      <div
        ref={wheelRef}
        className="relative w-full h-full rounded-full"
        style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.05s linear' }}
      >
        <svg className="w-full h-full" viewBox="0 0 200 200">
          {/* Outer ring */}
          <circle cx="100" cy="100" r="98" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />

          {/* Segments and Labels */}
          {ROULETTE_RESULTS.map((result, i) => {
            const startAngle = (i * segmentAngle * Math.PI) / 180;
            const endAngle = (((i + 1) * segmentAngle) * Math.PI) / 180;
            const cx = 100;
            const cy = 100;
            const r = 95;
            const x1 = cx + r * Math.cos(startAngle);
            const y1 = cy + r * Math.sin(startAngle);
            const x2 = cx + r * Math.cos(endAngle);
            const y2 = cy + r * Math.sin(endAngle);
            const largeArc = segmentAngle > 180 ? 1 : 0;
            const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

            // Text label position (radius approx 75)
            const labelAngle = (i * segmentAngle + segmentAngle / 2) * (Math.PI / 180);
            const labelR = 75;
            const tx = cx + labelR * Math.cos(labelAngle);
            const ty = cy + labelR * Math.sin(labelAngle);
            const textRotation = (i * segmentAngle + segmentAngle / 2);

            const label = result.includes('Yes') ? 'SI' : result.includes('Edge') ? 'EDGE' : result.includes('Rule') ? 'LIMIT' : 'NO';

            return (
              <g key={i}>
                <path d={d} fill={segmentColors[i % 2]} stroke="#2a2a2e" strokeWidth="0.5" />
                <text
                  x={tx}
                  y={ty}
                  fill="white"
                  fontSize="10"
                  fontWeight="900"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textRotation + 90}, ${tx}, ${ty})`}
                  className="select-none opacity-40 font-mono"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Inner hub */}
          <circle cx="100" cy="100" r="55" fill="#1f1f23" stroke="#2f2f35" strokeWidth="2" />
        </svg>
      </div>

      {/* Center cap */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center shadow-lg z-10 transition-all duration-300 ${showResult
          ? finalResult.includes('Edge')
            ? 'w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500/30 to-purple-600/20 border-purple-400'
            : 'w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border-emerald-400'
          : 'w-14 h-14 md:w-18 md:h-18 bg-gradient-to-br from-zinc-600 to-zinc-800 border-zinc-500'
          }`}
        style={{ border: '2px solid' }}
      >
        <span className={`${showResult ? (finalResult.includes('Edge') ? 'text-purple-300' : 'text-emerald-300') : 'text-zinc-500'} text-lg md:text-xl`}>
          {showResult ? '✓' : '?'}
        </span>
      </div>

      {/* Subtle outer glow */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-500 ${isSpinning && isEdgeResult
          ? 'bg-purple-500/20 blur-xl'
          : showResult
            ? finalResult.includes('Edge')
              ? 'bg-purple-500/20 blur-xl'
              : 'bg-emerald-500/10 blur-xl'
            : 'bg-zinc-800/5 blur-md'
          }`}
      />
    </div>
  );
};

interface RngTacticianProps {
  onRedirectionTriggered?: (supply: string) => void;
}

const RngTactician: React.FC<RngTacticianProps> = ({ onRedirectionTriggered }) => {
  const [step, setStep] = useState('IDLE' as Step);
  const [rollResult, setRollResult] = useState('');
  const [multipleResult, setMultipleResult] = useState('');
  const [materials, setMaterials] = useState([] as Material[]);
  const [supplyTitle, setSupplyTitle] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [weekData, setWeekData] = useState(loadWeekData());

  // Local Redeemer State (no API)
  const [redeemerOpen, setRedeemerOpen] = useState(false);
  const [currentRiddle, setCurrentRiddle] = useState(null as RiddleResponse | null);
  const [userAnswer, setUserAnswer] = useState('');
  const [redeemerStatus, setRedeemerStatus] = useState('IDLE' as RedeemerStatus);
  const [failedLogs, setFailedLogs] = useState([] as FailedLog[]);

  // Operation Log State
  const [actionLogs, setActionLogs] = useState([] as ActionLog[]);

  // Rolling state
  const [, setIsRolling] = useState(false);
  const [rollOutcome, setRollOutcome] = useState('NO' as RollOutcome);
  const rollingResultRef = useRef('' as string);
  const rollingOutcomeRef = useRef('NO' as RollOutcome);
  // Prevents a restarted wheel animation from paying out the same roll twice.
  const settledRef = useRef(true);

  // Points state
  const [currentPoints, setCurrentPoints] = useState(0);
  const [showDailyBonus, setShowDailyBonus] = useState(false);

  // Extra Roll item state
  const [extraRollCount, setExtraRollCount] = useState(0);
  const [showUseExtraRoll, setShowUseExtraRoll] = useState(false);

  // Double points timer display
  const [doublePointsTime, setDoublePointsTime] = useState(0);

  // Punishment Redirection State
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [redirectSupply, setRedirectSupply] = useState('');

  // Refresh stats on load or update
  const refreshStats = useCallback(() => {
    setWeekData(loadWeekData());
    setCurrentPoints(getPoints());
    setExtraRollCount(getInventoryCount(ITEM_IDS.EXTRA_ROLL));
    setDoublePointsTime(getDoublePointsRemaining());
  }, []);

  useEffect(() => {
    refreshStats();
    // Check for daily bonus
    if (canClaimDailyBonus()) {
      setShowDailyBonus(true);
    }
  }, [step, redeemerStatus, refreshStats]);

  const handleClaimDailyBonus = () => {
    claimDailyBonus();
    setShowDailyBonus(false);
    refreshStats();
    addToLog('+5 points daily bonus claimed!', 'success');
  };

  const addToLog = (message: string, type: 'success' | 'error' | 'warning' | 'neutral') => {
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const id = now.getTime().toString() + Math.random().toString();
    setActionLogs((prev) => [{ id, time, message, type }, ...prev]);
  };

  const handleRoll = (forceBypass: boolean = false) => {
    setShowUseExtraRoll(false);

    let outcome: RollOutcome;
    let result: string;

    if (forceBypass) {
      // Spend the Extra Roll first so a result can never be rolled for free.
      if (!useFromInventory(ITEM_IDS.EXTRA_ROLL)) {
        addToLog('No Extra Roll available.', 'error');
        return;
      }
      setExtraRollCount(getInventoryCount(ITEM_IDS.EXTRA_ROLL));
      addToLog('🎲 Used Extra Roll!', 'warning');

      const bypassed = rollWithLimitDetailed(true);
      outcome = bypassed.outcome;
      result = bypassed.message;

      // Extra Rolls cannot buy past the weekend restriction: give the item back.
      if (outcome === 'BLOCKED') {
        addToInventory(ITEM_IDS.EXTRA_ROLL);
        setExtraRollCount(getInventoryCount(ITEM_IDS.EXTRA_ROLL));
      }
    } else {
      const roll = rollWithLimitDetailed(false);
      outcome = roll.outcome;
      result = roll.message;

      // Hit the weekly limit with Extra Rolls in the bag: offer to spend one.
      if (outcome === 'LIMIT' && extraRollCount > 0) {
        setShowUseExtraRoll(true);
        setRollResult(result);
        return;
      }
    }

    settledRef.current = false;
    rollingOutcomeRef.current = outcome;
    setIsRolling(true);
    setStep('ROLLING');
    setMaterials([]);
    setMultipleResult('');
    setSupplyTitle('');

    rollingResultRef.current = result;
  };

  // Redirect Timer
  useEffect(() => {
    if (isRedirecting && redirectCountdown > 0) {
      const timer = setTimeout(() => setRedirectCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isRedirecting && redirectCountdown === 0) {
      if (onRedirectionTriggered) {
        onRedirectionTriggered(redirectSupply);
        setIsRedirecting(false);
      }
    }
  }, [isRedirecting, redirectCountdown, onRedirectionTriggered, redirectSupply]);

  const handleRollingComplete = (result: string) => {
    // A restarted animation must never settle the same roll twice.
    if (settledRef.current) return;
    settledRef.current = true;

    const outcome = rollingOutcomeRef.current;

    setIsRolling(false);
    setRollResult(result);
    setRollOutcome(outcome);
    setStep('ROLLED');
    refreshStats();


    // Award points based on outcome (with double points multiplier)
    if (outcome === 'YES') {
      // Win = +20 points (or 40 with double points)
      const { doubled } = addPointsWithMultiplier(20);
      addToLog(`+${doubled ? 40 : 20} points for winning!${doubled ? ' (2x!)' : ''}`, 'success');

      // Punishment redirection only happens on "Yes" results (not No or Edge)
      // Check AFTER awarding points so user gets their reward first
      const probConfig = JSON.parse(localStorage.getItem('probability_config') || '{}');
      const redirectionProbability = (probConfig.punishmentRedirectionProb ?? 5) / 100;
      const isPunishmentRedirection = Math.random() < redirectionProbability;
      if (isPunishmentRedirection) {
        // Get the supply that would have been awarded
        const potentialSupply = getMaterials(1)[0]?.name ?? 'special supply';
        setRedirectSupply(potentialSupply);
        setRedirectCountdown(5); // Reset countdown to 5 seconds
        setIsRedirecting(true);
        setStep('IDLE'); // Clear results to focus on warning
        addToLog('SYSTEM INTERFERENCE DETECTED', 'error');
        return;
      }

      setStep('MULTIPLE_OFFER');
    }

    // Edge result = +50 points (or 100 with double points)
    if (outcome === 'EDGE') {
      const { doubled } = addPointsWithMultiplier(50);
      addToLog(`+${doubled ? 100 : 50} points for Edge result!${doubled ? ' (2x!)' : ''}`, 'success');

      // The generateEdgeMessage now returns supply: Material in its internal logic, 
      // but rollWithLimit only returns the string. We need to get the actual Material object.
      // Easiest is to re-get it if we can, or modify rollWithLimit to return the object.
      // Let's modify rollWithLimit in a follow-up or just use getMaterials(1)[0] here for now 
      // (though it might not match the message).

      // Better: let's extract the name and find it in the registry or just create a temporary one.
      const edgeSupplyName = getEdgeSupply(result);
      const tempMaterial: Material = { name: edgeSupplyName };

      // Actually, let's just use the name extracted for now. 
      // In a real scenario, we'd want the full object.
      setMaterials([tempMaterial]);
      setSupplyTitle('-- EDGE CHALLENGE SUPPLY --');
      addToLog(edgeSupplyName, 'warning');
      setStep('SHOW_MATERIALS');
    }

    // Lose = nothing changes (no points added or removed)
  };

  const handleMultiple = (choice: boolean) => {
    if (!choice) {
      const todaysSupply = getMaterials(1);
      setMaterials(todaysSupply);
      setSupplyTitle("-- TODAY'S SUPPLY --");
      addToLog(todaysSupply[0].name, 'neutral');
      setStep('SHOW_MATERIALS');
      return;
    }

    const result = checkMultiple();
    setMultipleResult(result);

    if (result === 'Yes') {
      setStep('MATERIALS_OFFER');
    } else {
      const consolationSupply = getMaterials(1);
      setMaterials(consolationSupply);
      setSupplyTitle('-- CONSOLATION SUPPLY (1) --');
      addToLog(consolationSupply[0].name, 'error');
      setStep('SHOW_MATERIALS');
    }
  };

  const handleMaterials = (choice: boolean) => {
    if (choice) {
      const mats = getMaterials(quantity);
      setMaterials(mats);
      setSupplyTitle(`-- ACQUIRED ASSETS (${quantity}) --`);

      // Process actions for acquired materials
      mats.forEach(m => {
        addToLog(m.name, 'success');
        if (m.action && m.action !== ItemAction.NONE) {
          const { message } = processItemAction(m.action, m.actionValue);
          if (message) addToLog(message, 'warning');
        }
      });

      setStep('SHOW_MATERIALS');
    } else {
      setStep('ROLLED');
    }
  };

  // Local Redeemer Logic (no API calls)
  const handleSummonRedeemer = () => {
    setRedeemerStatus('IDLE');
    setUserAnswer('');

    // Get previously failed questions
    const storedFailed = JSON.parse(localStorage.getItem('redeemer_failed_questions') || '[]');

    const riddles = getRiddles();
    // Filter out used riddles
    const availableRiddles = riddles.filter((r) => !storedFailed.includes(r.question));

    // Select random riddle
    let randomRiddle;

    if (availableRiddles.length > 0) {
      randomRiddle = availableRiddles[Math.floor(Math.random() * availableRiddles.length)];
    } else if (riddles.length > 0) {
      // Reset failed if all riddles used (or just pick random from full list)
      // Let's reset the failed list to allow retries
      localStorage.removeItem('redeemer_failed_questions');
      randomRiddle = riddles[Math.floor(Math.random() * riddles.length)];
    } else {
      // Emergency fallback
      randomRiddle = { question: "Error: No riddles found.", answer: "Error" };
    }

    setCurrentRiddle(randomRiddle);
    setRedeemerOpen(true);
  };

  const handleSubmitRedemption = () => {
    if (!currentRiddle || !userAnswer.trim()) {
      return;
    }

    // Normalize answers for comparison
    const correctAnswer = currentRiddle.answer.toLowerCase().trim();
    const userAns = userAnswer.toLowerCase().trim();

    // Check if answer is correct (allow some flexibility)
    const isCorrect = correctAnswer === userAns || correctAnswer.includes(userAns) || userAns.includes(correctAnswer);

    if (isCorrect) {
      resetWins();
      setRedeemerStatus('CORRECT');
      refreshStats();
      setTimeout(() => {
        setRedeemerOpen(false);
        setRedeemerStatus('IDLE');
        setCurrentRiddle(null);
        setUserAnswer('');
      }, 3000);
    } else {
      setRedeemerStatus('WRONG');
      setFailedLogs((prev) => [
        {
          question: currentRiddle.question,
          answer: currentRiddle.answer,
          userAnswer: userAnswer
        },
        ...prev
      ]);

      const failed = JSON.parse(localStorage.getItem('redeemer_failed_questions') || '[]');
      failed.push(currentRiddle.question);
      localStorage.setItem('redeemer_failed_questions', JSON.stringify(failed));
    }
  };


  return (
    <div className="space-y-7">
      {/* Punishment Redirection Warning */}
      {isRedirecting && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-fade-in backdrop-blur-xl">
          <Panel tone="danger" className="relative w-full max-w-md space-y-6 overflow-hidden p-8 text-center">
            {/* Simple flickering background effect */}
            <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>

            <div className="relative z-10 space-y-4">
              <span className="text-6xl animate-bounce inline-block">💀</span>
              <h2 className="text-3xl font-black text-red-500 uppercase tracking-tighter">DISGRACED ONE</h2>
              <p className="text-red-400 font-medium text-lg leading-tight uppercase">
                You have to take a try on the <br />Punishment Roulette
              </p>

              <div className="pt-4 border-t border-red-500/20">
                <p className="text-zinc-500 text-xs uppercase tracking-widest">Redirecting to the special roulette in</p>
                <div className="text-5xl font-black text-white mt-1 animate-ping">
                  {redirectCountdown}
                </div>
              </div>
            </div>
          </Panel>
        </div>
      )}
      <PageHeader
        eyebrow="Weekly allocation"
        title="The Arbiter"
        description="Three wins per week. Probabilities shift by weekday, and Edge always takes its fixed 10%."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Stats & Redeemer */}
        <div className="md:col-span-1 space-y-6">
          {/* Stats Panel */}
          <Panel tone="accent" className="h-fit space-y-4 p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="eyebrow">System status</p>
              <span className="chip">Week {weekData.week_number}</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <Stat label="Wins" value={`${weekData.yes_count} / 3`} tone={weekData.yes_count >= 3 ? 'danger' : 'primary'} />
              <Stat label="Points" value={currentPoints} tone="warning" />
            </div>

            {/* Daily Bonus */}
            {showDailyBonus && (
              <button
                onClick={handleClaimDailyBonus}
                className="w-full rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-400/20"
              >
                Claim daily bonus · +5
              </button>
            )}
          </Panel>

          {/* Operation History Log */}
          <Panel className="flex max-h-[300px] animate-fade-in flex-col space-y-4 p-5">
            <div className="flex items-center justify-between shrink-0">
              <p className="eyebrow">Supply history</p>
              {actionLogs.length > 0 && (
                <button onClick={() => setActionLogs([])} className="text-[10px] text-zinc-600 hover:text-emerald-400 uppercase">
                  Clear
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 min-h-[100px]">
              {actionLogs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-700 text-xs italic">No supplies recorded.</div>
              ) : (
                actionLogs.map((log) => (
                  <div key={log.id} className="text-xs border-l-2 border-zinc-800 pl-2 py-0.5">
                    <span className="text-zinc-600 font-mono mr-2">[{log.time}]</span>
                    <span
                      className={`${log.type === 'success'
                        ? 'text-emerald-400'
                        : log.type === 'error'
                          ? 'text-red-400'
                          : log.type === 'warning'
                            ? 'text-yellow-500'
                            : 'text-zinc-400'
                        } `}
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Panel>

          {/* The Redeemer Panel */}
          <div
            className={`relative space-y-4 overflow-hidden rounded-[18px] border p-5 transition-all duration-500 ${redeemerOpen ? 'border-red-500/50 bg-red-900/20 shadow-[0_0_30px_rgba(220,38,38,0.2)]' : 'border-red-500/10 bg-[#0b0d12]'
              }`}
          >
            {redeemerOpen && <div className="absolute inset-0 bg-red-900/5 pointer-events-none animate-pulse"></div>}
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className={`w-5 h-5 ${redeemerOpen ? 'text-red-400 animate-pulse' : 'text-red-500'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
                <h3 className={`text-sm font-bold uppercase tracking-widest ${redeemerOpen ? 'text-red-300' : 'text-red-400'}`}>The Redeemer</h3>
              </div>

              {!redeemerOpen ? (
                <>
                  <p className="text-xs text-zinc-400 mb-4">Wins exceeded? Challenge the system to reset your fate.</p>
                  <button
                    onClick={handleSummonRedeemer}
                    disabled={weekData.yes_count < 3}
                    className={`w-full py-2 border rounded-lg text-xs font-bold uppercase transition-all ${weekData.yes_count < 3
                      ? 'bg-zinc-800 text-zinc-600 border-zinc-700 cursor-not-allowed'
                      : 'bg-red-500/10 hover:bg-red-500/30 text-red-400 border-red-500/50 hover:scale-[1.02]'
                      }`}
                  >
                    {weekData.yes_count < 3 ? 'Not Available (Need 3 Wins)' : 'Challenge Fate'}
                  </button>
                </>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  {redeemerStatus === 'IDLE' && currentRiddle && (
                    <>
                      <div className="p-4 bg-black/40 rounded-xl border border-red-500/20">
                        <p className="text-sm text-zinc-200 italic leading-relaxed">"{currentRiddle.question}"</p>
                      </div>
                      <input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type your answer..."
                        className="w-full bg-black/50 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSubmitRedemption}
                          disabled={!userAnswer.trim()}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${userAnswer.trim()
                            ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                            }`}
                        >
                          Submit Answer
                        </button>
                        <button
                          onClick={() => {
                            setRedeemerOpen(false);
                            setCurrentRiddle(null);
                          }}
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg text-xs transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                  {redeemerStatus === 'CORRECT' && (
                    <div className="text-center py-6 space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center animate-success-pop">
                        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-emerald-400 font-bold text-lg animate-success-glow">ACCEPTED</p>
                      <p className="text-xs text-zinc-400">Your wins have been reset to 0.</p>
                      <div className="text-[10px] text-zinc-600">Closing in 3 seconds...</div>
                    </div>
                  )}
                  {redeemerStatus === 'WRONG' && (
                    <div className="text-center py-4 space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-full bg-red-500/20 flex items-center justify-center animate-failure-pulse">
                        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <p className="text-red-500 font-bold text-sm animate-failure-glow">DENIED</p>
                      <div className="p-3 bg-zinc-800/50 rounded-lg border border-white/5">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">Correct Answer</p>
                        <p className="text-sm text-emerald-400 font-bold">{currentRiddle?.answer}</p>
                      </div>
                      <button onClick={handleSummonRedeemer} className="text-xs underline text-red-400 hover:text-red-300 transition-colors">
                        Try Another Question
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Failure Archive (Log) */}
          {failedLogs.length > 0 && (
            <Panel className="space-y-4 p-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Failure archive</p>
                <button onClick={() => setFailedLogs([])} className="text-[10px] text-zinc-600 hover:text-red-400 uppercase">
                  Clear
                </button>
              </div>
              <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                {failedLogs.map((log, idx) => (
                  <div key={idx} className="p-3 bg-zinc-900/50 rounded-lg border border-white/5 space-y-2">
                    <p className="text-xs text-zinc-400 line-clamp-2">"{log.question}"</p>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[10px] uppercase tracking-wide">
                        <span className="text-red-500/70">Your Answer</span>
                        <span className="text-emerald-500/70">Correct Answer</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-red-400 line-through decoration-red-500/50 opacity-80">{log.userAnswer}</span>
                        <span className="text-emerald-400 font-bold">{log.answer}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>

        {/* Main Interface */}
        <Panel tone="accent" className="relative flex min-h-[420px] flex-col items-center justify-center space-y-6 overflow-hidden p-6 text-center md:col-span-2 sm:p-8">
          <div className="absolute inset-0 noise-bg opacity-10 pointer-events-none"></div>

          {step === 'IDLE' && (
            <>
              <RouletteWheel isSpinning={false} onComplete={() => { }} finalResult="" finalOutcome="NO" />

              {/* Extra Roll Offer Modal */}
              {showUseExtraRoll && (
                <div className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30 space-y-4 animate-fade-in">
                  <p className="text-xl font-bold text-blue-400">🎲 Weekly Limit Reached!</p>
                  <p className="text-zinc-400 text-sm">You have <span className="text-blue-400 font-bold">{extraRollCount}</span> Extra Roll(s) available.</p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => handleRoll(true)}
                      className="px-6 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded-lg hover:bg-blue-500/30 transition-all hover:scale-105"
                    >
                      🎲 USE EXTRA ROLL
                    </button>
                    <button
                      onClick={() => setShowUseExtraRoll(false)}
                      className="px-6 py-2 bg-zinc-500/20 text-zinc-400 border border-zinc-500/50 rounded-lg hover:bg-zinc-500/30 transition-all hover:scale-105"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}

              {!showUseExtraRoll && (
                <>
                  <button
                    onClick={() => handleRoll(false)}
                    className="h-14 rounded-2xl bg-theme-primary px-10 text-base font-bold uppercase tracking-wider text-black shadow-lg transition-all hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
                  >
                    INITIATE ROLL
                  </button>
                  <p className="text-zinc-500 text-sm">Probabilities calculated based on temporal coordinates.</p>

                  {/* Active effects indicator */}
                  {(extraRollCount > 0 || doublePointsTime > 0) && (
                    <div className="flex flex-wrap gap-2 justify-center mt-2">
                      {extraRollCount > 0 && (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                          🎲 {extraRollCount} Extra Roll(s)
                        </span>
                      )}
                      {doublePointsTime > 0 && (
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                          ✨ 2x Points Active
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {step === 'ROLLING' && (
            <div className="flex flex-col items-center gap-4">
              <RouletteWheel isSpinning={true} onComplete={handleRollingComplete} finalResult={rollingResultRef.current} finalOutcome={rollingOutcomeRef.current} />
              <p className="font-mono text-emerald-400 animate-pulse text-lg">DETERMINING FATE...</p>
            </div>
          )}

          {(step === 'ROLLED' || step === 'MULTIPLE_OFFER' || step === 'MATERIALS_OFFER' || step === 'SHOW_MATERIALS') && (
            <div className="w-full space-y-8">
              <div className="space-y-2">
                <p className="text-zinc-400 uppercase tracking-widest text-xs animate-fade-in-up">Outcome</p>
                <h2
                  className={`text-6xl font-black ${
                    rollOutcome === 'YES'
                      ? 'text-emerald-400 animate-success-pop'
                      : rollOutcome === 'EDGE'
                        ? 'text-purple-400 animate-success-pop'
                        : rollOutcome === 'NO'
                          ? 'text-red-500 animate-failure-shake'
                          : 'text-yellow-500 animate-warning-pulse'
                  }`}
                >
                  <span
                    className={`inline-block ${
                      rollOutcome === 'YES'
                        ? 'animate-success-glow'
                        : rollOutcome === 'EDGE'
                          ? 'animate-purple-glow'
                          : rollOutcome === 'NO'
                            ? 'animate-failure-glow'
                            : 'animate-holographic'
                    }`}
                  >
                    {rollResult}
                  </span>
                </h2>

                {/* Success celebration particles */}
                {rollOutcome === 'YES' && (
                  <div className="flex justify-center gap-2 mt-4">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-emerald-400 rounded-full animate-success-sparkle"
                        style={{ animationDelay: `${i * 0.1} s`, animationDuration: '0.8s' }}
                      />
                    ))}
                  </div>
                )}

                {/* Edge result celebration particles */}
                {rollOutcome === 'EDGE' && (
                  <div className="flex justify-center gap-2 mt-4">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-purple-400 rounded-full animate-success-sparkle"
                        style={{ animationDelay: `${i * 0.1} s`, animationDuration: '0.8s' }}
                      />
                    ))}
                  </div>
                )}

                {/* Failure effect */}
                {rollOutcome !== 'YES' && (
                  <div className="flex justify-center mt-4">
                    <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10">
                      <span
                        className={`text-sm font-mono inline-block ${rollOutcome === 'NO'
                          ? 'text-red-400 animate-failure-pulse'
                          : 'text-yellow-500 animate-warning-shake'
                          }`}
                      >
                        {rollOutcome === 'LIMIT' || rollOutcome === 'BLOCKED'
                          ? '⚠ SPECIAL CONDITION'
                          : rollOutcome === 'EDGE'
                            ? '🎲 EDGE RESULT'
                            : '✗ REJECTED'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {step === 'MULTIPLE_OFFER' && (
                <div className="p-6 bg-zinc-800/50 rounded-xl border border-white/5 space-y-4 animate-fade-in">
                  <p className="text-xl font-bold text-white">Attempt Multiple?</p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => handleMultiple(true)}
                      className="px-6 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg hover:bg-emerald-500/30 transition-all hover:scale-105"
                    >
                      YES
                    </button>
                    <button
                      onClick={() => handleMultiple(false)}
                      className="px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-all hover:scale-105"
                    >
                      NO
                    </button>
                  </div>
                </div>
              )}

              {multipleResult && (
                <div className="space-y-2 animate-fade-in">
                  <p className="text-zinc-400 text-sm">Multiple Result</p>
                  <p className={`text-3xl font-bold ${multipleResult === 'Yes' ? 'text-emerald-400 animate-pop-in' : 'text-red-500 animate-shake'}`}>{multipleResult}</p>
                  {multipleResult === 'No' && <p className="text-zinc-500 text-sm italic">The Arbiter grants 1 consolation asset.</p>}
                </div>
              )}

              {step === 'MATERIALS_OFFER' && (
                <div className="p-6 bg-zinc-800/50 rounded-xl border border-white/5 space-y-4 animate-fade-in">
                  <p className="text-xl font-bold text-white">Acquire Materials?</p>
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3 bg-black/20 p-2 rounded-lg">
                      <label htmlFor="material-quantity" className="text-zinc-400 text-sm">Quantity:</label>
                      <input
                        id="material-quantity"
                        type="number"
                        min="1"
                        max="50"
                        value={quantity}
                        title="Material Quantity"
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="w-16 bg-transparent border-b border-zinc-500 text-center text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => handleMaterials(true)}
                        className="px-6 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg hover:bg-emerald-500/30 transition-all hover:scale-105"
                      >
                        CONFIRM
                      </button>
                      <button
                        onClick={() => handleMaterials(false)}
                        className="px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-all hover:scale-105"
                      >
                        DECLINE
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 'SHOW_MATERIALS' && materials.length > 0 && (
                <div className="w-full space-y-6 animate-fade-in">
                  <p className={`text-center font-mono text-sm ${supplyTitle.includes('CONSOLATION') ? 'text-yellow-500' : 'text-emerald-400'}`}>{supplyTitle}</p>
                  <div className="flex flex-wrap justify-center gap-4 max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                    {materials.map((m, i) => (
                      <div key={i} className="group relative flex flex-col items-center gap-2 p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300 min-w-[120px] animate-fade-in-up" style={{ animationDelay: `${i * 100} ms` }}>
                        <span className="text-white font-bold text-sm">{m.name}</span>
                        {m.action && m.action !== ItemAction.NONE && (
                          <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">Effect Applied!</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(step === 'ROLLED' || (step === 'SHOW_MATERIALS' && materials.length > 0)) && (
                  <button
                    onClick={() => {
                      setStep('IDLE');
                      setRollResult('');
                      setMaterials([]);
                      setMultipleResult('');
                    }}
                    className="mt-8 text-zinc-500 hover:text-white text-sm underline underline-offset-4 transition-colors"
                  >
                    Reset System
                  </button>
                )}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
};

export default RngTactician;
