// Core domain types for the Bicho Battler game engine.
// Framework-agnostic: no Next.js / Supabase imports here so this can be unit-tested
// and reused on both client and server (combat resolution runs server-side, R22).

export type Stat = 'hp' | 'mp' | 'fuerza' | 'defensa' | 'inteligencia' | 'agilidad';

export type StatBlock = Record<Stat, number>;

export type EvolutionStage =
  | 'baby'
  | 'in-training'
  | 'rookie'
  | 'champion'
  | 'mega';

// Element/affinity types (R24). Argentine-themed; the full set + advantage matrix
// lives in data/elementTypes.ts. Kept as a string union of ids referenced by data.
export type ElementType =
  | 'fuego' // asado / brasa
  | 'agua' // río / mar
  | 'planta' // pampa / monte
  | 'tierra' // roca / montaña
  | 'tormenta' // rayo / pampero
  | 'bestia' // fauna
  | 'mito'; // folclore / espíritu

export type HealthStatus = 'healthy' | 'sick' | 'injured';

export interface Technique {
  id: string;
  name: string;
  type: ElementType;
  power: number; // base power, scaled by stats + balance in combat
  mpCost: number;
  // 'fisico' uses fuerza/defensa, 'especial' uses inteligencia/defensa.
  category: 'fisico' | 'especial';
}

// A monster *species* / node in the evolution tree (R14, R15). Pure data.
export interface MonsterSpecies {
  id: string;
  name: string;
  stage: EvolutionStage;
  types: ElementType[];
  // Description rich enough to generate a sprite from (R15).
  description: string;
  // Storage key for the sprite asset in Supabase Storage (R17). May be missing
  // for not-yet-arted species; the UI falls back to a placeholder.
  spriteKey?: string;
  // Base stats / tendencies at this stage.
  baseStats: StatBlock;
  // Techniques this species can naturally use.
  techniques: Technique[];
}

// A single evolution path (R13). The engine evaluates conditions against how the
// monster was raised and picks a destination.
export interface EvolutionRule {
  from: string; // species id
  to: string; // species id
  conditions: {
    minStats?: Partial<StatBlock>;
    maxCareMistakes?: number;
    requiredType?: ElementType;
  };
  // Higher priority rules are evaluated first; the first match wins.
  priority: number;
}

// The live, mutable instance the player is raising (one active at a time, R3).
export interface MonsterInstance {
  speciesId: string;
  stage: EvolutionStage;
  // Current stats (base + training + inheritance bonuses).
  stats: StatBlock;
  techniques: Technique[];

  // Real-time care state (R4, R5). Meters run 0..100, higher = better.
  fullness: number;
  cleanliness: number;
  energy: number;
  fatigue: number; // 0..100, higher = more tired (R26)
  health: HealthStatus;
  poopCount: number;

  // Lifecycle (R7, R8).
  bornAt: number; // epoch ms (server time)
  ageHours: number;
  effectiveLifespanHours: number;
  alive: boolean;

  // Care quality tracking, drives lifespan + evolution branch (R7, R13).
  careMistakes: number;
  goodCareDays: number;

  // Generation + accumulated inheritance bonus, capped (R19, R20).
  generation: number;
  inheritedStatBonus: StatBlock;

  // Bookkeeping for time simulation.
  lastUpdated: number; // epoch ms (server time)
}
