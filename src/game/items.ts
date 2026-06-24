// R29 — Care items (at minimum curita and jeringa) and their use.
// How items are obtained is configurable; by default they're bought with points
// (see economy in the spec open questions). This module only models their effect.

import type { MonsterInstance } from './types.ts';

export interface Item {
  id: string;
  name: string;
  cures: 'injured' | 'sick';
  pointCost: number;
}

export const ITEMS: Record<string, Item> = {
  curita: { id: 'curita', name: 'Curita', cures: 'injured', pointCost: 20 },
  jeringa: { id: 'jeringa', name: 'Jeringa', cures: 'sick', pointCost: 35 },
};

export function useItem(monster: MonsterInstance, itemId: string): MonsterInstance {
  const item = ITEMS[itemId];
  if (!item) throw new Error(`Unknown item: ${itemId}`);
  if (monster.health === item.cures) {
    return { ...monster, health: 'healthy' };
  }
  return monster; // no-op if the ailment isn't present
}
