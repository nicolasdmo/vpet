// R7, R8 — Aging, longevity and death.
// Lifespan is real-time. Effective lifespan = base ± care effects + food bonuses
// (food bonuses are applied in foods.ts onto effectiveLifespanHours). The monster
// ages whenever needs are simulated; it dies of old age or terminal neglect.

import type { BalanceConfig } from './config/balance.ts';
import type { MonsterInstance } from './types.ts';

export interface AgingResult {
  monster: MonsterInstance;
  justDied: boolean;
}

// Advance age to `now` and resolve death. Call after simulateNeeds with the same `now`.
export function advanceAge(
  monster: MonsterInstance,
  now: number,
  cfg: BalanceConfig,
): AgingResult {
  if (!monster.alive) return { monster, justDied: false };

  const hours = Math.max(0, (now - monster.bornAt) / 3_600_000);

  // Recompute care-driven lifespan modifiers from accumulated care record.
  const penalty = monster.careMistakes * cfg.lifespan.hoursLostPerCareMistake;
  const bonus = Math.min(
    monster.goodCareDays * cfg.lifespan.hoursGainedPerGoodCareDay,
    cfg.lifespan.maxLongevityBonusHours,
  );
  // effectiveLifespanHours already includes food bonuses; fold in care here.
  const effective = monster.effectiveLifespanHours - penalty + bonus;

  const died = hours >= effective;

  return {
    monster: { ...monster, ageHours: hours, alive: !died },
    justDied: died,
  };
}

export function isElder(monster: MonsterInstance, cfg: BalanceConfig): boolean {
  return monster.ageHours >= monster.effectiveLifespanHours * cfg.lifespan.elderFraction;
}
