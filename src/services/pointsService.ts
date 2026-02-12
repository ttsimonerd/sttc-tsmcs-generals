import type { ShopItem } from '../types';


export const DEFAULT_VIP_SUPPLIES = [
  "Premium Select",
  "Golden Collection",
  "Exclusive Access",
  "VIP Member Bundle",
  "Platinum Tier",
  "Elite Pass",
  "Diamond Selection",
  "Royal Treatment",
  "VIP Exclusive",
  "Top Tier Item"
];

const STORAGE_KEYS = {
  POINTS: 'tsmc_points',
  SHOP_ITEMS: 'tsmc_shop_items',
  PURCHASED_ITEMS: 'tsmc_purchased_items',
  VIP_RIDDLE: 'tsmc_vip_riddle',
  VIP_SUPPLIES: 'tsmc_vip_supplies'
};

const DEFAULT_SHOP_ITEMS: ShopItem[] = [
  { id: '1', name: 'Starter Cache', description: 'A small boost for beginners', price: 50, icon: '📦', stock: -1 },
  { id: '2', name: 'Luck Charm', description: 'Increases roll favorability', price: 200, icon: '🍀', stock: 5 },
  { id: '3', name: 'System Override', description: 'Force a specific outcome', price: 500, icon: '⚡', stock: 1 }
];

export const getPoints = (): number => {
  const points = localStorage.getItem(STORAGE_KEYS.POINTS);
  return points ? parseInt(points) : 0;
};

export const addPoints = (amount: number): void => {
  const current = getPoints();
  localStorage.setItem(STORAGE_KEYS.POINTS, (current + amount).toString());
};

export const spendPoints = (amount: number): boolean => {
  const current = getPoints();
  if (current >= amount) {
    localStorage.setItem(STORAGE_KEYS.POINTS, (current - amount).toString());
    return true;
  }
  return false;
};

export const getShopItems = (): ShopItem[] => {
  const items = localStorage.getItem(STORAGE_KEYS.SHOP_ITEMS);
  return items ? JSON.parse(items) : DEFAULT_SHOP_ITEMS;
};

export const saveShopItems = (items: ShopItem[]): void => {
  localStorage.setItem(STORAGE_KEYS.SHOP_ITEMS, JSON.stringify(items));
};

export const getPurchasedItems = (): string[] => {
  const items = localStorage.getItem(STORAGE_KEYS.PURCHASED_ITEMS);
  return items ? JSON.parse(items) : [];
};

export const addPurchasedItem = (itemId: string): void => {
  const items = getPurchasedItems();
  localStorage.setItem(STORAGE_KEYS.PURCHASED_ITEMS, JSON.stringify([...items, itemId]));
};

export const getVipRiddleItem = (): ShopItem => {
  const item = localStorage.getItem(STORAGE_KEYS.VIP_RIDDLE);
  return item ? JSON.parse(item) : {
    id: 'vip-riddle',
    name: 'VIP Choice',
    description: 'Get 3 premium supplies!',
    price: 120,
    icon: '👑',
    stock: -1
  };
};

export const saveVipRiddleItem = (item: ShopItem): void => {
  localStorage.setItem(STORAGE_KEYS.VIP_RIDDLE, JSON.stringify(item));
};

export const getVipSupplies = (): string[] => {
  const supplies = localStorage.getItem(STORAGE_KEYS.VIP_SUPPLIES);
  return supplies ? JSON.parse(supplies) : DEFAULT_VIP_SUPPLIES;
};

export const saveVipSupplies = (supplies: string[]): void => {
  localStorage.setItem(STORAGE_KEYS.VIP_SUPPLIES, JSON.stringify(supplies));
};

export const resetVipSupplies = (): void => {
  localStorage.setItem(STORAGE_KEYS.VIP_SUPPLIES, JSON.stringify(DEFAULT_VIP_SUPPLIES));
};
