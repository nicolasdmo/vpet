// R10, R11, R12 — Training. A session targets one stat via a minigame. Auto-resolve
// grants flat points; playing grants more, scaled by a performance score (0..1).
// Training costs energy + hunger and adds fatigue, so care and training trade off.

import type { BalanceConfig } from './config/balance.ts';
import type { MonsterInstance } from './types.ts';
import { MINIGAMES } from './data/minigames.ts';

const clamp = (v: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, v));

export interface TrainOptions {
  // 'auto' = flat points; 'play' = scaled by `score` (0..1).
  mode: 'auto' | 'play';
  score?: number; // required for 'play', clamped to 0..1
}

export interface TrainResult {
  monster: MonsterInstance;
  statGained: number;
}

export function train(
  monster: MonsterInstance,
  minigameId: string,
  opts: TrainOptions,
  cfg: BalanceConfig,
): TrainResult {
  const mg = MINIGAMES[minigameId];
  if (!mg) throw new Error(`Unknown minigame: ${minigameId}`);

  const t = cfg.training;
  let gain: number;
  if (opts.mode === 'auto') {
    gain = t.autoPoints;
  } else {
    const score = clamp(opts.score ?? 0, 0, 1);
    // Playing always beats auto at decent performance; floor at autoPoints.
    gain = Math.max(t.autoPoints, Math.round(t.maxPlayPoints * score));
  }

  // Soft cap: gains taper as the stat approaches the cap.
  const current = monster.stats[mg.stat];
  if (current >= t.statSoftCap) gain = 0;

  const stats = { ...monster.stats, [mg.stat]: current + gain };

  return {
    monster: {
      ...monster,
      stats,
      energy: clamp(monster.energy - t.energyCostPerSession, 0, 100),
      fullness: clamp(monster.fullness - t.hungerCostPerSession, 0, 100),
      fatigue: clamp(monster.fatigue + cfg.ailments.fatiguePerTrainingSession, 0, 100),
    },
    statGained: gain,
  };
}
