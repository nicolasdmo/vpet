// R24 — Element/affinity system (Pokémon-style), Argentine-themed.
// Full set of types + advantage matrix. Multiplier = damage dealt BY attacker type
// AGAINST defender type. 2 = super effective, 0.5 = not very effective, 1 = neutral.
// This matrix is data and fully tunable.

import type { ElementType } from '../types.ts';

export const ELEMENT_TYPES: ElementType[] = [
  'fuego',
  'agua',
  'planta',
  'tierra',
  'tormenta',
  'bestia',
  'mito',
];

export const TYPE_LABELS: Record<ElementType, string> = {
  fuego: 'Fuego (Brasa)',
  agua: 'Agua (Río)',
  planta: 'Planta (Pampa)',
  tierra: 'Tierra (Roca)',
  tormenta: 'Tormenta (Pampero)',
  bestia: 'Bestia (Fauna)',
  mito: 'Mito (Folclore)',
};

// matrix[attacker][defender]
export const TYPE_MATRIX: Record<ElementType, Record<ElementType, number>> = {
  fuego: { fuego: 1, agua: 0.5, planta: 2, tierra: 1, tormenta: 1, bestia: 1, mito: 1 },
  agua: { fuego: 2, agua: 1, planta: 0.5, tierra: 2, tormenta: 0.5, bestia: 1, mito: 1 },
  planta: { fuego: 0.5, agua: 2, planta: 1, tierra: 2, tormenta: 1, bestia: 0.5, mito: 1 },
  tierra: { fuego: 1, agua: 1, planta: 0.5, tierra: 1, tormenta: 2, bestia: 1, mito: 0.5 },
  tormenta: { fuego: 1, agua: 2, planta: 1, tierra: 0.5, tormenta: 1, bestia: 1, mito: 1 },
  bestia: { fuego: 1, agua: 1, planta: 2, tierra: 1, tormenta: 1, bestia: 1, mito: 2 },
  mito: { fuego: 1, agua: 1, planta: 1, tierra: 2, tormenta: 1, bestia: 0.5, mito: 1 },
};

// Effectiveness of an attacking technique type against a defender that may have
// multiple types: multipliers stack.
export function typeEffectiveness(
  attackType: ElementType,
  defenderTypes: ElementType[],
): number {
  return defenderTypes.reduce(
    (mult, def) => mult * (TYPE_MATRIX[attackType]?.[def] ?? 1),
    1,
  );
}
