import React from 'react';
import { AppView } from '../types';
import type { UserRole } from '../types';
import { ICON, sectionsFor } from './navigation';
import { cn } from './ui/Primitives';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  isOwner?: boolean;
  userRole?: UserRole;
  hasVipBadge?: boolean;
  onSignOut?: () => void;
}

/** Desktop navigation. Hidden below `md`, where `MobileNav` takes over. */
const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  isOwner,
  userRole,
  hasVipBadge,
  onSignOut,
}) => {
  const sections = sectionsFor(isOwner);

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-[248px] flex-col border-r border-[color:var(--line)] bg-[#08090d]/90 backdrop-blur-xl md:flex">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-[color:var(--line)] px-3.5">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-theme-primary text-[13px] font-black text-black">
          T
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold leading-none text-white">TSmc</p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.22em] text-zinc-500">Generals</p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4 custom-scrollbar">
        {sections.map((section) => (
          <div key={section.label} className="space-y-1">
            <p className="eyebrow px-3 pb-1">{section.label}</p>
            {section.items.map((item) => {
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={item.label}
                  onClick={() => onViewChange(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-200',
                    active
                      ? 'border-theme-primary-soft bg-theme-primary-soft text-white'
                      : 'border-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                  )}
                >
                  <svg
                    className={cn(
                      'h-[18px] w-[18px] shrink-0 transition-colors',
                      active ? 'text-theme-primary' : 'text-zinc-500 group-hover:text-zinc-200'
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                  </svg>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{item.label}</span>
                  {active && <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-theme-primary" />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-[color:var(--line)] p-2.5">
        <div className="rounded-lg px-2 py-1">
          <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">Signed in</p>
          <div className="mt-1 flex items-center gap-2">
            <p
              className={cn(
                'min-w-0 truncate text-[12px] font-medium',
                hasVipBadge ? 'text-amber-300' : 'text-zinc-300'
              )}
            >
              {userRole}
            </p>
            {hasVipBadge && (
              <span className="shrink-0 rounded-full border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-300">
                VIP
              </span>
            )}
          </div>
          <p className="mt-2 text-[9px] uppercase tracking-[0.16em] text-zinc-700">Ph-Manager v2.1</p>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          title="Sign out"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[color:var(--line)] px-2 py-2 text-zinc-500 transition-all hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-300"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={ICON.logout} />
          </svg>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
