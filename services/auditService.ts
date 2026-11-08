import { getCurrentUser } from './pointsService';

export interface AuditEntry {
  id: string;
  at: number;
  actor: string;
  action: string;
  detail?: string;
}

const STORAGE_KEY = 'admin_audit_log';
const MAX_ENTRIES = 100;

/** Dispatched on the window after any write so open panels can refresh. */
export const AUDIT_EVENT = 'audit-log-updated';

const read = (): AuditEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AuditEntry[]) : [];
  } catch {
    return [];
  }
};

/** Newest first. */
export const getAuditLog = (): AuditEntry[] => read();

export const logAudit = (action: string, detail?: string): void => {
  try {
    const entry: AuditEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      at: Date.now(),
      actor: getCurrentUser(),
      action,
      detail: detail?.trim() || undefined,
    };

    const next = [entry, ...read()].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(AUDIT_EVENT));
  } catch {
    // Auditing must never block or break the change it is recording.
  }
};

export const clearAuditLog = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(AUDIT_EVENT));
  } catch {
    // ignore
  }
};
