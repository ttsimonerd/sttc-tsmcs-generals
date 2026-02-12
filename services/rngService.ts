import { MATERIALS_LIST } from "../data/materials";
import { DEFAULT_DAYS, DEFAULT_WEEKEND_RESTRICTION, DayProbability, ProbabilityConfig, Material, ItemAction } from "../types";
import { getCurrentUser } from "./pointsService";

interface WeekData {
  week_number: number;
  yes_count: number;
}

// User-specific storage key for week data
const getWeekDataKey = (): string => {
  const user = getCurrentUser();
  return `${user}::rng_week_data`;
};
const MATERIALS_STORAGE_KEY = 'materials_registry_data';
const PROBABILITY_CONFIG_KEY = 'probability_config';

const getCurrentWeek = (): number => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
};

export const loadWeekData = (): WeekData => {
  const raw = localStorage.getItem(getWeekDataKey());
  const currentWeek = getCurrentWeek();

  if (!raw) {
    const newData = { week_number: currentWeek, yes_count: 0 };
    saveWeekData(newData);
    return newData;
  }

  const data = JSON.parse(raw) as WeekData;
  if (data.week_number !== currentWeek) {
    const newData = { week_number: currentWeek, yes_count: 0 };
    saveWeekData(newData);
    return newData;
  }

  return data;
};

const saveWeekData = (data: WeekData) => {
  localStorage.setItem(getWeekDataKey(), JSON.stringify(data));
};

export const resetWins = () => {
  const data = loadWeekData();
  data.yes_count = 0;
  saveWeekData(data);
};

// Load probabilities from config or use defaults
const getTodayProbabilities = (): [number, number] | null => {
  const jsDay = new Date().getDay();
  const pythonDay = jsDay === 0 ? 6 : jsDay - 1; // Convert JS Sunday=0 to Python Monday=0

  // Load custom config
  const storedConfig = localStorage.getItem(PROBABILITY_CONFIG_KEY);
  let days: DayProbability[] = DEFAULT_DAYS;
  let weekendRestriction = DEFAULT_WEEKEND_RESTRICTION;

  if (storedConfig) {
    try {
      const config = JSON.parse(storedConfig) as ProbabilityConfig;
      if (config.days && config.days.length === 7) {
        days = config.days;
      }
      if (config.weekendRestriction) {
        weekendRestriction = config.weekendRestriction;
      }
    } catch (e) {
      console.error('Failed to parse probability config, using defaults');
    }
  }

  // Check if it's weekend and restriction is enabled
  const isWeekend = pythonDay >= 5;
  if (isWeekend && weekendRestriction.enabled) {
    return null; // Weekend restriction active
  }

  const dayData = days.find(d => d.dayNumber === pythonDay);
  if (!dayData) {
    return null;
  }

  // Return [noProb, yesProb] as percentages (0-1 range)
  return [dayData.noProb / 100, dayData.yesProb / 100];
};

// Get the weekend message for display
export const getWeekendMessage = (): string => {
  const storedConfig = localStorage.getItem(PROBABILITY_CONFIG_KEY);
  if (storedConfig) {
    try {
      const config = JSON.parse(storedConfig) as ProbabilityConfig;
      if (config.weekendRestriction) {
        return config.weekendRestriction.message;
      }
    } catch (e) {
      console.error('Failed to parse probability config');
    }
  }
  return DEFAULT_WEEKEND_RESTRICTION.message;
};

// Generate random Edge message and return the supply as well
export const generateEdgeMessage = (): { message: string; supply: Material } => {
  const randomDays = Math.floor(Math.random() * 7) + 1; // 1-7 days

  // Get a random material from the list
  const stored = localStorage.getItem(MATERIALS_STORAGE_KEY);
  const sourceList: Material[] = stored
    ? JSON.parse(stored)
    : MATERIALS_LIST.map(name => ({ name }));

  const randomMaterial = sourceList.length > 0
    ? sourceList[Math.floor(Math.random() * sourceList.length)]
    : { name: 'special supply' };

  return {
    message: `Edge ${randomDays} days and when you come back release the load with ${randomMaterial.name} 🥴`,
    supply: randomMaterial
  };
};

export const rollWithLimit = (forceBypass: boolean = false): string => {
  const data = loadWeekData();

  if (data.yes_count >= 3 && !forceBypass) {
    return "Dont Break The Rule!";
  }

  const probs = getTodayProbabilities();
  if (!probs) {
    return getWeekendMessage();
  }

  // Edge has fixed 10% chance
  // YES/NO are calculated from the remaining 90%
  const [probNo, probYes] = probs;

  const roll = Math.random();

  // 10% Edge | probYes% Yes | probNo% No
  if (roll < 0.10) {
    return generateEdgeMessage().message;
  } else if (roll < 0.10 + probYes) {
    const result = "Yes 🥵";
    if (!forceBypass) {
      data.yes_count += 1;
      saveWeekData(data);
    }
    return result;
  } else {
    return "No 🥶";
  }
};

export const checkMultiple = (): string => {
  const result = Math.random() < 0.5 ? "No" : "Yes";
  return result;
};

export const getMaterials = (num: number): Material[] => {
  const selected: Material[] = [];

  // Try to load from dynamic registry first
  const stored = localStorage.getItem(MATERIALS_STORAGE_KEY);
  const sourceList: Material[] = stored
    ? JSON.parse(stored)
    : MATERIALS_LIST.map(name => ({ name }));

  for (let i = 0; i < num; i++) {
    if (sourceList.length === 0) break;
    const randomIndex = Math.floor(Math.random() * sourceList.length);
    selected.push(sourceList[randomIndex]);
  }
  return selected;
};

// Get the supply from an Edge result message
export const getEdgeSupply = (edgeMessage: string): string => {
  // Extract the supply name from the message pattern: "Edge X days and when you come back release the load with {supply} 🥴"
  const match = edgeMessage.match(/release the load with (.+?) 🥴/);
  return match ? match[1] : '';
};
