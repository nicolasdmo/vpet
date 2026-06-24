// R4, R5 — Real-time needs simulation.
// The monster lives in real time even while the player is offline: state is derived
// from elapsed time since `lastUpdated`, using SERVER time (passed in as `now`) so
// changing the device clock can't cheat (edge case in spec).

import type { BalanceConfig } from './config/balance.ts';
import type { MonsterInstance } from './types.ts';

const clamp = (v: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, v));

// Hours within a window of length `hours` that a linearly-decaying need spends AT
// zero. Frequency-independent: splitting a window into consecutive calls yields the
// same total. (Fixes the previous per-tick `|| 1` care-mistake bug.)
function hoursAtZero(startValue: number, decayPerHour: number, hours: number): number {
  if (decayPerHour <= 0) return startValue <= 0 ? hours : 0;
  const timeToZero = Math.max(0, startValue) / decayPerHour;
  return Math.max(0, hours - timeToZero);
}

// Hours within the window that a linearly-decaying need stays ABOVE `threshold`.
function hoursAbove(
  startValue: number,
  decayPerHour: number,
  threshold: number,
  hours: number,
): number {
  if (decayPerHour <= 0) return startValue > threshold ? hours : 0;
  const timeToThreshold = Math.max(0, startValue - threshold) / decayPerHour;
  return Math.min(hours, timeToThreshold);
}

export interface NeedsSimResult {
  monster: MonsterInstance;
  // Care mistakes accrued during this elapsed window (fractional, proportional to
  // sustained zeroed-need time — NOT one per tick).
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
    ((monster.ageHours % n.hoursPerPoop) + hours) / n.hoursPerPoop,
  );
  const poopCount = monster.poopCount + newPoops;
  const cleanliness = clamp(
    monster.cleanliness - newPoops * n.cleanlinessDropPerPoop,
    0,
    100,
  );

  const fullness = clamp(monster.fullness - n.hungerDecayPerHour * hours, 0, 100);
  const energy = clamp(monster.energy - n.energyDecayPerHour * hours, 0, 100);

  // Fatigue recovers while resting.
  const fatigue = clamp(
    monster.fatigue - cfg.ailments.fatigueRecoveryPerHourResting * hours,
    0,
    100,
  );

  // Care mistakes (R5 bug fix): debt is proportional to how long each linearly
  // decaying need (hunger, energy) sat at zero during the window. Computed from the
  // START values so two consecutive windows sum to the same as one long window —
  // independent of how often we tick. One "mistake" = one need-day at zero.
  const zeroHours =
    hoursAtZero(monster.fullness, n.hungerDecayPerHour, hours) +
    hoursAtZero(monster.energy, n.energyDecayPerHour, hours);
  const newCareMistakes = zeroHours / 24;

  // Good care (R7 fix): accrue longevity credit for time where ALL tracked needs
  // stayed above their warn thresholds (clean start required too). This is what the
  // lifespan longevity bonus reads; previously it was always 0 (dead path).
  const goodHours =
    monster.poopCount === 0 && monster.cleanliness > n.cleanlinessWarnThreshold
      ? Math.min(
          hoursAbove(monster.fullness, n.hungerDecayPerHour, n.hungerWarnThreshold, hours),
          hoursAbove(monster.energy, n.energyDecayPerHour, n.energyWarnThreshold, hours),
        )
      : 0;

  return {
    monster: {
      ...monster,
      fullness,
      cleanliness,
      energy,
      fatigue,
      poopCount,
      careMistakes: monster.careMistakes + newCareMistakes,
      goodCareDays: monster.goodCareDays + goodHours / 24,
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
