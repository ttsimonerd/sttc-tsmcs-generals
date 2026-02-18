export enum AppView {
  RNG_TACTICIAN = 'rng-tactician',
  PROBABILITIES = 'probabilities',
  MINI_GAMES = 'mini-games',
  CRASH_GAME = 'crash-game',
  MINESWEEPER = 'minesweeper',
  SLOT_MACHINE = 'slot-machine',
  PUNISHMENT_WHEEL = 'punishment-wheel',
  SHOP = 'shop',
  VIP_SUPPLIES = 'vip-supplies',
  MATERIAL_REGISTRY = 'material-registry',
  USER_MANAGEMENT = 'user-management',
  RIDDLE_EDITOR = 'riddle-editor',
  GAME_TUNER = 'game-tuner',
  SYSTEM_CONTROL = 'system-control',
  CONFIG_EXPORT = 'config-export',
  INVENTORY = 'inventory',
}

export type UserRole = 'Owner' | 'Gooner 💔🥀' | 'Migueeeel [Beta Tester]';

export interface PunishmentOption {
  id: string;
  text: string;
  color: string;
  description?: string;
}

export interface RiddleResponse {
  question: string;
  answer: string;
}

export enum ItemAction {
  NONE = 'NONE',
  GIVE_POINTS = 'GIVE_POINTS',
  GIVE_EXTRA_ROLL = 'GIVE_EXTRA_ROLL',
  DOUBLE_POINTS_BUFF = 'DOUBLE_POINTS_BUFF',
  RANDOM_POINTS_BOX = 'RANDOM_POINTS_BOX',
  GRANT_VIP = 'GRANT_VIP',
}

export interface Material {
  name: string;
  action?: ItemAction;
  actionValue?: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  stock: number;
  action?: ItemAction;
  actionValue?: number;
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
  dayNumber: number;
  yesProb: number;
  noProb: number;
}

export interface WeekendRestriction {
  enabled: boolean;
  message: string;
}

export interface ProbabilityConfig {
  days: DayProbability[];
  weekendRestriction: WeekendRestriction;
}

export const DEFAULT_DAYS: DayProbability[] = [
  { dayName: 'Monday', dayNumber: 0, yesProb: 70, noProb: 20 },
  { dayName: 'Tuesday', dayNumber: 1, yesProb: 10, noProb: 80 },
  { dayName: 'Wednesday', dayNumber: 2, yesProb: 70, noProb: 20 },
  { dayName: 'Thursday', dayNumber: 3, yesProb: 1, noProb: 89 },
  { dayName: 'Friday', dayNumber: 4, yesProb: 80, noProb: 10 },
  { dayName: 'Saturday', dayNumber: 5, yesProb: 0, noProb: 90 },
  { dayName: 'Sunday', dayNumber: 6, yesProb: 0, noProb: 90 }
];

export const DEFAULT_WEEKEND_RESTRICTION: WeekendRestriction = {
  enabled: true,
  message: "Don't Break The Rule!"
};


