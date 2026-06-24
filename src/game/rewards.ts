// R32 — Battle rewards: winning grants experience and points (points are the
// currency for items, R29). Pure + config-driven so the server (resolve-battle
// Edge Function) applies it authoritatively and it's unit-testable.

import type { BalanceConfig } from './config/balance.ts';

export interface PlayerProgress {
  exp: number;
  points: number;
  battles: number;
  wins: number;
}

export const EMPTY_PROGRESS: PlayerProgress = { exp: 0, points: 0, battles: 0, wins: 0 };

// Apply the outcome of one battle to a player's progress.
export function applyBattleRewards(
  progress: PlayerProgress,
  didWin: boolean,
  cfg: BalanceConfig,
): PlayerProgress {
  const r = cfg.rewards;
  return {
    exp: progress.exp + (didWin ? r.expWin : r.expLoss),
    points: progress.points + (didWin ? r.pointsWin : r.pointsLoss),
    battles: progress.battles + 1,
    wins: progress.wins + (didWin ? 1 : 0),
  };
}

// Win percentage (R33). Returns 0 when the player hasn't fought yet.
export function winPercentage(progress: PlayerProgress): number {
  if (progress.battles === 0) return 0;
  return Math.round((progress.wins / progress.battles) * 1000) / 10;
}
