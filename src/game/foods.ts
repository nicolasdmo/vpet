// R6 — Apply a food's effects to a monster instance.

import type { MonsterInstance, Stat } from './types.ts';
import { FOODS } from './data/foodsData.ts';

const clamp = (v: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, v));

export function feed(monster: MonsterInstance, foodId: string): MonsterInstance {
  const food = FOODS[foodId];
  if (!food) throw new Error(`Unknown food: ${foodId}`);

  const stats = { ...monster.stats };
  if (food.statTendency) {
    for (const key of Object.keys(food.statTendency) as Stat[]) {
      stats[key] = stats[key] + (food.statTendency[key] ?? 0);
    }
  }

  return {
    ...monster,
    stats,
    fullness: clamp(monster.fullness + food.fullness, 0, 100),
    energy: clamp(monster.energy + food.energy, 0, 100),
    cleanliness: clamp(monster.cleanliness - food.cleanlinessCost, 0, 100),
    health:
      food.health === 'cure-sick' && monster.health === 'sick'
        ? 'healthy'
        : monster.health,
    effectiveLifespanHours:
      monster.effectiveLifespanHours + (food.lifespanBonusHours ?? 0),
  };
}
