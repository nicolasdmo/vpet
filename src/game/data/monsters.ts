// R14, R15 — Monster roster (species) and the branching evolution tree.
//
// 40+ species across the five stages (baby → in-training → rookie → champion →
// mega) with multiple branches per stage, each defined purely as data (name, type,
// stage, description for sprite generation, base stats, techniques). Argentine-
// themed: fauna, folclore, mitología, paisajes, comidas.

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
  // =====================================================================
  // BABY
  // =====================================================================
  matecito: {
    id: 'matecito', name: 'Matecito', stage: 'baby', types: ['mito'],
    spriteKey: 'matecito',
    description: 'Bebé redondo con forma de mate de calabaza, bombilla a modo de antena, ojitos grandes; sale vapor tibio.',
    baseStats: { hp: 40, mp: 20, fuerza: 8, defensa: 8, inteligencia: 8, agilidad: 8 },
    techniques: [tech('burbujeo', 'Burbujeo', 'mito', 8, 0, 'especial')],
  },
  terroncito: {
    id: 'terroncito', name: 'Terroncito', stage: 'baby', types: ['tierra'],
    spriteKey: 'terroncito',
    description: 'Bolita de barro pampeano con patitas, mirada tranquila, alguna brizna de pasto encima.',
    baseStats: { hp: 44, mp: 16, fuerza: 9, defensa: 11, inteligencia: 7, agilidad: 6 },
    techniques: [tech('terronazo', 'Terronazo', 'tierra', 9, 0, 'fisico')],
  },
  gotita: {
    id: 'gotita', name: 'Gotita', stage: 'baby', types: ['agua'],
    spriteKey: 'gotita',
    description: 'Gota de agua de río con carita, reflejos celestes, salta y chapotea.',
    baseStats: { hp: 38, mp: 24, fuerza: 7, defensa: 8, inteligencia: 10, agilidad: 10 },
    techniques: [tech('salpicon', 'Salpicón', 'agua', 8, 0, 'especial')],
  },
  brasita_bb: {
    id: 'brasita_bb', name: 'Brasita', stage: 'baby', types: ['fuego'],
    description: 'Carboncito encendido con ojitos, chispas tímidas; estilo brasa de asado recién prendida.',
    baseStats: { hp: 39, mp: 22, fuerza: 11, defensa: 7, inteligencia: 8, agilidad: 11 },
    techniques: [tech('chispita_atk', 'Chispita', 'fuego', 9, 0, 'especial')],
  },

  // =====================================================================
  // IN-TRAINING
  // =====================================================================
  termito: {
    id: 'termito', name: 'Termito', stage: 'in-training', types: ['tierra'],
    description: 'Criatura cuadrada de barro cocido tipo ladrillo, patitas cortas, mirada terca; defensivo.',
    baseStats: { hp: 70, mp: 25, fuerza: 14, defensa: 20, inteligencia: 10, agilidad: 9 },
    techniques: [tech('cabezazo', 'Cabezazo', 'tierra', 14, 2, 'fisico')],
  },
  chispita: {
    id: 'chispita', name: 'Chispita', stage: 'in-training', types: ['fuego'],
    description: 'Brasa viva con piernitas, chispas saltando, expresión traviesa; ofensivo y veloz.',
    baseStats: { hp: 60, mp: 30, fuerza: 20, defensa: 10, inteligencia: 12, agilidad: 16 },
    techniques: [tech('chispazo', 'Chispazo', 'fuego', 16, 3, 'especial')],
  },
  charquito: {
    id: 'charquito', name: 'Charquito', stage: 'in-training', types: ['agua'],
    description: 'Charco con ojos saltones, ondas constantes, escupe agua; tranquilo pero escurridizo.',
    baseStats: { hp: 66, mp: 34, fuerza: 13, defensa: 14, inteligencia: 18, agilidad: 15 },
    techniques: [tech('chorro', 'Chorro', 'agua', 16, 3, 'especial')],
  },
  brotecito: {
    id: 'brotecito', name: 'Brotecito', stage: 'in-training', types: ['planta'],
    description: 'Brote verde con dos hojitas como brazos, raíz-pie; curioso y aplicado.',
    baseStats: { hp: 68, mp: 32, fuerza: 12, defensa: 16, inteligencia: 20, agilidad: 12 },
    techniques: [tech('latigo_hoja', 'Látigo de hoja', 'planta', 15, 3, 'especial')],
  },
  ventacito: {
    id: 'ventacito', name: 'Ventacito', stage: 'in-training', types: ['tormenta'],
    description: 'Remolinito de viento con cara, hojas girando alrededor; nunca se queda quieto.',
    baseStats: { hp: 58, mp: 30, fuerza: 15, defensa: 11, inteligencia: 16, agilidad: 22 },
    techniques: [tech('soplido', 'Soplido', 'tormenta', 15, 3, 'especial')],
  },
  pelusin: {
    id: 'pelusin', name: 'Pelusín', stage: 'in-training', types: ['bestia'],
    description: 'Bola de pelo marrón con patitas y colita, dientes chiquitos; pura energía animal.',
    baseStats: { hp: 72, mp: 22, fuerza: 19, defensa: 14, inteligencia: 9, agilidad: 17 },
    techniques: [tech('mordisquito', 'Mordisquito', 'bestia', 16, 2, 'fisico')],
  },

  // =====================================================================
  // ROOKIE
  // =====================================================================
  carpinchon: {
    id: 'carpinchon', name: 'Carpinchón', stage: 'rookie', types: ['bestia', 'tierra'],
    spriteKey: 'carpinchon',
    description: 'Carpincho corpulento y sereno, pelaje marrón, postura tanque; aguanta de todo.',
    baseStats: { hp: 130, mp: 40, fuerza: 30, defensa: 38, inteligencia: 18, agilidad: 16 },
    techniques: [tech('embestida', 'Embestida', 'bestia', 26, 4, 'fisico'), tech('muralla', 'Muralla', 'tierra', 18, 3, 'fisico')],
  },
  hornerito: {
    id: 'hornerito', name: 'Hornerito', stage: 'rookie', types: ['planta'],
    description: 'Pájaro hornero artesano con casco de barro, inteligente y metódico; ataques especiales.',
    baseStats: { hp: 100, mp: 70, fuerza: 20, defensa: 24, inteligencia: 40, agilidad: 28 },
    techniques: [tech('semillazo', 'Semillazo', 'planta', 24, 4, 'especial'), tech('picotazo', 'Picotazo', 'bestia', 18, 2, 'fisico')],
  },
  pomberito: {
    id: 'pomberito', name: 'Pomberito', stage: 'rookie', types: ['mito'],
    description: 'Duende del monte petiso y peludo, sombrero de paja, sonrisa pícara; escurridizo.',
    baseStats: { hp: 95, mp: 75, fuerza: 22, defensa: 20, inteligencia: 36, agilidad: 36 },
    techniques: [tech('silbido', 'Silbido del monte', 'mito', 26, 4, 'especial'), tech('travesura', 'Travesura', 'mito', 16, 2, 'especial')],
  },
  pampero_jr: {
    id: 'pampero_jr', name: 'Pampero Jr.', stage: 'rookie', types: ['tormenta'],
    description: 'Remolino de viento con ojos de relámpago, muy rápido; golpea antes que nadie.',
    baseStats: { hp: 95, mp: 60, fuerza: 28, defensa: 18, inteligencia: 26, agilidad: 44 },
    techniques: [tech('rafaga', 'Ráfaga', 'tormenta', 24, 4, 'especial'), tech('chicotazo', 'Chicotazo', 'tormenta', 18, 2, 'fisico')],
  },
  yacare_chico: {
    id: 'yacare_chico', name: 'Yacaré Chico', stage: 'rookie', types: ['agua', 'bestia'],
    description: 'Yacaré joven de hocico ancho, escamas verde oscuro, ojos sobre el agua; mordida fuerte.',
    baseStats: { hp: 120, mp: 45, fuerza: 34, defensa: 30, inteligencia: 18, agilidad: 24 },
    techniques: [tech('mordida', 'Mordida', 'bestia', 28, 4, 'fisico'), tech('coletazo_ag', 'Coletazo', 'agua', 22, 3, 'fisico')],
  },
  mandiyu: {
    id: 'mandiyu', name: 'Mandiyú', stage: 'rookie', types: ['planta'],
    description: 'Criatura de algodón (mandiyú) esponjosa y blanca, brazos de rama; suave pero resistente.',
    baseStats: { hp: 115, mp: 60, fuerza: 22, defensa: 34, inteligencia: 30, agilidad: 20 },
    techniques: [tech('motazo', 'Motazo', 'planta', 24, 4, 'especial'), tech('enredo', 'Enredo', 'planta', 16, 3, 'especial')],
  },
  nandulin: {
    id: 'nandulin', name: 'Ñandulín', stage: 'rookie', types: ['bestia'],
    description: 'Ñandú estilizado de patas largas, plumaje gris, corredor veloz por la pampa.',
    baseStats: { hp: 105, mp: 40, fuerza: 30, defensa: 22, inteligencia: 22, agilidad: 46 },
    techniques: [tech('patada_n', 'Patada veloz', 'bestia', 26, 4, 'fisico'), tech('carrera', 'Carrera', 'tierra', 18, 2, 'fisico')],
  },
  surubicito: {
    id: 'surubicito', name: 'Surubicito', stage: 'rookie', types: ['agua'],
    description: 'Surubí joven moteado, bigotes largos, nada contra la corriente; astuto.',
    baseStats: { hp: 110, mp: 70, fuerza: 24, defensa: 26, inteligencia: 38, agilidad: 30 },
    techniques: [tech('torrente', 'Torrente', 'agua', 26, 4, 'especial'), tech('latigo_bigote', 'Látigo de bigote', 'agua', 18, 2, 'fisico')],
  },
  brasero: {
    id: 'brasero', name: 'Brasero', stage: 'rookie', types: ['fuego'],
    description: 'Espíritu de parrilla con cuerpo de brasas y rejilla, humo de asado; agresivo.',
    baseStats: { hp: 100, mp: 65, fuerza: 40, defensa: 24, inteligencia: 24, agilidad: 28 },
    techniques: [tech('llamarada', 'Llamarada', 'fuego', 28, 5, 'especial'), tech('brasazo', 'Brasazo', 'fuego', 20, 2, 'fisico')],
  },
  piedron: {
    id: 'piedron', name: 'Piedrón', stage: 'rookie', types: ['tierra'],
    description: 'Roca andina con brazos pétreos, cara tallada, postura inamovible; pura defensa.',
    baseStats: { hp: 140, mp: 35, fuerza: 28, defensa: 46, inteligencia: 16, agilidad: 12 },
    techniques: [tech('rocazo', 'Rocazo', 'tierra', 28, 4, 'fisico'), tech('caparazon', 'Caparazón', 'tierra', 16, 3, 'fisico')],
  },

  // =====================================================================
  // CHAMPION
  // =====================================================================
  yaguarete_sombra: {
    id: 'yaguarete_sombra', name: 'Yaguareté Sombra', stage: 'champion', types: ['bestia', 'mito'],
    description: 'Yaguareté espectral negro con manchas que brillan como brasas; depredador imponente.',
    baseStats: { hp: 200, mp: 90, fuerza: 60, defensa: 50, inteligencia: 40, agilidad: 55 },
    techniques: [tech('zarpazo', 'Zarpazo umbral', 'bestia', 40, 6, 'fisico'), tech('aullido', 'Aullido espectral', 'mito', 34, 5, 'especial')],
  },
  lobizon: {
    id: 'lobizon', name: 'Lobizón', stage: 'champion', types: ['bestia'],
    description: 'Hombre-lobo del folclore, pelaje hirsuto bajo la luna, fuerza bruta y furia.',
    baseStats: { hp: 220, mp: 60, fuerza: 70, defensa: 48, inteligencia: 28, agilidad: 46 },
    techniques: [tech('dentellada', 'Dentellada', 'bestia', 46, 6, 'fisico'), tech('furia_lunar', 'Furia lunar', 'mito', 30, 5, 'especial')],
  },
  quebrachon: {
    id: 'quebrachon', name: 'Quebrachón', stage: 'champion', types: ['planta', 'tierra'],
    description: 'Coloso de madera de quebracho, corteza durísima, raíces como puños; muralla viviente.',
    baseStats: { hp: 260, mp: 70, fuerza: 55, defensa: 75, inteligencia: 36, agilidad: 24 },
    techniques: [tech('raizazo', 'Raizazo', 'planta', 42, 6, 'fisico'), tech('corteza', 'Corteza férrea', 'tierra', 30, 4, 'fisico')],
  },
  tormenton: {
    id: 'tormenton', name: 'Tormentón', stage: 'champion', types: ['tormenta'],
    description: 'Nube de tormenta con brazos de relámpago, truenos por voz; velocidad y daño especial.',
    baseStats: { hp: 190, mp: 110, fuerza: 44, defensa: 40, inteligencia: 62, agilidad: 64 },
    techniques: [tech('centella', 'Centella', 'tormenta', 44, 6, 'especial'), tech('granizo', 'Granizo', 'agua', 32, 5, 'especial')],
  },
  yacare_grande: {
    id: 'yacare_grande', name: 'Yacaré Grande', stage: 'champion', types: ['agua', 'bestia'],
    description: 'Yacaré adulto enorme, mandíbula brutal, escamas como escudos; rey del estero.',
    baseStats: { hp: 250, mp: 60, fuerza: 72, defensa: 60, inteligencia: 26, agilidad: 34 },
    techniques: [tech('mordida_brutal', 'Mordida brutal', 'bestia', 48, 7, 'fisico'), tech('marea', 'Marea', 'agua', 34, 5, 'especial')],
  },
  mboi_tui: {
    id: 'mboi_tui', name: 'Mbói Tu’í', stage: 'champion', types: ['mito', 'planta'],
    description: 'Serpiente mítica guaraní con cabeza de loro, protectora de esteros; colores vivos.',
    baseStats: { hp: 210, mp: 100, fuerza: 50, defensa: 52, inteligencia: 66, agilidad: 50 },
    techniques: [tech('veneno_verde', 'Veneno verde', 'planta', 42, 6, 'especial'), tech('grito_guarani', 'Grito guaraní', 'mito', 38, 5, 'especial')],
  },
  curupi: {
    id: 'curupi', name: 'Curupí', stage: 'champion', types: ['mito'],
    description: 'Espíritu del monte guaraní, guardián de la fauna, figura escurridiza y temida.',
    baseStats: { hp: 200, mp: 110, fuerza: 54, defensa: 46, inteligencia: 64, agilidad: 58 },
    techniques: [tech('embrujo', 'Embrujo del monte', 'mito', 44, 6, 'especial'), tech('zarpa_mito', 'Zarpa salvaje', 'bestia', 34, 4, 'fisico')],
  },
  aguara_guazu: {
    id: 'aguara_guazu', name: 'Aguará Guazú', stage: 'champion', types: ['bestia'],
    description: 'Zorro grande de patas larguísimas y pelaje rojizo, melena al viento; cazador elegante.',
    baseStats: { hp: 205, mp: 70, fuerza: 64, defensa: 44, inteligencia: 42, agilidad: 66 },
    techniques: [tech('tarascon', 'Tarascón', 'bestia', 44, 6, 'fisico'), tech('aullido_rojo', 'Aullido rojo', 'mito', 30, 4, 'especial')],
  },
  brasapampa: {
    id: 'brasapampa', name: 'Brasapampa', stage: 'champion', types: ['fuego', 'tierra'],
    description: 'Coloso de tierra agrietada con vetas de lava, humo de quema de campo; lento pero devastador.',
    baseStats: { hp: 240, mp: 80, fuerza: 76, defensa: 64, inteligencia: 30, agilidad: 26 },
    techniques: [tech('erupcion', 'Erupción', 'fuego', 48, 7, 'especial'), tech('grieta', 'Grieta', 'tierra', 38, 5, 'fisico')],
  },
  gualicho: {
    id: 'gualicho', name: 'Gualicho', stage: 'champion', types: ['mito'],
    description: 'Entidad mapuche-tehuelche de mala suerte, sombra inquieta con ojos brillantes; arcano.',
    baseStats: { hp: 195, mp: 120, fuerza: 48, defensa: 48, inteligencia: 72, agilidad: 52 },
    techniques: [tech('maldicion_g', 'Maldición', 'mito', 46, 7, 'especial'), tech('sombra', 'Sombra errante', 'mito', 32, 4, 'especial')],
  },

  // =====================================================================
  // MEGA
  // =====================================================================
  luz_mala: {
    id: 'luz_mala', name: 'Luz Mala', stage: 'mega', types: ['mito', 'fuego'],
    description: 'Esfera de fuego fatuo flotante, halo verdoso y fantasmal, mirada hipnótica; poder arcano.',
    baseStats: { hp: 300, mp: 160, fuerza: 70, defensa: 70, inteligencia: 100, agilidad: 80 },
    techniques: [tech('fuego_fatuo', 'Fuego fatuo', 'fuego', 60, 8, 'especial'), tech('maldicion', 'Maldición', 'mito', 54, 7, 'especial')],
  },
  yaguarete_rey: {
    id: 'yaguarete_rey', name: 'Yaguareté Rey', stage: 'mega', types: ['bestia'],
    spriteKey: 'yaguarete_rey',
    description: 'Yaguareté monumental coronado, musculatura imponente, presencia de monarca del monte.',
    baseStats: { hp: 360, mp: 90, fuerza: 110, defensa: 85, inteligencia: 50, agilidad: 75 },
    techniques: [tech('zarpa_real', 'Zarpa real', 'bestia', 70, 8, 'fisico'), tech('rugido', 'Rugido del monte', 'bestia', 50, 6, 'especial')],
  },
  salamanca: {
    id: 'salamanca', name: 'Salamanca', stage: 'mega', types: ['mito', 'tierra'],
    description: 'Entidad de la cueva mítica del folclore, roca y sombra, runas brillando; tanque arcano.',
    baseStats: { hp: 380, mp: 130, fuerza: 80, defensa: 100, inteligencia: 80, agilidad: 50 },
    techniques: [tech('temblor', 'Temblor', 'tierra', 62, 8, 'fisico'), tech('hechizo', 'Hechizo de cueva', 'mito', 56, 7, 'especial')],
  },
  nahuelito: {
    id: 'nahuelito', name: 'Nahuelito', stage: 'mega', types: ['agua', 'bestia'],
    description: 'Monstruo del lago Nahuel Huapi, cuello largo y lomo serpenteante, emerge entre la bruma.',
    baseStats: { hp: 340, mp: 120, fuerza: 88, defensa: 78, inteligencia: 62, agilidad: 60 },
    techniques: [tech('tsunami', 'Tsunami', 'agua', 64, 8, 'especial'), tech('embate', 'Embate', 'bestia', 52, 6, 'fisico')],
  },
  yacare_titan: {
    id: 'yacare_titan', name: 'Yacaré Titán', stage: 'mega', types: ['agua', 'tierra'],
    description: 'Yacaré colosal acorazado, placas como rocas, mandíbula capaz de partir troncos.',
    baseStats: { hp: 400, mp: 90, fuerza: 105, defensa: 95, inteligencia: 40, agilidad: 48 },
    techniques: [tech('mordida_titan', 'Mordida titánica', 'bestia', 70, 8, 'fisico'), tech('cienaga', 'Ciénaga', 'agua', 50, 6, 'especial')],
  },
  quebracho_milenario: {
    id: 'quebracho_milenario', name: 'Quebracho Milenario', stage: 'mega', types: ['planta', 'tierra'],
    description: 'Árbol ancestral gigantesco con rostro en la corteza, raíces que parten la tierra; fortaleza viva.',
    baseStats: { hp: 420, mp: 110, fuerza: 90, defensa: 120, inteligencia: 70, agilidad: 30 },
    techniques: [tech('raiz_ancestral', 'Raíz ancestral', 'planta', 66, 8, 'fisico'), tech('bosque', 'Furia del bosque', 'planta', 50, 6, 'especial')],
  },
  pampero_dios: {
    id: 'pampero_dios', name: 'Pampero Dios', stage: 'mega', types: ['tormenta'],
    description: 'Tormenta colosal con forma humanoide de nubes y rayos, viento del sur hecho deidad.',
    baseStats: { hp: 320, mp: 170, fuerza: 70, defensa: 66, inteligencia: 96, agilidad: 104 },
    techniques: [tech('tormenta_total', 'Tormenta total', 'tormenta', 66, 8, 'especial'), tech('rayo', 'Rayo', 'tormenta', 52, 5, 'especial')],
  },
  curupi_mayor: {
    id: 'curupi_mayor', name: 'Curupí Mayor', stage: 'mega', types: ['mito', 'planta'],
    description: 'Forma mayor del espíritu del monte, enorme y cubierto de vegetación viva; guardián supremo.',
    baseStats: { hp: 350, mp: 150, fuerza: 84, defensa: 80, inteligencia: 94, agilidad: 70 },
    techniques: [tech('ira_monte', 'Ira del monte', 'planta', 64, 8, 'especial'), tech('embrujo_mayor', 'Embrujo mayor', 'mito', 58, 7, 'especial')],
  },
  el_familiar: {
    id: 'el_familiar', name: 'El Familiar', stage: 'mega', types: ['mito', 'fuego'],
    description: 'Perro-serpiente infernal del folclore norteño, cadenas al cuello, ojos de brasa; pacto oscuro.',
    baseStats: { hp: 360, mp: 140, fuerza: 100, defensa: 82, inteligencia: 78, agilidad: 72 },
    techniques: [tech('cadena_ardiente', 'Cadena ardiente', 'fuego', 66, 8, 'fisico'), tech('pacto', 'Pacto oscuro', 'mito', 56, 7, 'especial')],
  },
  mboi_rey: {
    id: 'mboi_rey', name: 'Mbói Rey', stage: 'mega', types: ['mito', 'planta'],
    description: 'Serpiente guaraní colosal coronada, cabeza de loro radiante, soberana de los esteros.',
    baseStats: { hp: 345, mp: 150, fuerza: 82, defensa: 84, inteligencia: 96, agilidad: 66 },
    techniques: [tech('diluvio_verde', 'Diluvio verde', 'planta', 64, 8, 'especial'), tech('canto_real', 'Canto real', 'mito', 58, 7, 'especial')],
  },
  aguara_espectro: {
    id: 'aguara_espectro', name: 'Aguará Espectro', stage: 'mega', types: ['bestia', 'mito'],
    description: 'Aguará guazú espectral gigantesco, pelaje en llamas frías, cazador entre dos mundos.',
    baseStats: { hp: 335, mp: 120, fuerza: 104, defensa: 74, inteligencia: 66, agilidad: 92 },
    techniques: [tech('tarascon_espectral', 'Tarascón espectral', 'bestia', 68, 8, 'fisico'), tech('aullido_abismal', 'Aullido abismal', 'mito', 54, 6, 'especial')],
  },
};

// R13 — Evolution rules. The engine evaluates these against how the monster was
// raised (stats, care mistakes, dominant type) and picks the first match by
// priority; every species that can evolve also has a low-priority DEFAULT so a
// monster is never left without a path (edge case in spec).
export const EVOLUTION_RULES: EvolutionRule[] = [
  // ---- baby -> in-training ----
  { from: 'matecito', to: 'chispita', conditions: { minStats: { fuerza: 12 } }, priority: 10 },
  { from: 'matecito', to: 'termito', conditions: {}, priority: 0 },
  { from: 'terroncito', to: 'brotecito', conditions: { minStats: { inteligencia: 12 } }, priority: 10 },
  { from: 'terroncito', to: 'termito', conditions: {}, priority: 0 },
  { from: 'gotita', to: 'ventacito', conditions: { minStats: { agilidad: 12 } }, priority: 10 },
  { from: 'gotita', to: 'charquito', conditions: {}, priority: 0 },
  { from: 'brasita_bb', to: 'pelusin', conditions: { minStats: { fuerza: 12 } }, priority: 10 },
  { from: 'brasita_bb', to: 'chispita', conditions: {}, priority: 0 },

  // ---- in-training -> rookie ----
  { from: 'termito', to: 'carpinchon', conditions: { minStats: { defensa: 30 } }, priority: 10 },
  { from: 'termito', to: 'hornerito', conditions: { minStats: { inteligencia: 28 } }, priority: 9 },
  { from: 'termito', to: 'carpinchon', conditions: {}, priority: 0 },
  { from: 'chispita', to: 'pampero_jr', conditions: { minStats: { agilidad: 34 } }, priority: 10 },
  { from: 'chispita', to: 'pomberito', conditions: { maxCareMistakes: 1 }, priority: 9 },
  { from: 'chispita', to: 'pomberito', conditions: {}, priority: 0 },
  { from: 'charquito', to: 'surubicito', conditions: { minStats: { inteligencia: 28 } }, priority: 10 },
  { from: 'charquito', to: 'yacare_chico', conditions: {}, priority: 0 },
  { from: 'brotecito', to: 'hornerito', conditions: { minStats: { inteligencia: 30 } }, priority: 10 },
  { from: 'brotecito', to: 'mandiyu', conditions: {}, priority: 0 },
  { from: 'ventacito', to: 'brasero', conditions: { minStats: { fuerza: 30 } }, priority: 10 },
  { from: 'ventacito', to: 'pampero_jr', conditions: {}, priority: 0 },
  { from: 'pelusin', to: 'piedron', conditions: { minStats: { defensa: 30 } }, priority: 10 },
  { from: 'pelusin', to: 'nandulin', conditions: {}, priority: 0 },

  // ---- rookie -> champion ----
  { from: 'carpinchon', to: 'quebrachon', conditions: { minStats: { defensa: 60 } }, priority: 10 },
  { from: 'carpinchon', to: 'lobizon', conditions: { minStats: { fuerza: 50 } }, priority: 9 },
  { from: 'carpinchon', to: 'lobizon', conditions: {}, priority: 0 },
  { from: 'hornerito', to: 'tormenton', conditions: { minStats: { inteligencia: 55 } }, priority: 10 },
  { from: 'hornerito', to: 'quebrachon', conditions: {}, priority: 0 },
  { from: 'pomberito', to: 'yaguarete_sombra', conditions: { minStats: { agilidad: 45 } }, priority: 10 },
  { from: 'pomberito', to: 'curupi', conditions: { minStats: { inteligencia: 40 } }, priority: 9 },
  { from: 'pomberito', to: 'yaguarete_sombra', conditions: {}, priority: 0 },
  { from: 'pampero_jr', to: 'tormenton', conditions: {}, priority: 0 },
  { from: 'yacare_chico', to: 'yacare_grande', conditions: {}, priority: 0 },
  { from: 'mandiyu', to: 'quebrachon', conditions: { minStats: { defensa: 55 } }, priority: 10 },
  { from: 'mandiyu', to: 'mboi_tui', conditions: {}, priority: 0 },
  { from: 'nandulin', to: 'gualicho', conditions: { minStats: { inteligencia: 30 } }, priority: 10 },
  { from: 'nandulin', to: 'aguara_guazu', conditions: {}, priority: 0 },
  { from: 'surubicito', to: 'yacare_grande', conditions: { minStats: { defensa: 50 } }, priority: 10 },
  { from: 'surubicito', to: 'tormenton', conditions: {}, priority: 0 },
  { from: 'brasero', to: 'brasapampa', conditions: {}, priority: 0 },
  { from: 'piedron', to: 'brasapampa', conditions: { minStats: { fuerza: 55 } }, priority: 10 },
  { from: 'piedron', to: 'quebrachon', conditions: {}, priority: 0 },

  // ---- champion -> mega ----
  { from: 'yaguarete_sombra', to: 'yaguarete_rey', conditions: { minStats: { fuerza: 90 } }, priority: 10 },
  { from: 'yaguarete_sombra', to: 'luz_mala', conditions: {}, priority: 0 },
  { from: 'lobizon', to: 'yaguarete_rey', conditions: {}, priority: 0 },
  { from: 'quebrachon', to: 'quebracho_milenario', conditions: { minStats: { defensa: 90 } }, priority: 10 },
  { from: 'quebrachon', to: 'salamanca', conditions: {}, priority: 0 },
  { from: 'tormenton', to: 'pampero_dios', conditions: { minStats: { agilidad: 70 } }, priority: 10 },
  { from: 'tormenton', to: 'luz_mala', conditions: {}, priority: 0 },
  { from: 'yacare_grande', to: 'yacare_titan', conditions: { minStats: { defensa: 80 } }, priority: 10 },
  { from: 'yacare_grande', to: 'nahuelito', conditions: {}, priority: 0 },
  { from: 'mboi_tui', to: 'mboi_rey', conditions: {}, priority: 0 },
  { from: 'curupi', to: 'curupi_mayor', conditions: {}, priority: 0 },
  { from: 'aguara_guazu', to: 'aguara_espectro', conditions: {}, priority: 0 },
  { from: 'brasapampa', to: 'el_familiar', conditions: {}, priority: 0 },
  { from: 'gualicho', to: 'el_familiar', conditions: { minStats: { inteligencia: 80 } }, priority: 10 },
  { from: 'gualicho', to: 'salamanca', conditions: {}, priority: 0 },
];
