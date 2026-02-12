import React from 'react';
import { AppView, UserRole } from '../types';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  isOwner?: boolean;
  userRole?: UserRole;
  hasVipBadge?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isOwner, userRole, hasVipBadge }) => {
  const navItems = [
    { id: AppView.RNG_TACTICIAN, label: 'The Arbiter', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: AppView.MINI_GAMES, label: 'Mini Games', icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: AppView.CRASH_GAME, label: 'Crash Game', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { id: AppView.MINESWEEPER, label: 'Minesweeper', icon: 'M9 9h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: AppView.SLOT_MACHINE, label: 'Slots', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: AppView.PUNISHMENT_WHEEL, label: 'Punishment', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
    { id: AppView.SHOP, label: 'Shop', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
  ];

  if (isOwner) {
    navItems.push(
      { id: AppView.PROBABILITIES, label: 'Probabilities', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      { id: AppView.DATABASE, label: 'Registry', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      { id: AppView.THEME_CUSTOMIZER, label: 'Themes', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
      { id: AppView.VIP_SUPPLIES, label: 'VIP Supplies', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' }
    );
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-20 md:w-64 glass-panel border-r border-white/10 z-50 flex flex-col pt-8 transition-all duration-300">
      <div className="px-6 mb-10 hidden md:block">
        <h1 className="text-2xl font-bold gradient-theme-text">
          TSmc
        </h1>
        <p className="text-xs text-zinc-400 tracking-widest mt-1">GENERALS</p>
      </div>

      <nav className="flex-1 px-3 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group
              ${currentView === item.id 
                ? 'bg-theme-primary-soft text-white border-theme-primary-soft border shadow-theme-primary' 
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
          >
            <svg className={`w-6 h-6 flex-shrink-0 ${currentView === item.id ? 'text-theme-primary' : 'text-zinc-500 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span className="hidden md:block font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-6 hidden md:block space-y-3">
        {/* User Role with VIP Badge */}
        {userRole && (
          <div className="flex items-center gap-2">
            {hasVipBadge && (
              <span className="text-amber-400 animate-pulse" title="VIP Member">👑</span>
            )}
            <span className={`text-sm font-medium ${hasVipBadge ? 'text-amber-400' : 'text-zinc-400'}`}>
              {userRole}
            </span>
          </div>
        )}
        <div className="text-xs text-zinc-600">
          <p>Beta</p>
          <p>v1.5.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
