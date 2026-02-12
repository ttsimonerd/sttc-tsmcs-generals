import React, { useState, useEffect } from 'react';

interface Theme {
  id: string;
  name: string;
  primary: string;
  primaryHover: string;
  accent: string;
  description: string;
}

const THEMES: Theme[] = [
  { 
    id: 'emerald', 
    name: 'Emerald (Default)', 
    primary: '#10b981', 
    primaryHover: '#059669',
    accent: '#06b6d4',
    description: 'Cool green vibes'
  },
  { 
    id: 'purple', 
    name: 'Royal Purple', 
    primary: '#8b5cf6', 
    primaryHover: '#7c3aed',
    accent: '#a855f7',
    description: 'Majestic and bold'
  },
  { 
    id: 'rose', 
    name: 'Rose Pink', 
    primary: '#f43f5e', 
    primaryHover: '#e11d48',
    accent: '#ec4899',
    description: 'Warm and passionate'
  },
  { 
    id: 'amber', 
    name: 'Golden Amber', 
    primary: '#f59e0b', 
    primaryHover: '#d97706',
    accent: '#fbbf24',
    description: 'Rich and luxurious'
  },
  { 
    id: 'cyan', 
    name: 'Electric Cyan', 
    primary: '#06b6d4', 
    primaryHover: '#0891b2',
    accent: '#22d3ee',
    description: 'Futuristic and cool'
  },
  { 
    id: 'red', 
    name: 'Crimson Red', 
    primary: '#ef4444', 
    primaryHover: '#dc2626',
    accent: '#f87171',
    description: 'Bold and intense'
  },
];

const ThemeCustomizer: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<string>('emerald');
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      setSelectedTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0, 0, 0';
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  };

  const applyTheme = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;
    
    // Set CSS variables on root element
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-primary-hover', theme.primaryHover);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-primary-rgb', hexToRgb(theme.primary));
    root.style.setProperty('--color-accent-rgb', hexToRgb(theme.accent));
  };

  const handlePreview = (themeId: string) => {
    setPreviewTheme(themeId);
    applyTheme(themeId);
  };

  const handlePreviewEnd = () => {
    if (previewTheme && previewTheme !== selectedTheme) {
      applyTheme(selectedTheme);
    }
    setPreviewTheme(null);
  };

  const handleSave = (themeId: string) => {
    setSelectedTheme(themeId);
    setPreviewTheme(null);
    localStorage.setItem('app-theme', themeId);
    applyTheme(themeId);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const currentTheme = THEMES.find(t => t.id === (previewTheme || selectedTheme));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Theme Customizer</h1>
          <p className="text-zinc-500 text-sm mt-1">Personalize the app's appearance</p>
        </div>
        {saved && (
          <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg animate-fade-in">
            <span className="text-emerald-400 text-sm">✓ Theme saved!</span>
          </div>
        )}
      </div>

      {/* Current theme preview */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Current Theme</h2>
        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 rounded-xl shadow-lg"
            style={{ background: `linear-gradient(135deg, ${currentTheme?.primary}, ${currentTheme?.accent})` }}
          />
          <div>
            <p className="text-white font-bold text-lg">{currentTheme?.name}</p>
            <p className="text-zinc-500 text-sm">{currentTheme?.description}</p>
          </div>
        </div>
      </div>

      {/* Theme grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Available Themes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {THEMES.map((theme) => (
            <div
              key={theme.id}
              onMouseEnter={() => handlePreview(theme.id)}
              onMouseLeave={handlePreviewEnd}
              onClick={() => handleSave(theme.id)}
              className={`relative p-5 rounded-xl border cursor-pointer transition-all hover:scale-105 active:scale-95
                ${selectedTheme === theme.id 
                  ? 'border-white/30 bg-white/10' 
                  : 'border-white/5 bg-zinc-900/50 hover:bg-zinc-800/50'
                }`}
            >
              {/* Selected indicator */}
              {selectedTheme === theme.id && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                {/* Color preview */}
                <div 
                  className="w-12 h-12 rounded-lg shadow-lg flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
                />
                
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{theme.name}</p>
                  <p className="text-zinc-500 text-xs truncate">{theme.description}</p>
                </div>
              </div>

              {/* Color swatches */}
              <div className="flex gap-2 mt-4">
                <div 
                  className="w-6 h-6 rounded-full border border-white/20"
                  style={{ backgroundColor: theme.primary }}
                  title="Primary"
                />
                <div 
                  className="w-6 h-6 rounded-full border border-white/20"
                  style={{ backgroundColor: theme.accent }}
                  title="Accent"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview buttons */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Preview Elements</h2>
        <div className="flex flex-wrap gap-3">
          <button 
            className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
            style={{ backgroundColor: currentTheme?.primary, color: 'white' }}
          >
            Primary Button
          </button>
          <button 
            className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
            style={{ backgroundColor: currentTheme?.accent, color: 'white' }}
          >
            Accent Button
          </button>
          <button 
            className="px-6 py-3 rounded-xl font-bold border-2 transition-all hover:scale-105"
            style={{ borderColor: currentTheme?.primary, color: currentTheme?.primary }}
          >
            Outline Button
          </button>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: currentTheme?.primary }}
          />
          <span className="text-sm" style={{ color: currentTheme?.primary }}>Primary colored text</span>
        </div>
        <div className="flex items-center gap-4">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: currentTheme?.accent }}
          />
          <span className="text-sm" style={{ color: currentTheme?.accent }}>Accent colored text</span>
        </div>
      </div>

      {/* Info */}
      <div className="text-center text-zinc-600 text-xs">
        <p>Click on a theme to apply it. Your preference is saved locally.</p>
      </div>
    </div>
  );
};

export default ThemeCustomizer;
