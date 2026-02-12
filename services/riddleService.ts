import { DEFAULT_RIDDLES } from "../data/riddles";
import { RiddleResponse } from "../types";

const RIDDLES_KEY = 'redeemer_riddles_data';

export const getRiddles = (): RiddleResponse[] => {
    const stored = localStorage.getItem(RIDDLES_KEY);
    return stored ? JSON.parse(stored) : [...DEFAULT_RIDDLES];
};

export const saveRiddles = (riddles: RiddleResponse[]): void => {
    localStorage.setItem(RIDDLES_KEY, JSON.stringify(riddles));
};

export const resetRiddles = (): void => {
    localStorage.setItem(RIDDLES_KEY, JSON.stringify(DEFAULT_RIDDLES));
};
