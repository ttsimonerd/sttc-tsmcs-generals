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
      { id: AppView.VIP_SUPPLIES, label: 'VIP Supplies', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
      { id: AppView.MATERIAL_REGISTRY, label: 'Materials', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.722 2.528a2 2 0 00.535 2.023l1.858 1.858a2 2 0 002.828 0l4.243-4.243a2 2 0 000-2.828l-3.372-3.372z' },
      { id: AppView.USER_MANAGEMENT, label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
      { id: AppView.RIDDLE_EDITOR, label: 'Riddles', icon: 'M11 4a2 2 0 114 0v1a2 2 0 11-4 0V4zM4 13a2 2 0 012-2h12a2 2 0 110 4H6a2 2 0 01-2-2zM4 19a2 2 0 012-2h12a2 2 0 110 4H6a2 2 0 01-2-2z' },
      { id: AppView.GAME_TUNER, label: 'Tuner', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
      { id: AppView.SYSTEM_CONTROL, label: 'Broadcast', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' }
    );
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 md:w-64 glass-panel border-r border-white/10 z-50 flex flex-col transition-all duration-300">
      {/* Fixed Header */}
      <div className="px-6 py-8 hidden md:block shrink-0">
        <h1 className="text-2xl font-bold gradient-theme-text">
          TSmc
        </h1>
        <p className="text-xs text-zinc-400 tracking-widest mt-1">GENERALS</p>
      </div>

      {/* Scrollable Navigation */}
      <nav className="flex-1 px-3 space-y-2 overflow-y-auto custom-scrollbar py-2">
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

      {/* Fixed Footer */}
      <div className="p-6 hidden md:block space-y-3 shrink-0 border-t border-white/5 bg-zinc-900/40 backdrop-blur-md">
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
