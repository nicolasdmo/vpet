// R10 — Training minigames, one per trainable stat. Each minigame can be
// auto-resolved (flat points) or played (more points, scaled by performance, R11).

import type { Stat } from '../types.ts';

export interface Minigame {
  id: string;
  name: string;
  stat: Stat; // the stat it primarily trains
  description: string;
}

export const MINIGAMES: Record<string, Minigame> = {
  pesas: {
    id: 'pesas',
    name: 'Levantar pesas',
    stat: 'fuerza',
    description: 'Levantá fardos al ritmo para subir Fuerza.',
  },
  escudo: {
    id: 'escudo',
    name: 'Aguantar el envión',
    stat: 'defensa',
    description: 'Bloqueá los golpes en el momento justo para subir Defensa.',
  },
  acertijo: {
    id: 'acertijo',
    name: 'Acertijos',
    stat: 'inteligencia',
    description: 'Resolvé acertijos para subir Inteligencia.',
  },
  esquivar: {
    id: 'esquivar',
    name: 'Esquivar',
    stat: 'agilidad',
    description: 'Esquivá obstáculos para subir Agilidad.',
  },
  resistencia: {
    id: 'resistencia',
    name: 'Resistencia',
    stat: 'hp',
    description: 'Corré la mayor distancia posible para subir HP.',
  },
  concentracion: {
    id: 'concentracion',
    name: 'Concentración',
    stat: 'mp',
    description: 'Mantené el foco para subir MP.',
  },
};
