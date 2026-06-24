// Factory for creating a fresh MonsterInstance from a species (egg hatch / new game).

import type { BalanceConfig } from './config/balance.ts';
import type { MonsterInstance, Stat, StatBlock } from './types.ts';
import { SPECIES } from './data/monsters.ts';

const ZERO_STATS: StatBlock = {
  hp: 0, mp: 0, fuerza: 0, defensa: 0, inteligencia: 0, agilidad: 0,
};

export interface SpawnOptions {
  now: number; // server time (epoch ms)
  cfg: BalanceConfig;
  generation?: number;
  inheritedStatBonus?: StatBlock;
  extraTechniques?: MonsterInstance['techniques'];
}

export function createMonster(speciesId: string, opts: SpawnOptions): MonsterInstance {
  const species = SPECIES[speciesId];
  if (!species) throw new Error(`Unknown species: ${speciesId}`);

  const bonus = opts.inheritedStatBonus ?? { ...ZERO_STATS };
  const stats = {} as StatBlock;
  for (const k of Object.keys(species.baseStats) as Stat[]) {
    stats[k] = species.baseStats[k] + (bonus[k] ?? 0);
  }

  const techById = new Map(species.techniques.map((t) => [t.id, t]));
  for (const t of opts.extraTechniques ?? []) if (!techById.has(t.id)) techById.set(t.id, t);

  return {
    speciesId,
    stage: species.stage,
    stats,
    techniques: [...techById.values()],
    fullness: 80,
    cleanliness: 100,
    energy: 100,
    fatigue: 0,
    health: 'healthy',
    poopCount: 0,
    bornAt: opts.now,
    ageHours: 0,
    effectiveLifespanHours: opts.cfg.lifespan.baseHours,
    alive: true,
    careMistakes: 0,
    goodCareDays: 0,
    generation: opts.generation ?? 1,
    inheritedStatBonus: bonus,
    lastUpdated: opts.now,
  };
}
