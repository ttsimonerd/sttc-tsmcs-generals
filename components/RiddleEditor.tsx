import React, { useState, useEffect } from 'react';
import { getRiddles, saveRiddles, resetRiddles } from '../services/riddleService';
import { RiddleResponse } from '../types';

const RiddleEditor: React.FC = () => {
    const [riddles, setRiddles] = useState<RiddleResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newRiddle, setNewRiddle] = useState({ question: '', answer: '' });
    const [notification, setNotification] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        setRiddles(getRiddles());
    }, []);

    const showNotif = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAdd = () => {
        if (!newRiddle.question.trim() || !newRiddle.answer.trim()) return;
        const updated = [newRiddle, ...riddles];
        saveRiddles(updated);
        setRiddles(updated);
        setNewRiddle({ question: '', answer: '' });
        showNotif('New riddle added! 🧩');
    };

    const handleDelete = (question: string) => {
        if (confirm('Delete this challenge?')) {
            const updated = riddles.filter(r => r.question !== question);
            saveRiddles(updated);
            setRiddles(updated);
            showNotif('Challenge removed.');
        }
    };

    const handleReset = () => {
        if (confirm('Reset to the authentic riddle pool?')) {
            resetRiddles();
            setRiddles(getRiddles());
            showNotif('Riddles reset to defaults.');
        }
    };

    const filteredRiddles = riddles.filter(r =>
        r.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Riddle Editor</h1>
                    <p className="text-zinc-500 text-sm mt-1">Manage Redeemer challenges used for resetting the win limit</p>
                </div>
                <div className="flex gap-2">
                    {notification && (
                        <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg animate-fade-in">
                            <span className="text-emerald-400 text-sm">{notification}</span>
                        </div>
                    )}
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm hover:bg-red-500/20 transition-all font-medium"
                    >
                        Reset Defaults
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Creator */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-6 rounded-2xl border border-blue-500/30 space-y-4">
                        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest">Create Challenge</h2>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-1">Question / Riddle</label>
                                <textarea
                                    value={newRiddle.question}
                                    onChange={(e) => setNewRiddle(prev => ({ ...prev, question: e.target.value }))}
                                    placeholder="The riddle text..."
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 min-h-[100px] resize-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-1">Correct Answer</label>
                                <input
                                    type="text"
                                    value={newRiddle.answer}
                                    onChange={(e) => setNewRiddle(prev => ({ ...prev, answer: e.target.value }))}
                                    placeholder="Expected answer..."
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                />
                            </div>
                            <button
                                onClick={handleAdd}
                                disabled={!newRiddle.question.trim() || !newRiddle.answer.trim()}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                            >
                                + ADD RIDDLE
                            </button>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-white/10">
                        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Challenge Stats</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-400">Total Riddles:</span>
                                <span className="text-white font-mono font-bold">{riddles.length}</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 mt-4 italic leading-relaxed">
                                Riddles are shown randomly to users who reach the 3-win limit. Successfully answering a riddle resets their session.
                            </p>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Filter riddles by text or answer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono text-sm"
                        />
                    </div>

                    <div className="space-y-3 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">
                        {filteredRiddles.length === 0 ? (
                            <div className="glass-panel p-12 text-center text-zinc-500 border border-white/5 rounded-2xl">
                                No matching riddles found.
                            </div>
                        ) : (
                            filteredRiddles.map((r, i) => (
                                <div key={r.question} className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all group relative overflow-hidden">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-3 flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-mono text-zinc-600">#{riddles.indexOf(r) + 1}</span>
                                                <h3 className="text-white font-medium leading-relaxed">{r.question}</h3>
                                            </div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                                <span className="text-[10px] font-bold text-emerald-500 uppercase">Answer:</span>
                                                <span className="text-sm text-emerald-400 font-mono">{r.answer}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(r.question)}
                                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiddleEditor;
