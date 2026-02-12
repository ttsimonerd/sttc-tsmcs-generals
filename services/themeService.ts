export interface ThemePreset {
    id: string;
    name: string;
    primary: string;
    accent: string;
    primaryRgb: string;
    accentRgb: string;
}

export const THEME_PRESETS: ThemePreset[] = [
    {
        id: 'emerald',
        name: 'Authentic Emerald',
        primary: '#10b981',
        accent: '#06b6d4',
        primaryRgb: '16, 185, 129',
        accentRgb: '6, 182, 212',
    },
    {
        id: 'ruby',
        name: 'Gooner Ruby',
        primary: '#ef4444',
        accent: '#f59e0b',
        primaryRgb: '239, 68, 68',
        accentRgb: '245, 158, 11',
    },
    {
        id: 'amethyst',
        name: 'Neon Amethyst',
        primary: '#a855f7',
        accent: '#ec4899',
        primaryRgb: '168, 85, 247',
        accentRgb: '236, 72, 153',
    },
    {
        id: 'sapphire',
        name: 'Deep Sapphire',
        primary: '#3b82f6',
        accent: '#2dd4bf',
        primaryRgb: '59, 130, 246',
        accentRgb: '45, 212, 191',
    },
    {
        id: 'ph-manager',
        name: 'Ph-Manager Gold',
        primary: '#eab308',
        accent: '#f97316',
        primaryRgb: '234, 179, 8',
        accentRgb: '249, 115, 22',
    },
    {
        id: 'midnight',
        name: 'Midnight Zinc',
        primary: '#71717a',
        accent: '#27272a',
        primaryRgb: '113, 113, 122',
        accentRgb: '39, 39, 42',
    }
];

export const applyTheme = (themeId: string) => {
    const theme = THEME_PRESETS.find(t => t.id === themeId) || THEME_PRESETS[0];
    const root = document.documentElement;

    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-primary-rgb', theme.primaryRgb);
    root.style.setProperty('--color-accent-rgb', theme.accentRgb);

    localStorage.setItem('app-theme', themeId);
};

export const getSavedTheme = (): string => {
    return localStorage.getItem('app-theme') || 'emerald';
};
