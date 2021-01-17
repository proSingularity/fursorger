import { Data } from 'phaser';
import { DEV } from '../dev-config';

const LEVEL = 'level';
export const setLevel = (registry: Data.DataManager, level: number) =>
    registry.set(LEVEL, level);

export const getLevel = (registry: Data.DataManager): number => {
    const lvl = registry.get(LEVEL);
    if (lvl) {
        return lvl;
    } else {
        // lazy initialization
        setLevel(registry, DEV.initialLevel || 0);
        return registry.get(LEVEL);
    }
};
