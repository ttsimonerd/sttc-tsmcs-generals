import React, { useEffect, useRef, useState } from 'react';
import { AppView } from '../types';
import type { UserRole } from '../types';
import { ICON, PRIMARY_NAV, sectionsFor } from './navigation';
import { cn } from './ui/Primitives';

interface MobileNavProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  isOwner?: boolean;
  userRole?: UserRole;
  hasVipBadge?: boolean;
  onSignOut?: () => void;
}

/** Bottom tab bar + "Menu" sheet. Rendered below `md` only. */
const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onViewChange,
  isOwner,
  userRole,
  hasVipBadge,
  onSignOut,
}) => {
  const [open, setOpen] = useState(false);
  const [dragY, setDragY] = useState(0);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ startY: number; startTime: number } | null>(null);
  const sections = sectionsFor(isOwner);

  const close = () => {
    setDragY(0);
    setOpen(false);
  };

  /* ---- Swipe to dismiss: drag the header down past a threshold ---- */
  const onDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') return;
    dragRef.current = { startY: event.clientY, startTime: Date.now() };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onDragMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const delta = event.clientY - dragRef.current.startY;
    // Upward drags and a scrolled-down sheet belong to the content, not the gesture.
    if (delta <= 0 || (sheetRef.current && sheetRef.current.scrollTop > 0)) {
      setDragY(0);
      return;
    }
    setDragY(delta);
  };

  const onDragEnd = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    const elapsed = Math.max(1, Date.now() - drag.startTime);
    const flicked = dragY > 36 && dragY / elapsed > 0.55;
    if (dragY > 110 || flicked) {
      setDragY(0);
      setOpen(false);
      return;
    }
    setDragY(0);
  };

  const select = (view: AppView) => {
    onViewChange(view);
    close();
  };

  // Lock the page behind the sheet.
  useEffect(() => {
    if (!open) return;
    setDragY(0);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape closes, and the sheet takes focus when it opens.
  useEffect(() => {
    if (!open) return;
    sheetRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  // A view change from anywhere else should not leave the sheet hanging open.
  useEffect(() => {
    setOpen(false);
  }, [currentView]);

  const inPrimary = PRIMARY_NAV.some((item) => item.id === currentView);

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--line)] bg-[#07080b]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        <ul className="grid grid-cols-5">
          {PRIMARY_NAV.map((item) => {
            const active = currentView === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => select(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex h-16 w-full flex-col items-center justify-center gap-1 transition-colors',
                    active ? 'text-theme-primary' : 'text-zinc-500 hover:text-zinc-200'
                  )}
                >
                  {active && (
                    <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-theme-primary" />
                  )}
                  <svg
                    className="h-[20px] w-[20px]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                  </svg>
                  <span className="max-w-full truncate px-1 text-[10px] font-medium leading-none">
                    {item.label.replace('The ', '').replace('Mini games', 'Games')}
                  </span>
                </button>
              </li>
            );
          })}

          <li>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-haspopup="dialog"
              aria-label="Open navigation menu"
              className={cn(
                'relative flex h-16 w-full flex-col items-center justify-center gap-1 transition-colors',
                !inPrimary || open ? 'text-theme-primary' : 'text-zinc-500 hover:text-zinc-200'
              )}
            >
              {(!inPrimary || open) && (
                <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-theme-primary" />
              )}
              <svg className="h-[20px] w-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={ICON.menu} />
              </svg>
              <span className="text-[10px] font-medium leading-none">Menu</span>
            </button>
          </li>
        </ul>
      </nav>

      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={close}
            style={{ opacity: Math.max(0.15, 1 - dragY / 520) }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-150"
          />

          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            tabIndex={-1}
            style={{
              transform: dragY ? `translateY(${dragY}px)` : undefined,
              transition: dragY ? 'none' : 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="animate-sheet-up absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-[color:var(--line-strong)] bg-[#0b0d12] pb-[env(safe-area-inset-bottom)] shadow-2xl outline-none custom-scrollbar"
          >
            <div
              className="sticky top-0 z-10 border-b border-[color:var(--line)] bg-[#0b0d12]/95 backdrop-blur"
              style={{ touchAction: 'none' }}
              onPointerDown={onDragStart}
              onPointerMove={onDragMove}
              onPointerUp={onDragEnd}
              onPointerCancel={onDragEnd}
            >
              <div className="flex justify-center pb-1 pt-2.5">
                <span className="h-1 w-10 rounded-full bg-white/25" aria-hidden="true" />
              </div>
              <div className="flex items-center justify-between px-4 pb-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-theme-primary text-[10px] font-black text-black">
                    T
                  </span>
                  <p className="text-sm font-semibold text-white">Navigation</p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-[color:var(--line)] text-zinc-400 transition-colors hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICON.close} />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-5 px-3 py-4">
              {sections.map((section) => (
                <div key={section.label}>
                  <p className="eyebrow px-2 pb-1.5">{section.label}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {section.items.map((item) => {
                      const active = currentView === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => select(item.id)}
                          aria-current={active ? 'page' : undefined}
                          className={cn(
                            'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all',
                            active
                              ? 'border-theme-primary-soft bg-theme-primary-soft text-white'
                              : 'border-[color:var(--line)] bg-white/[0.02] text-zinc-400 active:bg-white/[0.06]'
                          )}
                        >
                          <svg
                            className={cn('h-[18px] w-[18px] shrink-0', active ? 'text-theme-primary' : 'text-zinc-500')}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                          </svg>
                          <span className="min-w-0 truncate text-[12px] font-medium">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-[color:var(--line)] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">Signed in</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p
                      className={cn(
                        'min-w-0 truncate text-[13px] font-medium',
                        hasVipBadge ? 'text-amber-300' : 'text-zinc-200'
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
                </div>
                <span className="shrink-0 text-[9px] uppercase tracking-[0.16em] text-zinc-700">v2.1</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  close();
                  onSignOut?.();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-red-300 transition-colors active:bg-red-500/20"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={ICON.logout} />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
