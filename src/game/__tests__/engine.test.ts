import { test } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_BALANCE as CFG } from '../config/balance.ts';
import { createMonster } from '../spawn.ts';
import { simulateNeeds, needsAttention, cleanUp } from '../needs.ts';
import { feed } from '../foods.ts';
import { advanceAge } from '../lifespan.ts';
import { train } from '../training.ts';
import { resolveEvolution, evolve } from '../evolution.ts';
import { computeInheritedBonus, hatchHeir } from '../inheritance.ts';
import { resolveBattle, makeRng, type Combatant } from '../combat.ts';
import { applyBattleAftermath } from '../aftermath.ts';
import { typeEffectiveness } from '../data/elementTypes.ts';
import { useItem } from '../items.ts';
import { SPECIES } from '../data/monsters.ts';
import type { Stat } from '../types.ts';

const T0 = 1_700_000_000_000;
const hours = (h: number) => T0 + h * 3_600_000;

// ---- R4/R5 needs simulation from timestamps ----
test('needs decay over elapsed time using server now', () => {
  const m = createMonster('matecito', { now: T0, cfg: CFG });
  const { monster } = simulateNeeds(m, hours(5), CFG);
  assert.equal(monster.fullness, 80 - CFG.needs.hungerDecayPerHour * 5);
  assert.equal(monster.energy, 100 - CFG.needs.energyDecayPerHour * 5);
  assert.equal(monster.lastUpdated, hours(5));
});

test('needs never go below zero and accrue a care mistake when starved', () => {
  const m = createMonster('matecito', { now: T0, cfg: CFG });
  const { monster, newCareMistakes } = simulateNeeds(m, hours(48), CFG);
  assert.equal(monster.fullness, 0);
  assert.ok(newCareMistakes >= 1);
  assert.ok(monster.careMistakes >= 1);
});

test('needsAttention flags hunger below threshold and cleanUp resets mess', () => {
  let m = createMonster('matecito', { now: T0, cfg: CFG });
  m = simulateNeeds(m, hours(10), CFG).monster;
  assert.equal(needsAttention(m, CFG).hungry, true);
  m = { ...m, cleanliness: 0, poopCount: 3 };
  m = cleanUp(m);
  assert.equal(m.cleanliness, 100);
  assert.equal(m.poopCount, 0);
});

// ---- R6 foods with distinct effects ----
test('feeding restores fullness and applies distinct stat tendencies', () => {
  const m = createMonster('matecito', { now: T0, cfg: CFG });
  const before = m.stats.fuerza;
  const fed = feed({ ...m, fullness: 10 }, 'carne_grande');
  assert.ok(fed.fullness > 10);
  assert.equal(fed.stats.fuerza, before + 2); // carne_grande nudges fuerza
});

test('mate extends lifespan (R7 food longevity)', () => {
  const m = createMonster('matecito', { now: T0, cfg: CFG });
  const fed = feed(m, 'yerba_mate');
  assert.equal(fed.effectiveLifespanHours, m.effectiveLifespanHours + 12);
});

// ---- R7/R8 aging and death ----
test('monster dies of old age past its effective lifespan', () => {
  const m = createMonster('matecito', { now: T0, cfg: CFG });
  const past = hours(CFG.lifespan.baseHours + 1);
  const { monster, justDied } = advanceAge(m, past, CFG);
  assert.equal(justDied, true);
  assert.equal(monster.alive, false);
});

test('care mistakes shorten lifespan', () => {
  const m = { ...createMonster('matecito', { now: T0, cfg: CFG }), careMistakes: 5 };
  // At a time before base lifespan but after the penalty-reduced one, it should die.
  const reduced = CFG.lifespan.baseHours - 5 * CFG.lifespan.hoursLostPerCareMistake;
  const { justDied } = advanceAge(m, hours(reduced + 1), CFG);
  assert.equal(justDied, true);
});

// ---- R10/R11/R12 training ----
test('played training yields more than auto and costs energy', () => {
  const m = createMonster('matecito', { now: T0, cfg: CFG });
  const auto = train(m, 'pesas', { mode: 'auto' }, CFG);
  const play = train(m, 'pesas', { mode: 'play', score: 1 }, CFG);
  assert.ok(play.statGained > auto.statGained);
  assert.ok(auto.monster.energy < m.energy);
  assert.equal(auto.monster.stats.fuerza, m.stats.fuerza + CFG.training.autoPoints);
});

// ---- R13 evolution depends on how it was raised ----
test('evolution branches on stats and falls back to a default', () => {
  const base = createMonster('matecito', { now: T0, cfg: CFG });
  // High fuerza -> chispita branch.
  const strong = { ...base, stats: { ...base.stats, fuerza: 20 } };
  assert.equal(resolveEvolution(strong), 'chispita');
  // Low everything -> default termito.
  assert.equal(resolveEvolution(base), 'termito');
});

test('evolve retains trained stat gains as a delta', () => {
  let m = createMonster('matecito', { now: T0, cfg: CFG });
  m = { ...m, stats: { ...m.stats, fuerza: m.stats.fuerza + 10 } }; // trained +10
  const target = resolveEvolution(m)!;
  const evolved = evolve(m, target);
  assert.equal(evolved.speciesId, target);
  assert.notEqual(evolved.stage, 'baby');
  // trained delta (+10) carried on top of new base
  assert.ok(evolved.stats.fuerza >= 10);
});

// ---- R18/R19/R20 inheritance with cap ----
test('heir inherits techniques and a capped accumulated stat bonus', () => {
  let dead = createMonster('luz_mala', { now: T0, cfg: CFG });
  dead = { ...dead, generation: 3 };
  const bonus = computeInheritedBonus(dead, CFG);
  for (const k of Object.keys(bonus) as Stat[]) {
    assert.ok(bonus[k] <= CFG.inheritance.maxAccumulatedBonusPerStat);
  }
  const heir = hatchHeir(dead, hours(1), CFG);
  assert.equal(heir.generation, 4);
  assert.equal(heir.stage, 'baby');
  assert.equal(heir.techniques.length >= 1, true);
});

test('inheritance bonus never exceeds the cap even across many generations', () => {
  let dead = createMonster('salamanca', { now: T0, cfg: CFG });
  // Simulate an absurd prior bonus already at the cap.
  const capped = CFG.inheritance.maxAccumulatedBonusPerStat;
  dead = {
    ...dead,
    inheritedStatBonus: {
      hp: capped, mp: capped, fuerza: capped, defensa: capped, inteligencia: capped, agilidad: capped,
    },
  };
  const bonus = computeInheritedBonus(dead, CFG);
  for (const k of Object.keys(bonus) as Stat[]) assert.equal(bonus[k], capped);
});

// ---- R24 type matrix ----
test('type effectiveness: agua super effective vs fuego, resisted by planta', () => {
  assert.equal(typeEffectiveness('agua', ['fuego']), 2);
  assert.equal(typeEffectiveness('agua', ['planta']), 0.5);
  // dual-type stacks
  assert.equal(typeEffectiveness('agua', ['fuego', 'tierra']), 4);
});

// ---- R21/R22/R23 combat ----
function combatantFrom(id: string, speciesStats: any, types: any, techs: any): Combatant {
  return { id, stats: speciesStats, types, techniques: techs, health: 'healthy', fatigue: 0 };
}

test('combat is deterministic for a fixed seed and produces a winner', () => {
  const mega = createMonster('yaguarete_rey', { now: T0, cfg: CFG });
  const baby = createMonster('matecito', { now: T0, cfg: CFG });
  const A = combatantFrom('A', mega.stats, SPECIES[mega.speciesId].types, mega.techniques);
  const B = combatantFrom('B', baby.stats, SPECIES[baby.speciesId].types, baby.techniques);
  const r1 = resolveBattle(A, B, CFG, makeRng(42));
  const r2 = resolveBattle(A, B, CFG, makeRng(42));
  assert.equal(r1.winnerId, 'A'); // mega crushes baby
  assert.deepEqual(r1.finalHp, r2.finalHp); // deterministic
  assert.ok(r1.log.length > 0);
});

test('combat respects type advantage between equal stats', () => {
  const stats = { hp: 150, mp: 100, fuerza: 40, defensa: 40, inteligencia: 40, agilidad: 40 };
  const fireTech = [{ id: 'f', name: 'F', type: 'fuego' as const, power: 50, mpCost: 0, category: 'especial' as const }];
  const waterTech = [{ id: 'w', name: 'W', type: 'agua' as const, power: 50, mpCost: 0, category: 'especial' as const }];
  const fire = combatantFrom('fire', { ...stats }, ['fuego'], fireTech);
  const water = combatantFrom('water', { ...stats }, ['agua'], waterTech);
  // Run several seeds; water should win the clear majority due to type advantage.
  let waterWins = 0;
  for (let s = 0; s < 25; s++) {
    if (resolveBattle(fire, water, CFG, makeRng(s)).winnerId === 'water') waterWins++;
  }
  assert.ok(waterWins >= 20, `water won ${waterWins}/25`);
});

// ---- R26/R27/R28 aftermath ----
test('aftermath adds fatigue and can contract illness from a sick opponent', () => {
  const m = createMonster('carpinchon', { now: T0, cfg: CFG });
  const tired = applyBattleAftermath(m, { opponentWasSick: false }, CFG, makeRng(1));
  assert.equal(tired.fatigue, CFG.ailments.fatiguePerBattle);
  // Sequenced RNG: 1st roll (injury) high = no injury, 2nd roll (contagion) 0 = infect.
  const seq = [0.99, 0];
  let i = 0;
  const sicken = applyBattleAftermath(m, { opponentWasSick: true }, CFG, () => seq[i++]);
  assert.equal(sicken.health, 'sick');
});

// ---- R29 items ----
test('jeringa cures sick, curita cures injured, no-op otherwise', () => {
  const m = createMonster('matecito', { now: T0, cfg: CFG });
  assert.equal(useItem({ ...m, health: 'sick' }, 'jeringa').health, 'healthy');
  assert.equal(useItem({ ...m, health: 'injured' }, 'curita').health, 'healthy');
  assert.equal(useItem({ ...m, health: 'sick' }, 'curita').health, 'sick'); // wrong item
});
