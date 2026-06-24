// R21–R25 — Combat resolution.
// Automatic (Digivice-style): no player input during the fight. PURE and
// deterministic given an injected RNG, so it runs SERVER-SIDE (R22) and is testable.
// Uses the 6 stats + techniques (MP cost) + type affinities + bounded variance.

import type { BalanceConfig } from './config/balance.ts';
import type { ElementType, HealthStatus, StatBlock, Technique } from './types.ts';
import { typeEffectiveness } from './data/elementTypes.ts';

export interface Combatant {
  id: string;
  stats: StatBlock;
  types: ElementType[];
  techniques: Technique[];
  health: HealthStatus;
  fatigue: number; // 0..100
}

export interface RoundEntry {
  round: number;
  attacker: string;
  technique: string;
  damage: number;
  effectiveness: number;
  defenderHpLeft: number;
}

export interface BattleResult {
  winnerId: string | null; // null = draw (tie-break still applied; null only if exactly equal)
  reason: 'ko' | 'rounds';
  log: RoundEntry[];
  finalHp: Record<string, number>;
}

// Deterministic RNG (mulberry32) so server resolution + tests are reproducible.
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function statusMultiplier(c: Combatant, cfg: BalanceConfig): number {
  let m = 1;
  if (c.health === 'sick') m *= cfg.combat.sickStatMultiplier;
  if (c.health === 'injured') m *= cfg.combat.injuredStatMultiplier;
  if (c.fatigue >= 50) m *= cfg.combat.fatiguedStatMultiplier;
  return m;
}

const BASIC_ATTACK = (type: ElementType): Technique => ({
  id: 'basico',
  name: 'Golpe básico',
  type,
  power: 15,
  mpCost: 0,
  category: 'fisico',
});

// Pick the affordable technique with the highest base power; fall back to a free basic.
function chooseTechnique(c: Combatant, mp: number): Technique {
  const affordable = c.techniques
    .filter((t) => t.mpCost <= mp)
    .sort((a, b) => b.power - a.power);
  return affordable[0] ?? BASIC_ATTACK(c.types[0] ?? 'bestia');
}

function computeDamage(
  attacker: Combatant,
  defender: Combatant,
  tech: Technique,
  cfg: BalanceConfig,
  rng: () => number,
): { damage: number; effectiveness: number } {
  const atkMult = statusMultiplier(attacker, cfg);
  const defMult = statusMultiplier(defender, cfg);
  const atkStat =
    (tech.category === 'fisico' ? attacker.stats.fuerza : attacker.stats.inteligencia) *
    atkMult;
  const defStat = Math.max(1, defender.stats.defensa * defMult);

  const statFactor = atkStat / (defStat * cfg.combat.attackDefenseScale + 1);
  const eff = typeEffectiveness(tech.type, defender.types);
  const variance =
    cfg.combat.minVariance + rng() * (cfg.combat.maxVariance - cfg.combat.minVariance);

  const raw =
    cfg.combat.baseDamage * (tech.power / 100) * statFactor * eff * variance;
  return { damage: Math.max(1, Math.round(raw)), effectiveness: eff };
}

export function resolveBattle(
  a: Combatant,
  b: Combatant,
  cfg: BalanceConfig,
  rng: () => number,
): BattleResult {
  const hp: Record<string, number> = { [a.id]: a.stats.hp, [b.id]: b.stats.hp };
  const mp: Record<string, number> = { [a.id]: a.stats.mp, [b.id]: b.stats.mp };
  const log: RoundEntry[] = [];

  // Faster monster acts first each round (Agilidad), with status applied.
  const aSpeed = a.stats.agilidad * statusMultiplier(a, cfg);
  const bSpeed = b.stats.agilidad * statusMultiplier(b, cfg);
  const order: [Combatant, Combatant] = aSpeed >= bSpeed ? [a, b] : [b, a];

  for (let round = 1; round <= cfg.combat.maxRounds; round++) {
    for (const attacker of order) {
      const defender = attacker.id === a.id ? b : a;
      if (hp[a.id] <= 0 || hp[b.id] <= 0) break;

      const tech = chooseTechnique(attacker, mp[attacker.id]);
      mp[attacker.id] -= tech.mpCost;
      const { damage, effectiveness } = computeDamage(attacker, defender, tech, cfg, rng);
      hp[defender.id] = Math.max(0, hp[defender.id] - damage);
      log.push({
        round,
        attacker: attacker.id,
        technique: tech.name,
        damage,
        effectiveness,
        defenderHpLeft: hp[defender.id],
      });
    }
    if (hp[a.id] <= 0 || hp[b.id] <= 0) {
      const winnerId = hp[a.id] <= 0 ? b.id : a.id;
      return { winnerId, reason: 'ko', log, finalHp: hp };
    }
  }

  // Round limit: winner is the one with the higher remaining HP fraction (R23).
  const aFrac = hp[a.id] / a.stats.hp;
  const bFrac = hp[b.id] / b.stats.hp;
  let winnerId: string | null;
  if (aFrac > bFrac) winnerId = a.id;
  else if (bFrac > aFrac) winnerId = b.id;
  else winnerId = null; // exact draw -> caller decides (deterministic tie-break upstream)
  return { winnerId, reason: 'rounds', log, finalHp: hp };
}
