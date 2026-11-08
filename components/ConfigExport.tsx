import React, { useState } from 'react';
import { exportMasterConfig, importMasterConfig, deepResetSystem } from '../services/configExportService';
import { Badge, Button, PageHeader, Panel } from './ui/Primitives';
import { useToast } from './ui/Toast';
import { logAudit } from '../services/auditService';

const ConfigExport: React.FC = () => {
    const { toast } = useToast();
    const [isImporting, setIsImporting] = useState(false);

    const handleExport = () => {
        exportMasterConfig();
        toast('Master configuration exported.', 'success');
        logAudit('Exported configuration');
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (confirm('Importing this file will overwrite all current system settings. Continue?')) {
            setIsImporting(true);
            const success = await importMasterConfig(file);
            setIsImporting(false);

            if (success) {
                toast('Configuration applied. Reloading…', 'success');
                logAudit('Imported configuration', file.name);
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast('Invalid configuration file.', 'error');
            }
        }
    };

    const handleDeepReset = () => {
        if (confirm('CRITICAL ACTION: This will wipe ALL custom data and restore factory defaults. Are you absolutely sure?')) {
            deepResetSystem();
            logAudit('Deep system reset');
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="System"
                title="Project solidifier"
                description="Snapshot the whole ecosystem — materials, riddles, game settings and access phrases — into one file, or restore a previous snapshot."
            />

            <div className="grid gap-6 md:grid-cols-2">
                <Panel className="flex flex-col gap-5 p-6">
                    <div className="flex items-start justify-between gap-3">
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/10 text-emerald-300">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </span>
                        <Badge>JSON</Badge>
                    </div>

                    <div>
                        <p className="text-[15px] font-semibold text-white">Save definitive state</p>
                        <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                            Downloads every customisable value currently stored by this instance.
                        </p>
                    </div>

                    <Button variant="primary" onClick={handleExport} className="mt-auto w-full">
                        Export as JSON
                    </Button>
                </Panel>

                <Panel className="flex flex-col gap-5 p-6">
                    <div className="flex items-start justify-between gap-3">
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-500/10 text-blue-300">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </span>
                        <Badge>Overwrites</Badge>
                    </div>

                    <div>
                        <p className="text-[15px] font-semibold text-white">Restore snapshot</p>
                        <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                            Applies a previously exported file and reloads the instance.
                        </p>
                    </div>

                    <label
                        className={
                            'mt-auto inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[color:var(--line-strong)] bg-white/[0.06] text-sm font-semibold text-zinc-100 transition-all hover:bg-white/[0.1] ' +
                            (isImporting ? 'pointer-events-none opacity-40' : '')
                        }
                    >
                        {isImporting ? 'Processing…' : 'Upload snapshot'}
                        <input type="file" accept=".json" onChange={handleFileChange} className="hidden" disabled={isImporting} />
                    </label>
                </Panel>
            </div>

            <Panel tone="danger" className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="text-[15px] font-semibold text-red-300">Ecosystem reset</p>
                            <Badge tone="danger">Irreversible</Badge>
                        </div>
                        <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-zinc-500">
                            Wipes every custom value and returns the instance to factory defaults. Export first if you may want it back.
                        </p>
                    </div>
                    <Button variant="danger" className="shrink-0" onClick={handleDeepReset}>
                        Deep system reset
                    </Button>
                </div>
            </Panel>
        </div>
    );
};

export default ConfigExport;
