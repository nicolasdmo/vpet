// R14, R15 — Monster roster (species) and the branching evolution tree.
//
// SCOPE NOTE: the spec asks for 40+ monsters. This file ships a complete, REAL
// branching tree as a vertical slice (baby -> in-training -> rookie -> champion ->
// mega with multiple branches per stage) so every system can be exercised end to
// end. It is structured so the remaining species are added as pure data with no
// code changes. Reaching 40+ is tracked as the content-design task in the build
// report. Argentine-themed (folclore, fauna, mitología).

import type { EvolutionRule, MonsterSpecies, Technique } from '../types.ts';

const tech = (
  id: string,
  name: string,
  type: Technique['type'],
  power: number,
  mpCost: number,
  category: Technique['category'],
): Technique => ({ id, name, type, power, mpCost, category });

export const SPECIES: Record<string, MonsterSpecies> = {
  // ---- baby ----
  matecito: {
    id: 'matecito',
    name: 'Matecito',
    stage: 'baby',
    types: ['mito'],
    description:
      'Bebé redondito con forma de mate de calabaza, bombilla a modo de antena, ojitos grandes; vapor tibio sale por arriba.',
    baseStats: { hp: 40, mp: 20, fuerza: 8, defensa: 8, inteligencia: 8, agilidad: 8 },
    techniques: [tech('burbujeo', 'Burbujeo', 'mito', 8, 0, 'especial')],
  },

  // ---- in-training ----
  termito: {
    id: 'termito',
    name: 'Termito',
    stage: 'in-training',
    types: ['tierra'],
    description:
      'Criatura cuadrada de barro cocido tipo ladrillo, patitas cortas, mirada terca; defensivo.',
    baseStats: { hp: 70, mp: 25, fuerza: 14, defensa: 20, inteligencia: 10, agilidad: 9 },
    techniques: [tech('cabezazo', 'Cabezazo', 'tierra', 14, 2, 'fisico')],
  },
  chispita: {
    id: 'chispita',
    name: 'Chispita',
    stage: 'in-training',
    types: ['fuego'],
    description:
      'Brasa viva con piernitas, chispas saltando, expresión traviesa; ofensivo y veloz.',
    baseStats: { hp: 60, mp: 30, fuerza: 20, defensa: 10, inteligencia: 12, agilidad: 16 },
    techniques: [tech('chispazo', 'Chispazo', 'fuego', 16, 3, 'especial')],
  },

  // ---- rookie ----
  carpinchon: {
    id: 'carpinchon',
    name: 'Carpinchón',
    stage: 'rookie',
    types: ['bestia', 'tierra'],
    description:
      'Carpincho corpulento y sereno, pelaje marrón, postura tanque; aguanta de todo.',
    baseStats: { hp: 130, mp: 40, fuerza: 30, defensa: 38, inteligencia: 18, agilidad: 16 },
    techniques: [
      tech('embestida', 'Embestida', 'bestia', 26, 4, 'fisico'),
      tech('muralla', 'Muralla', 'tierra', 18, 3, 'fisico'),
    ],
  },
  hornerito: {
    id: 'hornerito',
    name: 'Hornerito',
    stage: 'rookie',
    types: ['planta'],
    description:
      'Pájaro hornero artesano con casco de barro, inteligente y metódico; ataques especiales.',
    baseStats: { hp: 100, mp: 70, fuerza: 20, defensa: 24, inteligencia: 40, agilidad: 28 },
    techniques: [
      tech('semillazo', 'Semillazo', 'planta', 24, 4, 'especial'),
      tech('picotazo', 'Picotazo', 'bestia', 18, 2, 'fisico'),
    ],
  },
  pomberito: {
    id: 'pomberito',
    name: 'Pomberito',
    stage: 'rookie',
    types: ['mito'],
    description:
      'Duende del monte petiso y peludo, sombrero de paja, sonrisa pícara; escurridizo.',
    baseStats: { hp: 95, mp: 75, fuerza: 22, defensa: 20, inteligencia: 36, agilidad: 36 },
    techniques: [
      tech('silbido', 'Silbido del monte', 'mito', 26, 4, 'especial'),
      tech('travesura', 'Travesura', 'mito', 16, 2, 'especial'),
    ],
  },
  pampero_jr: {
    id: 'pampero_jr',
    name: 'Pampero Jr.',
    stage: 'rookie',
    types: ['tormenta'],
    description:
      'Remolino de viento con ojos de relámpago, muy rápido; golpea antes que nadie.',
    baseStats: { hp: 95, mp: 60, fuerza: 28, defensa: 18, inteligencia: 26, agilidad: 44 },
    techniques: [
      tech('rafaga', 'Ráfaga', 'tormenta', 24, 4, 'especial'),
      tech('chicotazo', 'Chicotazo', 'tormenta', 18, 2, 'fisico'),
    ],
  },

  // ---- champion ----
  yaguarete_sombra: {
    id: 'yaguarete_sombra',
    name: 'Yaguareté Sombra',
    stage: 'champion',
    types: ['bestia', 'mito'],
    description:
      'Yaguareté espectral negro con manchas que brillan como brasas; depredador imponente.',
    baseStats: { hp: 200, mp: 90, fuerza: 60, defensa: 50, inteligencia: 40, agilidad: 55 },
    techniques: [
      tech('zarpazo', 'Zarpazo umbral', 'bestia', 40, 6, 'fisico'),
      tech('aullido', 'Aullido espectral', 'mito', 34, 5, 'especial'),
    ],
  },
  lobizon: {
    id: 'lobizon',
    name: 'Lobizón',
    stage: 'champion',
    types: ['bestia'],
    description:
      'Hombre-lobo del folclore, pelaje hirsuto bajo la luna, fuerza bruta y furia.',
    baseStats: { hp: 220, mp: 60, fuerza: 70, defensa: 48, inteligencia: 28, agilidad: 46 },
    techniques: [
      tech('dentellada', 'Dentellada', 'bestia', 46, 6, 'fisico'),
      tech('furia_lunar', 'Furia lunar', 'mito', 30, 5, 'especial'),
    ],
  },
  quebrachon: {
    id: 'quebrachon',
    name: 'Quebrachón',
    stage: 'champion',
    types: ['planta', 'tierra'],
    description:
      'Coloso de madera de quebracho, corteza durísima, raíces como puños; muralla viviente.',
    baseStats: { hp: 260, mp: 70, fuerza: 55, defensa: 75, inteligencia: 36, agilidad: 24 },
    techniques: [
      tech('raizazo', 'Raizazo', 'planta', 42, 6, 'fisico'),
      tech('corteza', 'Corteza férrea', 'tierra', 30, 4, 'fisico'),
    ],
  },
  tormenton: {
    id: 'tormenton',
    name: 'Tormentón',
    stage: 'champion',
    types: ['tormenta'],
    description:
      'Nube de tormenta con brazos de relámpago, truenos por voz; velocidad y daño especial.',
    baseStats: { hp: 190, mp: 110, fuerza: 44, defensa: 40, inteligencia: 62, agilidad: 64 },
    techniques: [
      tech('centella', 'Centella', 'tormenta', 44, 6, 'especial'),
      tech('granizo', 'Granizo', 'agua', 32, 5, 'especial'),
    ],
  },

  // ---- mega ----
  luz_mala: {
    id: 'luz_mala',
    name: 'Luz Mala',
    stage: 'mega',
    types: ['mito', 'fuego'],
    description:
      'Esfera de fuego fatuo flotante, halo verdoso y fantasmal, mirada hipnótica; poder arcano.',
    baseStats: { hp: 300, mp: 160, fuerza: 70, defensa: 70, inteligencia: 100, agilidad: 80 },
    techniques: [
      tech('fuego_fatuo', 'Fuego fatuo', 'fuego', 60, 8, 'especial'),
      tech('maldicion', 'Maldición', 'mito', 54, 7, 'especial'),
    ],
  },
  yaguarete_rey: {
    id: 'yaguarete_rey',
    name: 'Yaguareté Rey',
    stage: 'mega',
    types: ['bestia'],
    description:
      'Yaguareté monumental coronado, musculatura imponente, presencia de monarca del monte.',
    baseStats: { hp: 360, mp: 90, fuerza: 110, defensa: 85, inteligencia: 50, agilidad: 75 },
    techniques: [
      tech('zarpa_real', 'Zarpa real', 'bestia', 70, 8, 'fisico'),
      tech('rugido', 'Rugido del monte', 'bestia', 50, 6, 'especial'),
    ],
  },
  salamanca: {
    id: 'salamanca',
    name: 'Salamanca',
    stage: 'mega',
    types: ['mito', 'tierra'],
    description:
      'Entidad de la cueva mítica del folclore, roca y sombra, runas brillando; tanque arcano.',
    baseStats: { hp: 380, mp: 130, fuerza: 80, defensa: 100, inteligencia: 80, agilidad: 50 },
    techniques: [
      tech('temblor', 'Temblor', 'tierra', 62, 8, 'fisico'),
      tech('hechizo', 'Hechizo de cueva', 'mito', 56, 7, 'especial'),
    ],
  },
};

// R13 — Evolution rules. The engine evaluates these against how the monster was
// raised (stats, care mistakes, dominant type) and picks the first match by
// priority; every stage that can evolve also has a low-priority DEFAULT so a
// monster is never left without a path (edge case in spec).
export const EVOLUTION_RULES: EvolutionRule[] = [
  // baby -> in-training (branch by stat tendency)
  { from: 'matecito', to: 'chispita', conditions: { minStats: { fuerza: 12 } }, priority: 10 },
  { from: 'matecito', to: 'termito', conditions: {}, priority: 0 }, // default

  // in-training -> rookie
  { from: 'termito', to: 'carpinchon', conditions: { minStats: { defensa: 30 } }, priority: 10 },
  { from: 'termito', to: 'hornerito', conditions: { minStats: { inteligencia: 28 } }, priority: 9 },
  { from: 'termito', to: 'carpinchon', conditions: {}, priority: 0 }, // default
  { from: 'chispita', to: 'pampero_jr', conditions: { minStats: { agilidad: 34 } }, priority: 10 },
  { from: 'chispita', to: 'pomberito', conditions: { maxCareMistakes: 1 }, priority: 9 },
  { from: 'chispita', to: 'pomberito', conditions: {}, priority: 0 }, // default

  // rookie -> champion
  { from: 'carpinchon', to: 'quebrachon', conditions: { minStats: { defensa: 60 } }, priority: 10 },
  { from: 'carpinchon', to: 'lobizon', conditions: { minStats: { fuerza: 50 } }, priority: 9 },
  { from: 'carpinchon', to: 'lobizon', conditions: {}, priority: 0 },
  { from: 'hornerito', to: 'tormenton', conditions: { minStats: { inteligencia: 55 } }, priority: 10 },
  { from: 'hornerito', to: 'quebrachon', conditions: {}, priority: 0 },
  { from: 'pomberito', to: 'yaguarete_sombra', conditions: { minStats: { agilidad: 45 } }, priority: 10 },
  { from: 'pomberito', to: 'yaguarete_sombra', conditions: {}, priority: 0 },
  { from: 'pampero_jr', to: 'tormenton', conditions: {}, priority: 0 },

  // champion -> mega
  { from: 'yaguarete_sombra', to: 'yaguarete_rey', conditions: { minStats: { fuerza: 90 } }, priority: 10 },
  { from: 'yaguarete_sombra', to: 'luz_mala', conditions: {}, priority: 0 },
  { from: 'lobizon', to: 'yaguarete_rey', conditions: {}, priority: 0 },
  { from: 'quebrachon', to: 'salamanca', conditions: {}, priority: 0 },
  { from: 'tormenton', to: 'luz_mala', conditions: {}, priority: 0 },
];
