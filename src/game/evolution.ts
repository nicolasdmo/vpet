// R13, R16 — Evolution rule engine.
// Given a monster and the evolution rules, pick the destination species by
// evaluating raise-conditions in priority order. The first matching rule wins;
// a stage always has a low-priority default so there's never a dead end.

import type {
  EvolutionRule,
  MonsterInstance,
  MonsterSpecies,
  Stat,
  StatBlock,
} from './types.ts';
import { EVOLUTION_RULES, SPECIES } from './data/monsters.ts';

function meetsConditions(
  monster: MonsterInstance,
  rule: EvolutionRule,
  species: MonsterSpecies,
): boolean {
  const c = rule.conditions;
  if (c.maxCareMistakes !== undefined && monster.careMistakes > c.maxCareMistakes)
    return false;
  if (c.requiredType && !species.types.includes(c.requiredType)) return false;
  if (c.minStats) {
    for (const key of Object.keys(c.minStats) as Stat[]) {
      if (monster.stats[key] < (c.minStats[key] ?? 0)) return false;
    }
  }
  return true;
}

// Returns the species id the monster should evolve into, or null if it can't yet
// (no rule for its current species — e.g. it's already a mega).
export function resolveEvolution(
  monster: MonsterInstance,
  rules: EvolutionRule[] = EVOLUTION_RULES,
): string | null {
  const species = SPECIES[monster.speciesId];
  if (!species) return null;
  const candidates = rules
    .filter((r) => r.from === monster.speciesId)
    .sort((a, b) => b.priority - a.priority);
  for (const rule of candidates) {
    if (meetsConditions(monster, rule, species)) return rule.to;
  }
  return null;
}

// Apply an evolution: adopt the target stage/types/techniques, keeping accumulated
// training as a delta over the previous species' base stats so progress is retained.
export function evolve(monster: MonsterInstance, toSpeciesId: string): MonsterInstance {
  const from = SPECIES[monster.speciesId];
  const to = SPECIES[toSpeciesId];
  if (!to) throw new Error(`Unknown species: ${toSpeciesId}`);

  const stats = {} as StatBlock;
  const keys: Stat[] = ['hp', 'mp', 'fuerza', 'defensa', 'inteligencia', 'agilidad'];
  for (const k of keys) {
    const trainedDelta = monster.stats[k] - (from ? from.baseStats[k] : 0);
    stats[k] = to.baseStats[k] + Math.max(0, trainedDelta);
  }

  // Merge learned/inherited techniques with the new species' kit (dedupe by id).
  const techById = new Map(to.techniques.map((t) => [t.id, t]));
  for (const t of monster.techniques) if (!techById.has(t.id)) techById.set(t.id, t);

  return {
    ...monster,
    speciesId: to.id,
    stage: to.stage,
    stats,
    techniques: [...techById.values()],
  };
}
