export interface MasterConfig {
    version: string;
    timestamp: string;
    materials: any;
    riddles: any;
    miniGames: any;
    theme: string;
    probabilities: any;
    broadcast: string | null;
    credentials: any;
}

const STORAGE_KEYS = {
    MATERIALS: 'materials_registry_data',
    RIDDLES: 'redeemer_riddles_data',
    MINI_GAMES: 'mini_game_tuner_config',
    THEME: 'app-theme',
    PROBABILITIES: 'probability_config',
    BROADCAST: 'system-broadcast',
    CREDENTIALS: 'custom-user-passwords'
};

export const exportMasterConfig = () => {
    const config: Partial<MasterConfig> = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        materials: JSON.parse(localStorage.getItem(STORAGE_KEYS.MATERIALS) || 'null'),
        riddles: JSON.parse(localStorage.getItem(STORAGE_KEYS.RIDDLES) || 'null'),
        miniGames: JSON.parse(localStorage.getItem(STORAGE_KEYS.MINI_GAMES) || 'null'),
        theme: localStorage.getItem(STORAGE_KEYS.THEME) || 'emerald',
        probabilities: JSON.parse(localStorage.getItem(STORAGE_KEYS.PROBABILITIES) || 'null'),
        broadcast: localStorage.getItem(STORAGE_KEYS.BROADCAST),
        credentials: JSON.parse(localStorage.getItem(STORAGE_KEYS.CREDENTIALS) || 'null'),
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ph-manager-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const importMasterConfig = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target?.result as string) as MasterConfig;

                if (config.materials) localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(config.materials));
                if (config.riddles) localStorage.setItem(STORAGE_KEYS.RIDDLES, JSON.stringify(config.riddles));
                if (config.miniGames) localStorage.setItem(STORAGE_KEYS.MINI_GAMES, JSON.stringify(config.miniGames));
                if (config.theme) localStorage.setItem(STORAGE_KEYS.THEME, config.theme);
                if (config.probabilities) localStorage.setItem(STORAGE_KEYS.PROBABILITIES, JSON.stringify(config.probabilities));
                if (config.broadcast) localStorage.setItem(STORAGE_KEYS.BROADCAST, config.broadcast);
                else localStorage.removeItem(STORAGE_KEYS.BROADCAST);
                if (config.credentials) localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(config.credentials));

                resolve(true);
            } catch (error) {
                console.error('Failed to import config:', error);
                resolve(false);
            }
        };
        reader.readAsText(file);
    });
};

export const deepResetSystem = () => {
    const keysToKeep = ['current-user']; // Keep the session
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (!keysToKeep.includes(key)) {
            localStorage.removeItem(key);
        }
    });
    window.location.reload();
};
