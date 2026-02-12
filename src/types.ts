export enum AppView {
    RNG_TACTICIAN = 'RNG_TACTICIAN',
    DATABASE = 'DATABASE',
    PROBABILITIES = 'PROBABILITIES',
    MINI_GAMES = 'MINI_GAMES',
    THEME_CUSTOMIZER = 'THEME_CUSTOMIZER',
    PUNISHMENT_WHEEL = 'PUNISHMENT_WHEEL',
    SHOP = 'SHOP',
    VIP_SUPPLIES = 'VIP_SUPPLIES'
}

export type UserRole = 'Owner' | 'Gooner 💔🥀';

export interface RiddleResponse {
    question: string;
    answer: string;
}

export interface FailedLog {
    question: string;
    answer: string;
    userAnswer: string;
}

export interface ActionLog {
    id: string;
    time: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'neutral';
}

export interface DayProbability {
    dayName: string;
    dayNumber: number; // 0 = Monday, 6 = Sunday
    yesProb: number; // Percentage 0-100
    noProb: number; // Percentage 0-100
}

export interface WeekendRestriction {
    enabled: boolean;
    message: string;
}

export interface ProbabilityConfig {
    days: DayProbability[];
    weekendRestriction: WeekendRestriction;
}

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    icon: string;
    stock: number;
}

export const DEFAULT_DAYS: DayProbability[] = [
    { dayName: 'Monday', dayNumber: 0, yesProb: 18, noProb: 72 },
    { dayName: 'Tuesday', dayNumber: 1, yesProb: 36, noProb: 54 },
    { dayName: 'Wednesday', dayNumber: 2, yesProb: 36, noProb: 54 },
    { dayName: 'Thursday', dayNumber: 3, yesProb: 89, noProb: 1 },
    { dayName: 'Friday', dayNumber: 4, yesProb: 18, noProb: 72 },
    { dayName: 'Saturday', dayNumber: 5, yesProb: 0, noProb: 90 },
    { dayName: 'Sunday', dayNumber: 6, yesProb: 0, noProb: 90 }
];

export const DEFAULT_WEEKEND_RESTRICTION: WeekendRestriction = {
    enabled: true,
    message: "No Rolls For The Weekend!"
};
