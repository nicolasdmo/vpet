// R18, R19, R20 — Generational inheritance.
// When the active monster dies, an egg hatches into a new baby that inherits:
//  - a subset of the deceased's techniques (R18), and
//  - a stat bonus derived from the deceased's FINAL stats (R19),
// accumulated across generations but clamped to a per-stat cap so the lineage
// improves gradually and never becomes abusive (R20). All factors come from config.

import type { BalanceConfig } from './config/balance.ts';
import type { MonsterInstance, Stat, StatBlock, Technique } from './types.ts';
import { createMonster } from './spawn.ts';

const STAT_KEYS: Stat[] = ['hp', 'mp', 'fuerza', 'defensa', 'inteligencia', 'agilidad'];

// Compute the heir's accumulated bonus from the deceased's final stats + prior bonus.
export function computeInheritedBonus(
  deceased: MonsterInstance,
  cfg: BalanceConfig,
): StatBlock {
  const inh = cfg.inheritance;
  const prev = deceased.inheritedStatBonus;
  const out = {} as StatBlock;
  for (const k of STAT_KEYS) {
    const added = Math.floor(deceased.stats[k] * inh.statBonusFraction);
    out[k] = Math.min(inh.maxAccumulatedBonusPerStat, prev[k] + added);
  }
  return out;
}

// Pick which techniques the heir inherits (strongest first, by power).
export function pickInheritedTechniques(
  deceased: MonsterInstance,
  cfg: BalanceConfig,
): Technique[] {
  return [...deceased.techniques]
    .sort((a, b) => b.power - a.power)
    .slice(0, cfg.inheritance.inheritedTechniqueCount);
}

// Hatch the heir. The baby species id is configurable per game; default to 'matecito'.
export function hatchHeir(
  deceased: MonsterInstance,
  now: number,
  cfg: BalanceConfig,
  babySpeciesId = 'matecito',
): MonsterInstance {
  return createMonster(babySpeciesId, {
    now,
    cfg,
    generation: deceased.generation + 1,
    inheritedStatBonus: computeInheritedBonus(deceased, cfg),
    extraTechniques: pickInheritedTechniques(deceased, cfg),
  });
}
