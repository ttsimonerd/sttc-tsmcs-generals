import React, { useState, useEffect } from 'react';
import { applyTheme, getSavedTheme, THEME_PRESETS } from '../services/themeService';
import { resetWins } from '../services/rngService';
import { Badge, Button, PageHeader, Panel, cn } from './ui/Primitives';
import { useToast } from './ui/Toast';
import { AUDIT_EVENT, clearAuditLog, getAuditLog, logAudit } from '../services/auditService';
import type { AuditEntry } from '../services/auditService';

const SystemControl: React.FC = () => {
    const { toast } = useToast();
    const [broadcast, setBroadcast] = useState('');
    const [currentTheme, setCurrentTheme] = useState('');
    const [audit, setAudit] = useState<AuditEntry[]>([]);

    useEffect(() => {
        setBroadcast(localStorage.getItem('system-broadcast') || '');
        setCurrentTheme(getSavedTheme());
    }, []);

    // Keep the audit panel current without a reload.
    useEffect(() => {
        const load = () => setAudit(getAuditLog());
        load();
        window.addEventListener(AUDIT_EVENT, load);
        window.addEventListener('focus', load);
        return () => {
            window.removeEventListener(AUDIT_EVENT, load);
            window.removeEventListener('focus', load);
        };
    }, []);

    const updateBroadcast = () => {
        if (broadcast.trim()) {
            localStorage.setItem('system-broadcast', broadcast);
            toast('Global broadcast sent.', 'success');
            logAudit('Updated broadcast', broadcast.trim().slice(0, 60));
        } else {
            localStorage.removeItem('system-broadcast');
            toast('Broadcast cleared.', 'info');
            logAudit('Cleared broadcast');
        }
    };

    const handleThemeChange = (id: string) => {
        applyTheme(id);
        setCurrentTheme(id);
        toast('System theme updated.', 'success');
        logAudit('Changed theme', THEME_PRESETS.find(t => t.id === id)?.name ?? id);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="System"
                title="System control"
                description="Global broadcasts and the ecosystem's visual identity — applied to every screen at once."
            />

            <div className="grid gap-6 lg:grid-cols-2">
                <Panel className="flex flex-col gap-4 p-5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-500/10 text-blue-300">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                </svg>
                            </span>
                            <div>
                                <p className="text-[15px] font-semibold text-white">Broadcast</p>
                                <p className="text-[11px] text-zinc-500">Shown as a strip in every session</p>
                            </div>
                        </div>
                        {broadcast.trim() ? <Badge tone="primary">Live</Badge> : <Badge>Empty</Badge>}
                    </div>

                    <textarea
                        value={broadcast}
                        onChange={(e) => setBroadcast(e.target.value)}
                        placeholder="System announcement…"
                        aria-label="Broadcast message"
                        className="field min-h-[128px] resize-none"
                    />

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button variant="primary" onClick={updateBroadcast} className="flex-1">
                            Update broadcast
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => { setBroadcast(''); localStorage.removeItem('system-broadcast'); toast('Broadcast cleared.', 'info'); logAudit('Cleared broadcast'); }}
                        >
                            Clear
                        </Button>
                    </div>

                    <p className="text-[10px] leading-relaxed text-zinc-600">
                        Leave the field empty and update to remove the strip. Clients pick up changes within a few seconds.
                    </p>
                </Panel>

                <Panel className="flex flex-col gap-4 p-5">
                    <div className="flex items-center gap-2.5">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-300">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                        </span>
                        <div>
                            <p className="text-[15px] font-semibold text-white">Ecosystem theme</p>
                            <p className="text-[11px] text-zinc-500">Drives every accent colour in the app</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {THEME_PRESETS.map(theme => {
                            const active = currentTheme === theme.id;
                            return (
                                <button
                                    key={theme.id}
                                    type="button"
                                    onClick={() => handleThemeChange(theme.id)}
                                    aria-pressed={active}
                                    className={cn(
                                        'flex items-center gap-3 rounded-xl border p-3 text-left transition-all',
                                        active
                                            ? 'border-theme-primary-soft bg-theme-primary-soft'
                                            : 'border-[color:var(--line)] bg-black/25 hover:border-[color:var(--line-strong)]'
                                    )}
                                >
                                    <span
                                        className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg"
                                        style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
                                    >
                                        <span className="text-[9px] font-bold text-black/40">ABC</span>
                                    </span>
                                    <span className="min-w-0">
                                        <span className={cn('block truncate text-[12px] font-semibold', active ? 'text-white' : 'text-zinc-300')}>
                                            {theme.name}
                                        </span>
                                        <span className="mt-1 flex gap-1">
                                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.primary }} />
                                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.accent }} />
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <p className="mt-auto text-[10px] leading-relaxed text-zinc-600">
                        Themes swap CSS variables at the root, so open screens recolour without a reload.
                    </p>
                </Panel>
            </div>

            <Panel tone="danger" className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="text-[15px] font-semibold text-red-300">Reset win counter</p>
                            <Badge tone="danger">Destructive</Badge>
                        </div>
                        <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-zinc-500">
                            Sets the daily win counter back to zero for the current account. Existing supply drops are not restored.
                        </p>
                    </div>
                    <Button
                        variant="danger"
                        className="shrink-0"
                        onClick={() => {
                            if (confirm('Reset the daily/weekly win progress to 0?')) {
                                resetWins();
                                toast('Win counter reset.', 'success');
                                logAudit('Reset win counter');
                            }
                        }}
                    >
                        Reset wins
                    </Button>
                </div>
            </Panel>

            <Panel className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="eyebrow">Audit log</p>
                        <p className="mt-1 text-xs text-zinc-500">Recent admin changes, newest first.</p>
                    </div>
                    {audit.length > 0 && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { clearAuditLog(); toast('Audit log cleared.', 'info'); }}
                        >
                            Clear
                        </Button>
                    )}
                </div>

                <div className="mt-3 max-h-64 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
                    {audit.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-[color:var(--line)] px-3 py-6 text-center text-xs text-zinc-600">
                            No admin changes recorded yet.
                        </p>
                    ) : (
                        audit.slice(0, 20).map(entry => (
                            <div
                                key={entry.id}
                                className="flex items-start gap-2.5 rounded-lg border border-[color:var(--line)] bg-black/25 px-3 py-2"
                            >
                                <span className="mt-0.5 shrink-0 font-mono text-[10px] text-zinc-600">
                                    {new Date(entry.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[12px] text-zinc-200">{entry.action}</p>
                                    {entry.detail && <p className="truncate text-[10px] text-zinc-600">{entry.detail}</p>}
                                </div>
                                <span className="shrink-0 rounded-full border border-[color:var(--line)] px-1.5 py-0.5 text-[9px] text-zinc-500">
                                    {entry.actor}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </Panel>
        </div>
    );
};

export default SystemControl;
