import React, { useCallback, useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import { viewMeta } from './components/navigation';
import RngTactician from './components/RngTactician';
import ProbabilityConfig from './components/ProbabilityConfig';
import MiniGames from './components/MiniGames';
import PunishmentWheel from './components/PunishmentWheel';
import Shop from './components/Shop';
import VipSupplies from './components/VipSupplies';
import CrashGame from './components/CrashGame';
import Minesweeper from './components/Minesweeper';
import SlotMachine from './components/SlotMachine';
import MaterialRegistry from './components/MaterialRegistry';
import UserManagement from './components/UserManagement';
import RiddleEditor from './components/RiddleEditor';
import GameTuner from './components/GameTuner';
import SystemControl from './components/SystemControl';
import ConfigExport from './components/ConfigExport';
import Inventory from './components/Inventory';
import { AppView } from './types';
import type { UserRole } from './types';
import { getPoints, hasVipBadge, setCurrentUser } from './services/pointsService';
import { applyTheme, getSavedTheme } from './services/themeService';
import { Button, cn, Panel } from './components/ui/Primitives';
import { ToastProvider, useToast } from './components/ui/Toast';

// Default credentials. Overridable per-user from the Users panel.
const DEFAULT_USER_CREDENTIALS: Record<UserRole, string> = {
  'Owner': 'goonmaster67',
  'Gooner 💔🥀': 'goontime67',
  'Migueeeel [Beta Tester]': 'Betamiguel1',
};

const USER_ROLES: UserRole[] = ['Owner', 'Gooner 💔🥀', 'Migueeeel [Beta Tester]'];

const SESSION_KEY = 'session-authenticated';

const getCredentials = (): Record<UserRole, string> => {
  try {
    const stored = localStorage.getItem('custom-user-passwords');
    return stored ? { ...DEFAULT_USER_CREDENTIALS, ...JSON.parse(stored) } : DEFAULT_USER_CREDENTIALS;
  } catch {
    return DEFAULT_USER_CREDENTIALS;
  }
};

/** Read a previous session during the first render, so a returning user never sees the
 *  login screen flash before the shell mounts. */
const restoreSession = (): { loggedIn: boolean; role: UserRole } => {
  try {
    const savedSession = localStorage.getItem(SESSION_KEY) === 'true';
    const savedUser = localStorage.getItem('current-user');
    if (savedSession && savedUser && USER_ROLES.includes(savedUser as UserRole)) {
      return { loggedIn: true, role: savedUser as UserRole };
    }
  } catch {
    // A blocked/corrupt store just means no session.
  }
  return { loggedIn: false, role: 'Owner' };
};

const AppShell: React.FC = () => {
  const { toast } = useToast();

  const [initialSession] = useState(restoreSession);
  const [isLoggedIn, setIsLoggedIn] = useState(initialSession.loggedIn);
  const [userRole, setUserRole] = useState<UserRole>(initialSession.role);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState<AppView>(AppView.RNG_TACTICIAN);
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Punishment redirection state
  const [punishmentRedirection, setPunishmentRedirection] = useState<{
    active: boolean;
    supply: string;
  } | null>(null);

  const [points, setPoints] = useState(0);
  const [vip, setVip] = useState(false);

  const refreshStatus = useCallback(() => {
    setPoints(getPoints());
    setVip(hasVipBadge());
  }, []);

  useEffect(() => {
    applyTheme(getSavedTheme());
  }, []);

  // Broadcast polling
  useEffect(() => {
    const check = () => {
      const message = localStorage.getItem('system-broadcast');
      setBroadcastMessage((prev) => (message === prev ? prev : message || null));
    };
    check();
    const id = window.setInterval(check, 2500);
    return () => window.clearInterval(id);
  }, []);

  // Keep the balance chip in sync with the economy
  useEffect(() => {
    refreshStatus();
    const handler = () => refreshStatus();
    window.addEventListener('points-updated', handler);
    window.addEventListener('focus', handler);
    return () => {
      window.removeEventListener('points-updated', handler);
      window.removeEventListener('focus', handler);
    };
  }, [refreshStatus, currentView, isLoggedIn]);

  // New views start at the top — on mobile the old scroll position is otherwise kept.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentView]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const credentials = getCredentials();

    if (password === credentials[userRole]) {
      setCurrentUser(userRole);
      localStorage.setItem(SESSION_KEY, 'true');
      setIsLoggedIn(true);
      setError('');
      setPassword('');
      refreshStatus();
      toast(`Welcome back, ${userRole}.`, 'success');
    } else {
      setError('Wrong key phrase. Access denied.');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('current-user');
    setIsLoggedIn(false);
    setMenuOpen(false);
    setPassword('');
    setCurrentView(AppView.RNG_TACTICIAN);
    setPunishmentRedirection(null);
    setPoints(0);
    setVip(false);
    toast('Signed out.', 'info');
  };

  const renderView = () => {
    const redirectionHandler = (supply: string) => {
      setPunishmentRedirection({ active: true, supply });
      setCurrentView(AppView.PUNISHMENT_WHEEL);
    };

    const ownerOnly = (component: React.ReactNode) =>
      userRole === 'Owner' ? component : <RngTactician onRedirectionTriggered={redirectionHandler} />;

    switch (currentView) {
      case AppView.RNG_TACTICIAN:
        return <RngTactician onRedirectionTriggered={redirectionHandler} />;
      case AppView.PROBABILITIES:
        return ownerOnly(<ProbabilityConfig />);
      case AppView.INVENTORY:
        return <Inventory />;
      case AppView.MINI_GAMES:
        return <MiniGames onSelectGame={(game) => setCurrentView(game)} />;
      case AppView.CRASH_GAME:
        return <CrashGame />;
      case AppView.MINESWEEPER:
        return <Minesweeper />;
      case AppView.SLOT_MACHINE:
        return <SlotMachine />;
      case AppView.PUNISHMENT_WHEEL:
        return (
          <PunishmentWheel
            isOwner={userRole === 'Owner'}
            forcedSupply={punishmentRedirection?.active ? punishmentRedirection.supply : undefined}
            onComplete={() => {
              setPunishmentRedirection(null);
              setCurrentView(AppView.RNG_TACTICIAN);
            }}
          />
        );
      case AppView.SHOP:
        return <Shop isOwner={userRole === 'Owner'} />;
      case AppView.VIP_SUPPLIES:
        return ownerOnly(<VipSupplies />);
      case AppView.MATERIAL_REGISTRY:
        return ownerOnly(<MaterialRegistry />);
      case AppView.USER_MANAGEMENT:
        return ownerOnly(<UserManagement />);
      case AppView.RIDDLE_EDITOR:
        return ownerOnly(<RiddleEditor />);
      case AppView.GAME_TUNER:
        return ownerOnly(<GameTuner />);
      case AppView.SYSTEM_CONTROL:
        return ownerOnly(<SystemControl />);
      case AppView.CONFIG_EXPORT:
        return ownerOnly(<ConfigExport />);
      default:
        return <RngTactician onRedirectionTriggered={redirectionHandler} />;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="app-bg" aria-hidden="true" />

        <div className="w-full max-w-[420px]">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-theme-primary text-sm font-black text-black">
              T
            </div>
            <div>
              <p className="text-sm font-semibold leading-none text-white">TSmc's Generals</p>
              <p className="mt-1.5 text-[10px] uppercase tracking-[0.22em] text-zinc-500">Operations deck</p>
            </div>
          </div>

          <Panel className="p-6 sm:p-7">
            <h1 className="text-xl font-semibold tracking-tight text-white">System access</h1>
            <p className="mt-1 text-sm text-zinc-400">Identify yourself to open the deck.</p>

            <form onSubmit={handleLogin} className="mt-6 space-y-5">
              <div>
                <p className="eyebrow">Account</p>
                <div className="mt-2 grid gap-2">
                  {USER_ROLES.map((role) => {
                    const selected = userRole === role;
                    return (
                      <button
                        type="button"
                        key={role}
                        onClick={() => setUserRole(role)}
                        className={cn(
                          'flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all',
                          selected
                            ? 'border-theme-primary-soft bg-theme-primary-soft text-white'
                            : 'border-[color:var(--line)] bg-white/[0.02] text-zinc-400 hover:border-[color:var(--line-strong)] hover:text-white'
                        )}
                      >
                        <span className="min-w-0 truncate">{role}</span>
                        <span
                          className={cn(
                            'h-2 w-2 shrink-0 rounded-full',
                            selected ? 'bg-theme-primary' : 'bg-zinc-700'
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="passphrase" className="eyebrow">
                  Key phrase
                </label>
                <input
                  id="passphrase"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="mt-2 h-11 w-full rounded-xl border border-[color:var(--line)] bg-black/30 px-3 text-sm text-white transition-colors placeholder:text-zinc-600 focus:border-theme-primary-soft focus:outline-none"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300">
                  {error}
                </p>
              )}

              <Button type="submit" variant="primary" size="lg" className="w-full">
                Enter system
              </Button>
            </form>
          </Panel>

          <p className="mt-4 text-center text-[11px] text-zinc-600">
            Static build · everything lives in this browser
          </p>
        </div>
      </div>
    );
  }

  const forced = Boolean(punishmentRedirection?.active);
  const meta = viewMeta(currentView);

  return (
    <div className="min-h-screen">
      <div className="app-bg" aria-hidden="true" />

      {!forced && (
        <>
          <Sidebar
            currentView={currentView}
            onViewChange={setCurrentView}
            isOwner={userRole === 'Owner'}
            userRole={userRole}
            hasVipBadge={vip}
            onSignOut={handleSignOut}
          />
          <MobileNav
            currentView={currentView}
            onViewChange={setCurrentView}
            isOwner={userRole === 'Owner'}
            userRole={userRole}
            hasVipBadge={vip}
            onSignOut={handleSignOut}
          />
        </>
      )}

      <div
        className={cn(
          'flex min-h-screen flex-col transition-[padding] duration-300',
          !forced && 'md:pl-[248px]'
        )}
      >
        {!forced && (
          <header className="sticky top-0 z-40 border-b border-[color:var(--line)] bg-[#07080b]/80 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
              <div className="hidden min-w-0 md:block">
                <p className="truncate text-[10px] uppercase tracking-[0.2em] text-zinc-600">{meta.section}</p>
                <p className="mt-0.5 truncate text-sm font-semibold text-white">{meta.label}</p>
              </div>

              <div className="ml-auto flex shrink-0 items-center gap-2">
                <div className="chip">
                  <span className="text-zinc-500">SP</span>
                  <span className="tabular-nums font-bold text-white">{points}</span>
                </div>

                {vip && (
                  <span className="hidden rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 sm:inline-flex">
                    VIP
                  </span>
                )}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-expanded={menuOpen}
                    aria-haspopup="true"
                    className="flex h-9 items-center gap-2 rounded-xl border border-[color:var(--line)] bg-white/[0.03] px-2.5 text-[12px] font-medium text-zinc-300 transition-colors hover:border-[color:var(--line-strong)] hover:text-white"
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-md bg-white/[0.07] text-[10px] font-bold text-zinc-300">
                      {userRole.slice(0, 1)}
                    </span>
                    <span className="hidden max-w-[140px] truncate sm:block">{userRole}</span>
                    <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {menuOpen && (
                    <>
                      <button
                        type="button"
                        aria-label="Close menu"
                        onClick={() => setMenuOpen(false)}
                        className="fixed inset-0 z-40 cursor-default"
                      />
                      <div className="panel absolute right-0 top-full z-50 mt-2 w-56 p-1.5 shadow-2xl">
                        <div className="px-3 py-2">
                          <p className="eyebrow">Signed in as</p>
                          <p className="mt-1 truncate text-sm font-medium text-white">{userRole}</p>
                        </div>
                        <div className="hairline my-1" />
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-300 transition-colors hover:bg-red-500/10"
                        >
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {broadcastMessage && (
              <div className="border-t border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-2 sm:px-6 lg:px-10">
                <p className="text-[12px] text-emerald-200">
                  <span className="mr-2 font-semibold uppercase tracking-wider text-emerald-400">Broadcast</span>
                  {broadcastMessage}
                </p>
              </div>
            )}
          </header>
        )}

        <main
          className={cn(
            'mx-auto w-full flex-1',
            forced
              ? 'max-w-[1200px] px-4 py-8'
              : 'max-w-[1500px] px-4 pt-6 pb-28 sm:px-6 md:pb-9 lg:px-10 lg:pt-9'
          )}
        >
          <div key={currentView} className="fade-in-up">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <ToastProvider>
    <AppShell />
  </ToastProvider>
);

export default App;
