// Points Service - Manages user points and item effects
import { ItemAction, ShopItem, PunishmentOption } from '../types';

// Current user tracking
const CURRENT_USER_KEY = 'current-user';

// Get/Set current user
export const getCurrentUser = (): string => {
  return localStorage.getItem(CURRENT_USER_KEY) || 'Guest';
};

export const setCurrentUser = (user: string): void => {
  localStorage.setItem(CURRENT_USER_KEY, user);
};

// Helper to get user-specific key
const userKey = (baseKey: string, user?: string): string => {
  const targetUser = user || getCurrentUser();
  return `${targetUser}::${baseKey}`;
};

// Base keys (will be prefixed with user)
const POINTS_KEY = 'user-points';
const PURCHASED_ITEMS_KEY = 'purchased-items';
const LAST_DAILY_BONUS_KEY = 'last-daily-bonus';
const ITEM_INVENTORY_KEY = 'item-inventory';
const DOUBLE_POINTS_EXPIRY_KEY = 'double-points-expiry';
const VIP_BADGE_KEY = 'vip-badge-owned';
const WEEK_DATA_KEY = 'rng_week_data';

// Shared keys (same for all users - Owner-managed content)
const SHOP_ITEMS_KEY = 'shop-items';
const PUNISHMENTS_KEY = 'punishment-options';
const VIP_CHOICE_KEY = 'vip-choice-item';
const VIP_SUPPLIES_KEY = 'vip-supplies-list';

// Item IDs for effects
export const ITEM_IDS = {
  EXTRA_ROLL: '1',
  DOUBLE_POINTS: '3',
  MYSTERY_BOX: '4',
  VIP_BADGE: '5',
};

// Default VIP Supplies (premium materials for VIP Choice reward)
export const DEFAULT_VIP_SUPPLIES: string[] = [
  "Derpixon",
  "Candy Love",
  "Octokuro Model",
  "Maplestar",
  "Anna Anon",
  "Minus8",
  "Amplected",
  "Suoiresnu",
  "Misfitbite",
  "Fortnite"
];

// Default VIP Choice Shop Item
export const DEFAULT_VIP_CHOICE: ShopItem = {
  id: 'vip-riddle',
  name: 'VIP Choice',
  description: 'Get 1 premium supplies!',
  price: 120,
  icon: '👑',
  stock: -1,
  action: ItemAction.NONE,
};

// Default shop items
const DEFAULT_SHOP_ITEMS: ShopItem[] = [
  { id: '1', name: 'Extra Roll', description: 'Get one extra roll today', price: 50, icon: '🎲', stock: -1, action: ItemAction.GIVE_EXTRA_ROLL, actionValue: 1 },
  { id: '3', name: 'Double Points', description: 'Double points for 1 hour', price: 200, icon: '✨', stock: -1, action: ItemAction.DOUBLE_POINTS_BUFF, actionValue: 3600 },
  { id: '4', name: 'Mystery Box', description: 'Random reward inside', price: 75, icon: '📦', stock: 10, action: ItemAction.RANDOM_POINTS_BOX },
  { id: '5', name: 'VIP Badge', description: 'Show off your status', price: 500, icon: '👑', stock: 5, action: ItemAction.GRANT_VIP },
];

// Default punishment options
const PUNISHMENT_COLORS = ['#dc2626', '#ea580c', '#d97706', '#65a30d', '#0891b2', '#7c3aed', '#db2777'];

const DEFAULT_PUNISHMENTS: PunishmentOption[] = [
  { id: '1', text: '?', color: PUNISHMENT_COLORS[0 % PUNISHMENT_COLORS.length], description: 'Come twice with {supply}.' },
  { id: '2', text: '?', color: PUNISHMENT_COLORS[1 % PUNISHMENT_COLORS.length], description: 'Watch the video number 7 of {supply}' },
  { id: '3', text: '?', color: PUNISHMENT_COLORS[2 % PUNISHMENT_COLORS.length], description: 'Watch the longest video of {supply}' },
  { id: '4', text: '?', color: PUNISHMENT_COLORS[3 % PUNISHMENT_COLORS.length], description: 'Watch the most watched video of {supply}' },
  { id: '5', text: '?', color: PUNISHMENT_COLORS[4 % PUNISHMENT_COLORS.length], description: 'Watch the most liked video of {supply}' },
  { id: '6', text: '?', color: PUNISHMENT_COLORS[5 % PUNISHMENT_COLORS.length], description: 'Watch the video number 6 of {supply}' },
  { id: '7', text: '?', color: PUNISHMENT_COLORS[6 % PUNISHMENT_COLORS.length], description: 'Use the \"el globo\" with {supply}' },
  { id: '8', text: '?', color: PUNISHMENT_COLORS[0 % PUNISHMENT_COLORS.length], description: 'Use the \"water globo\" with {supply}' },
];

// Points functions
export const getPoints = (user?: string): number => {
  const stored = localStorage.getItem(userKey(POINTS_KEY, user));
  return stored ? parseInt(stored, 10) : 100;
};

export const setPoints = (points: number, user?: string): void => {
  localStorage.setItem(userKey(POINTS_KEY, user), Math.max(0, points).toString());
};

export const addPoints = (amount: number): number => {
  const current = getPoints();
  const newTotal = current + amount;
  setPoints(newTotal);
  return newTotal;
};

export const spendPoints = (amount: number): boolean => {
  const current = getPoints();
  if (current >= amount) {
    setPoints(current - amount);
    return true;
  }
  return false;
};

// Shop functions
export const getShopItems = (): ShopItem[] => {
  const stored = localStorage.getItem(SHOP_ITEMS_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_SHOP_ITEMS;
};

export const saveShopItems = (items: ShopItem[]): void => {
  localStorage.setItem(SHOP_ITEMS_KEY, JSON.stringify(items));
};

export const resetShopItems = (): void => {
  localStorage.setItem(SHOP_ITEMS_KEY, JSON.stringify(DEFAULT_SHOP_ITEMS));
};

// Purchased items (user-specific)
export const getPurchasedItems = (): string[] => {
  const stored = localStorage.getItem(userKey(PURCHASED_ITEMS_KEY));
  return stored ? JSON.parse(stored) : [];
};

export const addPurchasedItem = (itemId: string): void => {
  const purchased = getPurchasedItems();
  purchased.push(itemId);
  localStorage.setItem(userKey(PURCHASED_ITEMS_KEY), JSON.stringify(purchased));
};

// Punishment functions
export const getPunishments = (): PunishmentOption[] => {
  const stored = localStorage.getItem(PUNISHMENTS_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_PUNISHMENTS;
};

export const savePunishments = (punishments: PunishmentOption[]): void => {
  localStorage.setItem(PUNISHMENTS_KEY, JSON.stringify(punishments));
};

export const resetPunishments = (): void => {
  localStorage.setItem(PUNISHMENTS_KEY, JSON.stringify(DEFAULT_PUNISHMENTS));
};

// Daily bonus functions (user-specific)
export const canClaimDailyBonus = (): boolean => {
  const lastClaim = localStorage.getItem(userKey(LAST_DAILY_BONUS_KEY));
  if (!lastClaim) return true;

  const lastDate = new Date(lastClaim);
  const today = new Date();

  return lastDate.toDateString() !== today.toDateString();
};

export const claimDailyBonus = (): number => {
  if (!canClaimDailyBonus()) return 0;

  localStorage.setItem(userKey(LAST_DAILY_BONUS_KEY), new Date().toISOString());
  return addPoints(5);
};

export const getLastDailyBonusDate = (): string | null => {
  return localStorage.getItem(userKey(LAST_DAILY_BONUS_KEY));
};

// VIP Choice functions (for premium supplies)
export const getVipChoiceItem = (): ShopItem => {
  const stored = localStorage.getItem(VIP_CHOICE_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_VIP_CHOICE;
};

export const saveVipChoiceItem = (item: ShopItem): void => {
  localStorage.setItem(VIP_CHOICE_KEY, JSON.stringify(item));
};

export const resetVipChoiceItem = (): void => {
  localStorage.setItem(VIP_CHOICE_KEY, JSON.stringify(DEFAULT_VIP_CHOICE));
};

// VIP Supplies list functions
export const getVipSupplies = (): string[] => {
  const stored = localStorage.getItem(VIP_SUPPLIES_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_VIP_SUPPLIES;
};

export const saveVipSupplies = (supplies: string[]): void => {
  localStorage.setItem(VIP_SUPPLIES_KEY, JSON.stringify(supplies));
};

export const resetVipSupplies = (): void => {
  localStorage.setItem(VIP_SUPPLIES_KEY, JSON.stringify(DEFAULT_VIP_SUPPLIES));
};

// ==========================================
// ITEM INVENTORY & EFFECTS SYSTEM
// ==========================================

export interface ItemInventory {
  [itemId: string]: number;
}

// Get inventory (count of each consumable item) - user-specific
export const getItemInventory = (user?: string): ItemInventory => {
  const stored = localStorage.getItem(userKey(ITEM_INVENTORY_KEY, user));
  return stored ? JSON.parse(stored) : {};
};

// Save inventory - user-specific
export const saveItemInventory = (inventory: ItemInventory, user?: string): void => {
  localStorage.setItem(userKey(ITEM_INVENTORY_KEY, user), JSON.stringify(inventory));
};

// Add item to inventory (for consumables)
export const addToInventory = (itemId: string, count: number = 1): void => {
  const inventory = getItemInventory();
  inventory[itemId] = (inventory[itemId] || 0) + count;
  saveItemInventory(inventory);
};

// Use item from inventory (returns true if successful)
export const useFromInventory = (itemId: string): boolean => {
  const inventory = getItemInventory();
  if (inventory[itemId] && inventory[itemId] > 0) {
    inventory[itemId] -= 1;
    if (inventory[itemId] === 0) {
      delete inventory[itemId];
    }
    saveItemInventory(inventory);
    return true;
  }
  return false;
};

// Get count of item in inventory
export const getInventoryCount = (itemId: string): number => {
  const inventory = getItemInventory();
  return inventory[itemId] || 0;
};

// Check if user has item in inventory
export const hasItem = (itemId: string): boolean => {
  return getInventoryCount(itemId) > 0;
};

// Actions processing system
export const processItemAction = (action?: ItemAction | string, value: number = 0): { success: boolean; message: string } => {
  if (!action || action === ItemAction.NONE) return { success: true, message: '' };

  switch (action) {
    case ItemAction.GIVE_POINTS:
      addPoints(value);
      return { success: true, message: `Acquired ${value} points!` };

    case ItemAction.GIVE_EXTRA_ROLL:
    case 'EXTRA_ROLL': // Legacy support
      addToInventory(ITEM_IDS.EXTRA_ROLL, value || 1);
      return { success: true, message: `Added ${value || 1} Extra Roll(s) to inventory!` };

    case ItemAction.DOUBLE_POINTS_BUFF:
    case 'DOUBLE_POINTS': // Legacy support
      activateDoublePoints();
      return { success: true, message: 'Double Points activated for 1 hour!' };

    case ItemAction.RANDOM_POINTS_BOX: {
      const reward = openMysteryBox();
      addPoints(reward);
      return { success: true, message: `Opened mystery box and found ${reward} points!` };
    }

    case ItemAction.GRANT_VIP:
    case 'GRANT_VIP': // Legacy support
      if (hasVipBadge()) return { success: false, message: 'You already own the VIP Badge!' };
      grantVipBadge();
      return { success: true, message: "VIP Badge acquired! You're now a VIP!" };

    default:
      return { success: false, message: 'Unknown action type.' };
  }
};

// ==========================================
// DOUBLE POINTS EFFECT
// ==========================================

// Activate double points for 1 hour (user-specific)
export const activateDoublePoints = (): void => {
  const expiryTime = Date.now() + (60 * 60 * 1000); // 1 hour from now
  localStorage.setItem(userKey(DOUBLE_POINTS_EXPIRY_KEY), expiryTime.toString());
};

// Check if double points is active (user-specific)
export const isDoublePointsActive = (): boolean => {
  const expiry = localStorage.getItem(userKey(DOUBLE_POINTS_EXPIRY_KEY));
  if (!expiry) return false;
  return Date.now() < parseInt(expiry, 10);
};

// Get remaining time for double points (in ms) (user-specific)
export const getDoublePointsRemaining = (): number => {
  const expiry = localStorage.getItem(userKey(DOUBLE_POINTS_EXPIRY_KEY));
  if (!expiry) return 0;
  const remaining = parseInt(expiry, 10) - Date.now();
  return remaining > 0 ? remaining : 0;
};

// Clear double points effect (user-specific)
export const clearDoublePoints = (): void => {
  localStorage.removeItem(userKey(DOUBLE_POINTS_EXPIRY_KEY));
};

// ==========================================
// VIP BADGE (Permanent Effect)
// ==========================================

// Check if user owns VIP badge (user-specific)
export const hasVipBadge = (user?: string): boolean => {
  return localStorage.getItem(userKey(VIP_BADGE_KEY, user)) === 'true';
};

// Grant VIP badge (permanent) (user-specific)
export const setVipBadge = (status: boolean, user?: string): void => {
  localStorage.setItem(userKey(VIP_BADGE_KEY, user), status ? 'true' : 'false');
};

export const grantVipBadge = (user?: string): void => {
  setVipBadge(true, user);
};

// ==========================================
// MYSTERY BOX
// ==========================================

// Open mystery box - returns random points (10-500)
export const openMysteryBox = (): number => {
  const ranges = [
    { min: 10, max: 50, weight: 50 },    // Common: 10-50 pts (50% chance)
    { min: 51, max: 100, weight: 25 },   // Uncommon: 51-100 pts (25% chance)
    { min: 101, max: 250, weight: 15 },  // Rare: 101-250 pts (15% chance)
    { min: 251, max: 500, weight: 10 },  // Legendary: 251-500 pts (10% chance)
  ];

  const totalWeight = ranges.reduce((sum, r) => sum + r.weight, 0);
  let random = Math.random() * totalWeight;

  for (const range of ranges) {
    random -= range.weight;
    if (random <= 0) {
      return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }
  }

  return ranges[0].min; // Fallback
};

// ==========================================
// ENHANCED POINTS FUNCTIONS (with Double Points)
// ==========================================

// Add points with double points multiplier applied
export const addPointsWithMultiplier = (amount: number): { total: number; doubled: boolean } => {
  const doubled = isDoublePointsActive();
  const finalAmount = doubled ? amount * 2 : amount;
  const newTotal = addPoints(finalAmount);
  return { total: newTotal, doubled };
};

