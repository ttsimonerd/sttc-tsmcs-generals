import React from 'react';

export const cn = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(' ');

/* ------------------------------------------------------------------ Panel */

type PanelTone = 'default' | 'accent' | 'danger' | 'muted';

export const Panel: React.FC<{
  children: React.ReactNode;
  className?: string;
  tone?: PanelTone;
}> = ({ children, className, tone = 'default' }) => (
  <section
    className={cn(
      'panel',
      tone === 'accent' && 'panel-accent',
      tone === 'danger' && 'panel-danger',
      tone === 'muted' && 'panel-muted',
      className
    )}
  >
    {children}
  </section>
);

/* ------------------------------------------------------------- PageHeader */

export const PageHeader: React.FC<{
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}> = ({ eyebrow, title, description, actions, className }) => (
  <header className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
    <div className="min-w-0 space-y-2">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-white sm:text-[30px]">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">{description}</p>
      ) : null}
    </div>
    {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
  </header>
);

/* ----------------------------------------------------------------- Button */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-theme-primary text-black border border-transparent hover:brightness-110 shadow-[0_14px_30px_-16px_rgba(var(--color-primary-rgb),0.9)]',
  secondary:
    'bg-white/[0.06] text-zinc-100 border border-[color:var(--line-strong)] hover:bg-white/[0.1]',
  ghost:
    'bg-transparent text-zinc-400 border border-transparent hover:bg-white/[0.06] hover:text-white',
  danger:
    'bg-red-500/10 text-red-300 border border-red-500/25 hover:bg-red-500/20',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-sm',
};

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }
> = ({ variant = 'secondary', size = 'md', className, children, ...rest }) => (
  <button
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40',
      BUTTON_VARIANTS[variant],
      BUTTON_SIZES[size],
      className
    )}
    {...rest}
  >
    {children}
  </button>
);

/* ------------------------------------------------------------------- Stat */

type StatTone = 'default' | 'primary' | 'danger' | 'warning';

const STAT_TONES: Record<StatTone, string> = {
  default: 'text-white',
  primary: 'text-theme-primary',
  danger: 'text-red-400',
  warning: 'text-amber-400',
};

export const Stat: React.FC<{
  label: string;
  value: React.ReactNode;
  tone?: StatTone;
  hint?: string;
  className?: string;
}> = ({ label, value, tone = 'default', hint, className }) => (
  <div className={cn('rounded-xl border border-[color:var(--line)] bg-black/25 px-3 py-2.5', className)}>
    <p className="eyebrow">{label}</p>
    <p className={cn('stat-value mt-1', STAT_TONES[tone])}>{value}</p>
    {hint ? <p className="mt-0.5 text-[11px] text-zinc-500">{hint}</p> : null}
  </div>
);

/* ------------------------------------------------------------------ Badge */

type BadgeTone = 'default' | 'primary' | 'danger' | 'warning';

const BADGE_TONES: Record<BadgeTone, string> = {
  default: 'border-[color:var(--line)] bg-white/[0.04] text-zinc-400',
  primary: 'border-theme-primary-soft bg-theme-primary-soft text-theme-primary',
  danger: 'border-red-500/30 bg-red-500/10 text-red-300',
  warning: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
};

export const Badge: React.FC<{
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}> = ({ children, tone = 'default', className }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
      BADGE_TONES[tone],
      className
    )}
  >
    {children}
  </span>
);

/* ------------------------------------------------------------- EmptyState */

export const EmptyState: React.FC<{
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ title, description, action, icon }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[color:var(--line)] bg-white/[0.015] px-6 py-14 text-center">
    <div className="grid h-12 w-12 place-items-center rounded-xl border border-[color:var(--line)] bg-black/30 text-zinc-600">
      {icon ?? (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-sm font-semibold text-zinc-300">{title}</p>
      {description ? <p className="mx-auto max-w-sm text-xs leading-relaxed text-zinc-500">{description}</p> : null}
    </div>
    {action}
  </div>
);
