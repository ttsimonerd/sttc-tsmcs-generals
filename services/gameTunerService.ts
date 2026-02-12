export interface CrashDistribution {
    value: number;
    prob: number;
}

export interface GameTunerConfig {
    crash: {
        speed: number;
        distribution: CrashDistribution[];
    };
    slots: {
        spinCost: number;
        freeSpinInterval: number;
        weights: number[];
        multipliers: number[];
    };
    minesweeper: {
        EASY: { gridSize: number; mineCount: number; points: number };
        MEDIUM: { gridSize: number; mineCount: number; points: number };
        HARD: { gridSize: number; mineCount: number; points: number };
    };
}

const TUNER_KEY = 'mini_game_tuner_config';

export const DEFAULT_TUNER_CONFIG: GameTunerConfig = {
    crash: {
        speed: 0.5,
        distribution: [
            { value: 1.01, prob: 0.05 },
            { value: 1.10, prob: 0.08 },
            { value: 1.50, prob: 0.12 },
            { value: 2.00, prob: 0.15 },
            { value: 3.00, prob: 0.20 },
            { value: 5.00, prob: 0.15 },
            { value: 10.00, prob: 0.10 },
            { value: 20.00, prob: 0.08 },
            { value: 50.00, prob: 0.05 },
            { value: 100.00, prob: 0.02 },
        ]
    },
    slots: {
        spinCost: 5,
        freeSpinInterval: 10,
        weights: [30, 25, 20, 15, 5, 3, 2],
        multipliers: [2, 2, 3, 3, 5, 10, 20]
    },
    minesweeper: {
        EASY: { gridSize: 5, mineCount: 3, points: 5 },
        MEDIUM: { gridSize: 7, mineCount: 5, points: 15 },
        HARD: { gridSize: 10, mineCount: 8, points: 30 },
    }
};

export const getTunerConfig = (): GameTunerConfig => {
    const stored = localStorage.getItem(TUNER_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_TUNER_CONFIG;
};

export const saveTunerConfig = (config: GameTunerConfig): void => {
    localStorage.setItem(TUNER_KEY, JSON.stringify(config));
};

export const resetTunerConfig = (): void => {
    localStorage.setItem(TUNER_KEY, JSON.stringify(DEFAULT_TUNER_CONFIG));
};
