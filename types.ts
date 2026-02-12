export enum AppView {
  RNG_TACTICIAN = 'rng-tactician',
  DATABASE = 'database',
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
}

export type UserRole = 'Owner' | 'Gooner 💔🥀' | 'Migueeeel [Beta Tester]';

export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export type PunishmentDifficulty = 'easy' | 'medium' | 'hard' | 'extreme' | 'free';

export interface PunishmentOption {
  id: string;
  text: string;
  color: string;
  difficulty: PunishmentDifficulty;
  description?: string;
}

export const RARITY_CONFIG = {
  COMMON: {
    name: 'Common',
    color: '#9ca3af',
    bgColor: 'rgba(156, 163, 175, 0.2)',
    borderColor: 'rgba(156, 163, 175, 0.3)',
    multiplier: 1,
    emoji: '⚪'
  },
  RARE: {
    name: 'Rare',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    multiplier: 2,
    emoji: '🔵'
  },
  EPIC: {
    name: 'Epic',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    multiplier: 3,
    emoji: '🟣'
  },
  LEGENDARY: {
    name: 'Legendary',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    multiplier: 5,
    emoji: '🟡'
  }
};

export interface RiddleResponse {
  question: string;
  answer: string;
}

export enum ItemAction {
  NONE = 'NONE',
  GIVE_POINTS = 'GIVE_POINTS',
  GIVE_EXTRA_ROLL = 'GIVE_EXTRA_ROLL',
  GIVE_SKIP_PUNISHMENT = 'GIVE_SKIP_PUNISHMENT',
  DOUBLE_POINTS_BUFF = 'DOUBLE_POINTS_BUFF',
  RANDOM_POINTS_BOX = 'RANDOM_POINTS_BOX',
  GRANT_VIP = 'GRANT_VIP',
}

export interface Material {
  name: string;
  icon?: string;
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

export interface VipSupply {
  id: string;
  name: string;
  rarity: Rarity;
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

export const DEFAULT_VIP_SUPPLIES: VipSupply[] = [
  { id: '1', name: 'Premium Select', rarity: 'COMMON' },
  { id: '2', name: 'Golden Collection', rarity: 'RARE' },
  { id: '3', name: 'Exclusive Access', rarity: 'EPIC' },
  { id: '4', name: 'VIP Member Bundle', rarity: 'LEGENDARY' },
  { id: '5', name: 'Platinum Tier', rarity: 'LEGENDARY' },
  { id: '6', name: 'Elite Pass', rarity: 'EPIC' },
  { id: '7', name: 'Diamond Selection', rarity: 'LEGENDARY' },
  { id: '8', name: 'Royal Treatment', rarity: 'EPIC' },
  { id: '9', name: 'VIP Exclusive', rarity: 'RARE' },
  { id: '10', name: 'Top Tier Item', rarity: 'RARE' },
  { id: '11', name: 'Silver Badge', rarity: 'COMMON' },
  { id: '12', name: 'Bronze Collection', rarity: 'COMMON' },
  { id: '13', name: 'Mystery Crate', rarity: 'RARE' },
  { id: '14', name: 'Legendary Chest', rarity: 'LEGENDARY' },
  { id: '15', name: 'Epic Pack', rarity: 'EPIC' }
];
