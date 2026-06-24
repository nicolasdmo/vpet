// R6 — Foods with distinct effects (Digimon-style: meat sizes, mushroom, fish, fruit).
// Effects are data; the magnitudes feed off balance where relevant. Tunable here.

import type { Stat } from '../types.ts';

export interface Food {
  id: string;
  name: string;
  fullness: number; // restores fullness
  energy: number; // +/- energy
  cleanlinessCost: number; // some foods make a mess
  health: 'none' | 'cure-sick'; // basic medicinal foods
  // Slight stat tendency nudges over time (Digimon-style diet shaping).
  statTendency?: Partial<Record<Stat, number>>;
  // Some foods extend lifespan (R7).
  lifespanBonusHours?: number;
}

export const FOODS: Record<string, Food> = {
  carne_chica: {
    id: 'carne_chica',
    name: 'Carne chica',
    fullness: 20,
    energy: 5,
    cleanlinessCost: 5,
    health: 'none',
    statTendency: { fuerza: 1 },
  },
  carne_grande: {
    id: 'carne_grande',
    name: 'Carne grande (asado)',
    fullness: 45,
    energy: 10,
    cleanlinessCost: 12,
    health: 'none',
    statTendency: { fuerza: 2, hp: 1 },
  },
  hongo: {
    id: 'hongo',
    name: 'Hongo',
    fullness: 15,
    energy: -5,
    cleanlinessCost: 4,
    health: 'none',
    statTendency: { inteligencia: 2, mp: 1 },
  },
  pescado: {
    id: 'pescado',
    name: 'Pescado de río',
    fullness: 30,
    energy: 8,
    cleanlinessCost: 6,
    health: 'none',
    statTendency: { agilidad: 1, defensa: 1 },
  },
  fruta: {
    id: 'fruta',
    name: 'Fruta',
    fullness: 18,
    energy: 12,
    cleanlinessCost: 3,
    health: 'none',
    statTendency: { agilidad: 1 },
  },
  // A lifespan-extending delicacy (R7).
  yerba_mate: {
    id: 'yerba_mate',
    name: 'Mate',
    fullness: 8,
    energy: 20,
    cleanlinessCost: 2,
    health: 'none',
    lifespanBonusHours: 12,
  },
};
