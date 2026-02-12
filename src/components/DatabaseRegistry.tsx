import React, { useState, useEffect } from 'react';
import type { ActionLog } from '../types';


const DatabaseRegistry: React.FC = () => {
    const [allLogs, setAllLogs] = useState<ActionLog[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // In a real app, this might come from a central store or backend
        // For now, we'll simulate fetching logs from the current session's history
        // and potentially from a persistent local storage key if we added one.
    }, []);

    const filteredLogs = allLogs.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const clearLogs = () => {
        if (confirm('Are you sure you want to purge the entire registry?')) {
            setAllLogs([]);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Central Registry</h1>
                    <p className="text-zinc-500 text-sm mt-1">Authorized access only: System audit logs</p>
                </div>
                <button
                    onClick={clearLogs}
                    className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all"
                >
                    Purge Records
                </button>
            </div>

            <div className="glass-panel p-6 rounded-2xl border-white/10 space-y-6">
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-theme-primary/50 transition-all"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] border-b border-white/5">
                                <th className="pb-4 pl-2">Timestamp</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4">Description</th>
                                <th className="pb-4 text-right pr-2">Identification</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center text-zinc-600 italic">
                                        No matching records found in database...
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (

                                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                        <td className="py-4 pl-2 font-mono text-xs text-zinc-500">{log.time}</td>
                                        <td className="py-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                                                log.type === 'error' ? 'bg-red-500/10 text-red-400' :
                                                    log.type === 'warning' ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-800 text-zinc-400'
                                                }`}>
                                                {log.type}
                                            </span>
                                        </td>
                                        <td className="py-4 text-zinc-300">{log.message}</td>
                                        <td className="py-4 text-right pr-2 font-mono text-[10px] text-zinc-600 group-hover:text-zinc-400">
                                            {log.id.slice(0, 8)}...
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-panel p-4 rounded-xl border-white/10">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Total Entries</p>
                    <p className="text-xl font-bold text-white mt-1">{allLogs.length}</p>
                </div>
                <div className="glass-panel p-4 rounded-xl border-white/10">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Success Rate</p>
                    <p className="text-xl font-bold text-emerald-400 mt-1">100%</p>
                </div>
                <div className="glass-panel p-4 rounded-xl border-white/10">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Database Uptime</p>
                    <p className="text-xl font-bold text-theme-primary mt-1">99.9%</p>
                </div>
            </div>
        </div>
    );
};

export default DatabaseRegistry;
