import React, { useState, useEffect } from 'react';
import { getRiddles, saveRiddles, resetRiddles } from '../services/riddleService';
import type { RiddleResponse } from '../types';
import { Badge, Button, EmptyState, PageHeader, Panel, Stat } from './ui/Primitives';
import { useToast } from './ui/Toast';
import { logAudit } from '../services/auditService';

const RiddleEditor: React.FC = () => {
    const { toast } = useToast();
    const [riddles, setRiddles] = useState<RiddleResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newRiddle, setNewRiddle] = useState({ question: '', answer: '' });

    useEffect(() => {
        setRiddles(getRiddles());
    }, []);

    const handleAdd = () => {
        if (!newRiddle.question.trim() || !newRiddle.answer.trim()) return;
        const updated = [{ ...newRiddle, question: newRiddle.question.trim(), answer: newRiddle.answer.trim() }, ...riddles];
        saveRiddles(updated);
        setRiddles(updated);
        setNewRiddle({ question: '', answer: '' });
        toast('Riddle added to the pool.', 'success');
        logAudit('Added riddle', newRiddle.question.trim().slice(0, 70));
    };

    const handleDelete = (question: string) => {
        if (confirm('Delete this challenge?')) {
            const updated = riddles.filter(r => r.question !== question);
            saveRiddles(updated);
            setRiddles(updated);
            toast('Riddle removed.', 'info');
            logAudit('Removed riddle', question.slice(0, 70));
        }
    };

    const handleReset = () => {
        if (confirm('Reset to the authentic riddle pool?')) {
            resetRiddles();
            setRiddles(getRiddles());
            toast('Riddles reset to defaults.', 'info');
            logAudit('Reset riddle pool');
        }
    };

    const filteredRiddles = riddles.filter(r =>
        r.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Configure"
                title="Riddles"
                description="Challenges served to players who hit the win limit. A correct answer resets their run."
                actions={<Button variant="secondary" onClick={handleReset}>Reset defaults</Button>}
            />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
                <div className="space-y-6">
                    <Panel tone="accent" className="space-y-4 p-5">
                        <div>
                            <p className="eyebrow">New challenge</p>
                            <p className="mt-1 text-xs text-zinc-500">Added to the top of the pool.</p>
                        </div>

                        <div>
                            <label className="field-label" htmlFor="riddle-question">Question</label>
                            <textarea
                                id="riddle-question"
                                value={newRiddle.question}
                                onChange={(e) => setNewRiddle(prev => ({ ...prev, question: e.target.value }))}
                                placeholder="The riddle text…"
                                className="field min-h-[104px] resize-none"
                            />
                        </div>

                        <div>
                            <label className="field-label" htmlFor="riddle-answer">Correct answer</label>
                            <input
                                id="riddle-answer"
                                type="text"
                                value={newRiddle.answer}
                                onChange={(e) => setNewRiddle(prev => ({ ...prev, answer: e.target.value }))}
                                placeholder="Expected answer…"
                                className="field"
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            />
                        </div>

                        <Button
                            variant="primary"
                            onClick={handleAdd}
                            disabled={!newRiddle.question.trim() || !newRiddle.answer.trim()}
                            className="w-full"
                        >
                            Add riddle
                        </Button>
                    </Panel>

                    <Panel className="space-y-3 p-5">
                        <p className="eyebrow">Pool</p>
                        <Stat label="Challenges" value={riddles.length} />
                        <p className="text-[10px] leading-relaxed text-zinc-600">
                            One is picked at random each time a player reaches the limit. Answer matching ignores surrounding whitespace.
                        </p>
                    </Panel>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="relative flex-1">
                            <svg
                                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="search"
                                placeholder="Filter by question or answer…"
                                aria-label="Filter riddles"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="field pl-10"
                            />
                        </div>
                        <Badge>{filteredRiddles.length} shown</Badge>
                    </div>

                    <div className="max-h-[720px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                        {filteredRiddles.length === 0 ? (
                            <EmptyState
                                title={riddles.length === 0 ? 'No riddles yet' : 'Nothing matches that filter'}
                                description={
                                    riddles.length === 0
                                        ? 'Add the first challenge on the left and it becomes available immediately.'
                                        : 'Try a different word, or clear the search field.'
                                }
                            />
                        ) : (
                            filteredRiddles.map((r) => (
                                <Panel key={r.question} className="group p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <div className="flex items-start gap-2.5">
                                                <span className="mt-0.5 shrink-0 font-mono text-[11px] text-zinc-600">
                                                    {String(riddles.indexOf(r) + 1).padStart(2, '0')}
                                                </span>
                                                <p className="text-[13px] leading-relaxed text-zinc-100">{r.question}</p>
                                            </div>
                                            <div className="pl-7">
                                                <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.08] px-2.5 py-1">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400/70">Answer</span>
                                                    <span className="font-mono text-xs text-emerald-300">{r.answer}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(r.question)}
                                            title="Delete riddle"
                                            aria-label={`Delete riddle ${riddles.indexOf(r) + 1}`}
                                            className="shrink-0 rounded-lg border border-transparent p-2 text-zinc-600 transition-colors hover:border-red-500/25 hover:bg-red-500/10 hover:text-red-300 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </Panel>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiddleEditor;
