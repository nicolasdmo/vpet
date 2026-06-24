// R4, R5 — Real-time needs simulation.
// The monster lives in real time even while the player is offline: state is derived
// from elapsed time since `lastUpdated`, using SERVER time (passed in as `now`) so
// changing the device clock can't cheat (edge case in spec).

import type { BalanceConfig } from './config/balance.ts';
import type { MonsterInstance } from './types.ts';

const clamp = (v: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, v));

export interface NeedsSimResult {
  monster: MonsterInstance;
  // Care mistakes accrued during this elapsed window (need hit 0 and stayed there).
  newCareMistakes: number;
}

// Advance a monster's needs/fatigue/poop from `lastUpdated` to `now` (epoch ms).
// Does NOT handle aging/death (see lifespan.ts) — callers run both.
export function simulateNeeds(
  monster: MonsterInstance,
  now: number,
  cfg: BalanceConfig,
): NeedsSimResult {
  const elapsedMs = Math.max(0, now - monster.lastUpdated);
  const hours = elapsedMs / 3_600_000;
  if (hours === 0) return { monster, newCareMistakes: 0 };

  const n = cfg.needs;

  // Poops accumulate over time and each one drops cleanliness.
  const newPoops = Math.floor(
    (monster.ageHours % n.hoursPerPoop + hours) / n.hoursPerPoop,
  );
  const poopCount = monster.poopCount + newPoops;
  const cleanliness = clamp(
    monster.cleanliness - newPoops * n.cleanlinessDropPerPoop,
    0,
    100,
  );

  const fullness = clamp(monster.fullness - n.hungerDecayPerHour * hours, 0, 100);
  const energy = clamp(monster.energy - n.energyDecayPerHour * hours, 0, 100);

  // Fatigue recovers while resting (not sleeping is handled by feed/train flows).
  const fatigue = clamp(
    monster.fatigue - cfg.ailments.fatigueRecoveryPerHourResting * hours,
    0,
    100,
  );

  // Care mistake: a need bottomed out for a sustained window. We count one mistake
  // per full day any need spent at/near zero — a coarse but deterministic proxy.
  let newCareMistakes = 0;
  if (fullness <= 0 || cleanliness <= 0 || energy <= 0) {
    newCareMistakes = Math.floor(hours / 24) || 1;
  }

  return {
    monster: {
      ...monster,
      fullness,
      cleanliness,
      energy,
      fatigue,
      poopCount,
      careMistakes: monster.careMistakes + newCareMistakes,
      lastUpdated: now,
    },
    newCareMistakes,
  };
}

// Convenience flags used by the UI and notification scheduler (R35).
export function needsAttention(monster: MonsterInstance, cfg: BalanceConfig) {
  const n = cfg.needs;
  return {
    hungry: monster.fullness <= n.hungerWarnThreshold,
    dirty:
      monster.cleanliness <= n.cleanlinessWarnThreshold || monster.poopCount > 0,
    tired: monster.energy <= n.energyWarnThreshold,
    sick: monster.health === 'sick',
    injured: monster.health === 'injured',
  };
}

export function cleanUp(monster: MonsterInstance): MonsterInstance {
  return { ...monster, cleanliness: 100, poopCount: 0 };
}
