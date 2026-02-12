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
import { AppView } from './types';
import type { UserRole } from './types';


// Theme definitions
const THEMES = [
  { id: 'emerald', name: 'Emerald', primary: '#10b981', primaryHover: '#059669', accent: '#06b6d4' },
  { id: 'purple', name: 'Purple', primary: '#8b5cf6', primaryHover: '#7c3aed', accent: '#a855f7' },
  { id: 'rose', name: 'Rose', primary: '#f43f5e', primaryHover: '#e11d48', accent: '#ec4899' },
  { id: 'amber', name: 'Amber', primary: '#f59e0b', primaryHover: '#d97706', accent: '#fbbf24' },
  { id: 'cyan', name: 'Cyan', primary: '#06b6d4', primaryHover: '#0891b2', accent: '#22d3ee' },
  { id: 'red', name: 'Red', primary: '#ef4444', primaryHover: '#dc2626', accent: '#f87171' },
];

const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
};

const applyTheme = (themeId: string) => {
  const theme = THEMES.find(t => t.id === themeId);
  if (!theme) return;

  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-primary-hover', theme.primaryHover);
  root.style.setProperty('--color-accent', theme.accent);
  root.style.setProperty('--color-primary-rgb', hexToRgb(theme.primary));
  root.style.setProperty('--color-accent-rgb', hexToRgb(theme.accent));
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('Gooner 💔🥀');
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
    if (password === 'goontime67') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('KYS 💔🥀');
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
        return <MiniGames />;
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
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-1">Identified As</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500/50 appearance-none font-mono text-sm cursor-pointer transition-all hover:border-zinc-500"
              >
                <option value="Gooner 💔🥀">Gooner 💔🥀</option>
                <option value="Owner">Owner</option>
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

