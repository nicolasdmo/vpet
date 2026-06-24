// R26, R27, R28 — Post-battle consequences: fatigue, rare injury, contagious illness.
// Pure + RNG-injected so it resolves server-side alongside combat.

import type { BalanceConfig } from './config/balance.ts';
import type { MonsterInstance } from './types.ts';

const clamp = (v: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, v));

export interface AftermathInput {
  opponentWasSick: boolean;
}

export function applyBattleAftermath(
  monster: MonsterInstance,
  input: AftermathInput,
  cfg: BalanceConfig,
  rng: () => number,
): MonsterInstance {
  let health = monster.health;

  // Injury: low probability, only if currently healthy (R27).
  if (health === 'healthy' && rng() < cfg.ailments.injuryChanceAfterBattle) {
    health = 'injured';
  }
  // Contagion: fighting a sick opponent can make you sick (R28).
  if (
    health === 'healthy' &&
    input.opponentWasSick &&
    rng() < cfg.ailments.contagionChanceVsSickOpponent
  ) {
    health = 'sick';
  }

  return {
    ...monster,
    health,
    fatigue: clamp(monster.fatigue + cfg.ailments.fatiguePerBattle, 0, 100),
  };
}
