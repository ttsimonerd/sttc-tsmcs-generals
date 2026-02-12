import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import RngTactician from './components/RngTactician';
import DatabaseRegistry from './components/DatabaseRegistry';
import ProbabilityConfig from './components/ProbabilityConfig';
import MiniGames from './components/MiniGames';
import ThemeCustomizer from './components/ThemeCustomizer';
import PunishmentWheel from './components/PunishmentWheel';
import Shop from './components/Shop';
import VipSupplies from './components/VipSupplies';
import CrashGame from './components/CrashGame';
import Minesweeper from './components/Minesweeper';
import SlotMachine from './components/SlotMachine';
import { AppView, UserRole } from './types';
import { hasVipBadge, setCurrentUser } from './services/pointsService';

// User credentials configuration
const USER_CREDENTIALS: Record<UserRole, string> = {
  'Owner': 'goonmaster67',
  'Gooner 💔🥀': 'goontime67',
  'Migueeeel [Beta Tester]': 'Betamiguel1',
};

// Simple theme application function
const applyTheme = (themeId: string) => {
  // This will be handled by ThemeCustomizer component
  // Just ensure the theme is loaded from localStorage
  const savedTheme = localStorage.getItem('app-theme');
  if (savedTheme) {
    // Theme will be applied by ThemeCustomizer when it mounts
  }
};


const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('Owner');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState<AppView>(AppView.RNG_TACTICIAN);

  // Apply saved theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      applyTheme(savedTheme);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const expectedPassword = USER_CREDENTIALS[userRole];
    if (password === expectedPassword) {
      setCurrentUser(userRole); // Set the current user for user-specific data
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Wrong password! 💔🥀');
    }
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.RNG_TACTICIAN:
        return <RngTactician />;
      case AppView.DATABASE:
        return userRole === 'Owner' ? <DatabaseRegistry /> : <RngTactician />;
      case AppView.PROBABILITIES:
        return userRole === 'Owner' ? <ProbabilityConfig /> : <RngTactician />;
      case AppView.MINI_GAMES:
        return <MiniGames onSelectGame={(game) => setCurrentView(game)} />;
      case AppView.CRASH_GAME:
        return <CrashGame />;
      case AppView.MINESWEEPER:
        return <Minesweeper />;
      case AppView.SLOT_MACHINE:
        return <SlotMachine />;
      case AppView.THEME_CUSTOMIZER:
        return userRole === 'Owner' ? <ThemeCustomizer /> : <RngTactician />;
      case AppView.PUNISHMENT_WHEEL:
        return <PunishmentWheel isOwner={userRole === 'Owner'} />;
      case AppView.SHOP:
        return <Shop isOwner={userRole === 'Owner'} />;
      case AppView.VIP_SUPPLIES:
        return userRole === 'Owner' ? <VipSupplies /> : <RngTactician />;
      default:
        return <RngTactician />;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#09090b] flex flex-col items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-2xl border border-white/10 w-full max-w-md space-y-8 text-center shadow-2xl relative overflow-hidden fade-in-up">
          <div className="absolute inset-0 noise-bg opacity-20 pointer-events-none"></div>

          <div className="relative z-10 space-y-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">System Access</h1>
            <p className="text-zinc-500 text-xs uppercase tracking-widest">Authentication Required</p>
          </div>

          <form onSubmit={handleLogin} className="relative z-10 space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-1" htmlFor="user-role">Identified As</label>
              <select
                id="user-role"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500/50 appearance-none font-mono text-sm cursor-pointer transition-all hover:border-zinc-500"
              >
                <option value="Owner">Owner</option>
                <option value="Gooner 💔🥀">Gooner 💔🥀</option>
                <option value="Migueeeel [Beta Tester]">Migueeeel [Beta Tester]</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-1">Key Phrase</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500/50 text-center placeholder-zinc-800 transition-all font-mono text-sm"
              />
            </div>

            <button type="submit" className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-bold uppercase tracking-widest text-xs transition-all hover:scale-[1.02] hover:border-emerald-500/30 hover:text-emerald-400">
              Enter System
            </button>
          </form>

          {error && <p className="relative z-10 text-red-500 font-bold text-lg animate-shake tracking-widest">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        isOwner={userRole === 'Owner'}
        userRole={userRole}
        hasVipBadge={hasVipBadge()}
      />

      <main className="flex-1 ml-20 md:ml-64 p-6 md:p-12 transition-all">
        <div className="max-w-7xl mx-auto pt-8">
          {renderView()}
        </div>
      </main>

      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-emerald-500/5 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
      </div>
    </div>
  );
};

export default App;
