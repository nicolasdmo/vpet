'use client';

// Single-player care-loop prototype (Milestone 1 UI, R37/R38).
// Exercises the real game engine in the browser: real-time needs, feeding,
// cleaning, training, evolution, lifespan/death and heir inheritance.
//
// SCOPE NOTE: persistence here is localStorage as a STAND-IN. The spec requires
// server persistence via Supabase (R2) + Google auth (R1) + server-authoritative
// online battles (R22/R30-R33); those are wired in lib/supabase + supabase/ but
// not yet connected to this screen. Marked partial in the build report.

import { useEffect, useRef, useState } from 'react';
import { DEFAULT_BALANCE as CFG } from '@/game/config/balance.ts';
import { createMonster } from '@/game/spawn.ts';
import { simulateNeeds, needsAttention, cleanUp } from '@/game/needs.ts';
import { feed } from '@/game/foods.ts';
import { advanceAge, isElder } from '@/game/lifespan.ts';
import { train } from '@/game/training.ts';
import { resolveEvolution, evolve } from '@/game/evolution.ts';
import { hatchHeir } from '@/game/inheritance.ts';
import { FOODS } from '@/game/data/foodsData.ts';
import { MINIGAMES } from '@/game/data/minigames.ts';
import { SPECIES } from '@/game/data/monsters.ts';
import type { MonsterInstance } from '@/game/types.ts';

const KEY = 'bicho-battler:monster';
const EMOJI: Record<string, string> = {
  baby: '🥚', 'in-training': '🐣', rookie: '🦝', champion: '🐆', mega: '👹',
};

function load(now: number): MonsterInstance {
  if (typeof window !== 'undefined') {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as MonsterInstance;
  }
  return createMonster('matecito', { now, cfg: CFG });
}

export default function Home() {
  const [m, setM] = useState<MonsterInstance | null>(null);
  const mRef = useRef<MonsterInstance | null>(null);

  const update = (next: MonsterInstance) => {
    mRef.current = next;
    setM(next);
    if (typeof window !== 'undefined') window.localStorage.setItem(KEY, JSON.stringify(next));
  };

  // Boot + real-time tick (uses Date.now as a client stand-in for server time).
  useEffect(() => {
    update(tick(load(Date.now())));
    const id = setInterval(() => {
      if (mRef.current) update(tick(mRef.current));
    }, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function tick(cur: MonsterInstance): MonsterInstance {
    const now = Date.now();
    const { monster } = simulateNeeds(cur, now, CFG);
    const { monster: aged } = advanceAge(monster, now, CFG);
    return aged;
  }

  if (!m) return <main className="app">Cargando…</main>;

  const species = SPECIES[m.speciesId];
  const att = needsAttention(m, CFG);
  const evoTarget = resolveEvolution(m);
  const lifePct = Math.min(100, (m.ageHours / m.effectiveLifespanHours) * 100);

  return (
    <main className="app">
      <h1>Bicho Battler</h1>
      <div className="screen">
        <div className="monster">
          <div className="sprite">{m.alive ? EMOJI[m.stage] : '⚰️'}</div>
          <strong>{species.name}</strong>
          <span className="muted">
            {m.stage} · gen {m.generation} {isElder(m, CFG) && m.alive ? '· 👴 viejito' : ''}
          </span>
          <span className="muted">{m.alive ? 'Vivo' : 'Falleció'}</span>
        </div>

        {m.alive ? (
          <>
            <div>
              <Bar label="Hambre" value={m.fullness} low={att.hungry} />
              <Bar label="Limpieza" value={m.cleanliness} low={att.dirty} />
              <Bar label="Energía" value={m.energy} low={att.tired} />
              <Bar label="Vida" value={100 - lifePct} low={lifePct > 80} />
              <div className="muted">
                Salud: {m.health}{m.poopCount > 0 ? ` · 💩 x${m.poopCount}` : ''}
              </div>
            </div>

            <div className="actions">
              {Object.values(FOODS).map((f) => (
                <button key={f.id} className="secondary" onClick={() => update(feed(m, f.id))}>
                  🍽 {f.name}
                </button>
              ))}
            </div>

            <div className="actions">
              <button onClick={() => update(cleanUp(m))}>🧼 Limpiar</button>
              {Object.values(MINIGAMES).map((g) => (
                <button
                  key={g.id}
                  className="secondary"
                  onClick={() => update(train(m, g.id, { mode: 'auto' }, CFG).monster)}
                >
                  🏋 {g.name} (auto)
                </button>
              ))}
            </div>

            <div className="stats">
              <div>HP {m.stats.hp}</div>
              <div>MP {m.stats.mp}</div>
              <div>FUE {m.stats.fuerza}</div>
              <div>DEF {m.stats.defensa}</div>
              <div>INT {m.stats.inteligencia}</div>
              <div>AGI {m.stats.agilidad}</div>
            </div>

            {evoTarget && (
              <div className="row">
                <span className="muted">Puede evolucionar a {SPECIES[evoTarget].name}</span>
                <button onClick={() => update(evolve(m, evoTarget))}>✨ Evolucionar</button>
              </div>
            )}
          </>
        ) : (
          <div className="row">
            <span className="muted">{species.name} vivió {Math.round(m.ageHours)}h. Su legado continúa.</span>
            <button onClick={() => update(hatchHeir(m, Date.now(), CFG))}>🥚 Nacer heredero</button>
          </div>
        )}
      </div>
      <p className="muted">
        Prototipo single-player (Hito 1). Login, persistencia en servidor y peleas online
        están en el backend (lib/supabase, supabase/) y se conectan en los próximos hitos.
      </p>
    </main>
  );
}

function Bar({ label, value, low }: { label: string; value: number; low: boolean }) {
  return (
    <div className="bar">
      <span>{label}</span>
      <span className="track">
        <span className={`fill${low ? ' low' : ''}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </span>
      <span>{Math.round(value)}</span>
    </div>
  );
}
