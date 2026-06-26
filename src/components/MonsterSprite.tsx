'use client';

// Monster sprite renderer.
// - If the species has a `spriteKey`, play a 2-frame idle from real pixel-art PNGs
//   (public/sprites/<key>/idle_0.png + idle_1.png) — the Tamagotchi "breathing" look.
// - Otherwise fall back to a deterministic procedural SVG so every species still
//   renders while its art is being produced.

import { useEffect, useState } from 'react';
import type { ElementType, EvolutionStage, MonsterSpecies } from '@/game/types.ts';

// Exposed via next.config so the <img> src resolves under the right base on both
// GitHub Pages (/vpet) and Vercel (root).
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function MonsterSprite({ species, size = 128 }: { species: MonsterSpecies; size?: number }) {
  if (species.spriteKey) return <PixelIdle spriteKey={species.spriteKey} name={species.name} size={size} />;
  return <ProceduralSprite species={species} size={size} />;
}

function PixelIdle({ spriteKey, name, size }: { spriteKey: string; name: string; size: number }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => f ^ 1), 600); // ~2fps idle
    return () => clearInterval(id);
  }, []);
  const imgStyle = (visible: boolean) =>
    ({
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      imageRendering: 'pixelated',
      opacity: visible ? 1 : 0,
    }) as const;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <img src={`${BASE}/sprites/${spriteKey}/idle_0.png`} alt={name} style={imgStyle(frame === 0)} />
      <img src={`${BASE}/sprites/${spriteKey}/idle_1.png`} alt="" aria-hidden style={imgStyle(frame === 1)} />
    </div>
  );
}

// ---------------- procedural fallback ----------------

const TYPE_COLOR: Record<ElementType, string> = {
  fuego: '#e0552b',
  agua: '#2b8fe0',
  planta: '#3fae5a',
  tierra: '#b08442',
  tormenta: '#d8b32a',
  bestia: '#9b6b3a',
  mito: '#8a5cd0',
};

const STAGE_SCALE: Record<EvolutionStage, number> = {
  baby: 0.55,
  'in-training': 0.7,
  rookie: 0.85,
  champion: 1.0,
  mega: 1.15,
};

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return `rgb(${r},${g},${b})`;
}

function ProceduralSprite({ species, size }: { species: MonsterSpecies; size: number }) {
  const primary = species.types[0] ?? 'bestia';
  const accent = species.types[1] ?? primary;
  const color = TYPE_COLOR[primary];
  const accentColor = TYPE_COLOR[accent];
  const s = STAGE_SCALE[species.stage];
  const cx = 50;
  const cy = 54;
  const bodyR = 30 * s;

  let seed = 0;
  for (const ch of species.id) seed = (seed * 31 + ch.charCodeAt(0)) % 997;
  const eyeOffset = 8 + (seed % 4);
  const happy = seed % 2 === 0;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={species.name}>
      <defs>
        <radialGradient id={`g-${species.id}`} cx="40%" cy="35%">
          <stop offset="0%" stopColor={shade(color, 40)} />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>

      {(primary === 'fuego' || accent === 'fuego') &&
        [0, 1, 2].map((i) => (
          <polygon key={i} points={`${cx - 14 + i * 14},${cy - bodyR} ${cx - 8 + i * 14},${cy - bodyR - 16 * s} ${cx - 2 + i * 14},${cy - bodyR}`} fill={shade(accentColor, 30)} />
        ))}
      {(primary === 'planta' || accent === 'planta') && (
        <ellipse cx={cx} cy={cy - bodyR - 4} rx={10 * s} ry={16 * s} fill={shade(accentColor, 20)} />
      )}
      {(primary === 'tormenta' || accent === 'tormenta') && (
        <polygon points={`${cx + bodyR - 4},${cy - bodyR} ${cx + bodyR + 10},${cy - 6} ${cx + bodyR},${cy - 6} ${cx + bodyR + 12},${cy + 14}`} fill="#f4e06a" stroke="#9a7d10" strokeWidth="1" />
      )}
      {(primary === 'bestia' || accent === 'bestia') &&
        [-1, 1].map((d) => (
          <polygon key={d} points={`${cx + d * bodyR * 0.6},${cy - bodyR + 4} ${cx + d * bodyR * 0.95},${cy - bodyR - 14 * s} ${cx + d * bodyR * 0.25},${cy - bodyR + 6}`} fill={shade(color, -20)} />
        ))}
      {(primary === 'agua' || accent === 'agua') &&
        [-1, 1].map((d) => (
          <ellipse key={d} cx={cx + d * bodyR} cy={cy} rx={8 * s} ry={16 * s} fill={shade(accentColor, 30)} opacity={0.8} />
        ))}
      {(primary === 'mito' || accent === 'mito') && (
        <circle cx={cx} cy={cy} r={bodyR + 7 * s} fill="none" stroke={shade(accentColor, 60)} strokeWidth="2" opacity={0.6} />
      )}

      <circle cx={cx} cy={cy} r={bodyR} fill={`url(#g-${species.id})`} stroke={shade(color, -40)} strokeWidth="2" />
      {(primary === 'tierra' || accent === 'tierra') &&
        [[-10, -6], [12, 4], [-4, 12]].map(([dx, dy], i) => (
          <circle key={i} cx={cx + dx * s} cy={cy + dy * s} r={4 * s} fill={shade(color, -25)} />
        ))}

      {[-1, 1].map((d) => (
        <g key={d}>
          <circle cx={cx + d * eyeOffset} cy={cy - 4} r={6 * s} fill="#fff" />
          <circle cx={cx + d * eyeOffset} cy={cy - 3} r={3 * s} fill="#15233a" />
        </g>
      ))}
      {happy ? (
        <path d={`M ${cx - 8 * s} ${cy + 10 * s} Q ${cx} ${cy + 16 * s} ${cx + 8 * s} ${cy + 10 * s}`} fill="none" stroke="#15233a" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <line x1={cx - 6 * s} y1={cy + 12 * s} x2={cx + 6 * s} y2={cy + 12 * s} stroke="#15233a" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function EggSprite({ size = 128 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="huevo">
      <ellipse cx="50" cy="56" rx="28" ry="34" fill="#efe7d2" stroke="#b9ad8e" strokeWidth="2" />
      {[20, 40, 60].map((y, i) => (
        <path key={i} d={`M 24 ${y + 20} q 8 6 16 0 q 8 -6 16 0 q 8 6 12 0`} fill="none" stroke="#cdbf9d" strokeWidth="2" />
      ))}
    </svg>
  );
}
