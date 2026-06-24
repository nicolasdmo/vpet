'use client';

// Functional single-player game (R37/R38): real-time care, feeding, cleaning,
// training, branching evolution with animation, lifespan/death and heir inheritance
// — all driven by the tested engine, with procedural generic sprites.
//
// SCOPE: persistence is localStorage (stand-in for Supabase R2); Google auth (R1)
// and online PvP/ranking/push (R22/R30-R36) are in the backend code (lib/supabase,
// supabase/) and require a Supabase project to go live. This screen is the offline
// half and runs with zero cloud setup.

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
import { MonsterSprite, EggSprite } from '@/components/MonsterSprite';
import type { MonsterInstance } from '@/game/types.ts';

const KEY = 'bicho-battler:monster';

function load(now: number): MonsterInstance {
  if (typeof window !== 'undefined') {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as MonsterInstance;
      } catch {
        /* fall through to a fresh monster */
      }
    }
  }
  return createMonster('matecito', { now, cfg: CFG });
}

export default function Home() {
  const [m, setM] = useState<MonsterInstance | null>(null);
  const [evolving, setEvolving] = useState(false);
  const mRef = useRef<MonsterInstance | null>(null);

  const update = (next: MonsterInstance) => {
    mRef.current = next;
    setM(next);
    if (typeof window !== 'undefined') window.localStorage.setItem(KEY, JSON.stringify(next));
  };

  const tick = (cur: MonsterInstance): MonsterInstance => {
    const now = Date.now();
    const { monster } = simulateNeeds(cur, now, CFG);
    return advanceAge(monster, now, CFG).monster;
  };

  useEffect(() => {
    update(tick(load(Date.now())));
    const id = setInterval(() => {
      if (mRef.current) update(tick(mRef.current));
    }, 4000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doEvolve = (target: string) => {
    if (!m) return;
    setEvolving(true);
    setTimeout(() => {
      update(evolve(mRef.current!, target));
      setTimeout(() => setEvolving(false), 600);
    }, 500);
  };

  if (!m) return <main className="app">Cargando…</main>;

  const species = SPECIES[m.speciesId];
  const att = needsAttention(m, CFG);
  const evoTarget = resolveEvolution(m);
  const lifePct = Math.min(100, (m.ageHours / m.effectiveLifespanHours) * 100);

  return (
    <main className="app">
      <header className="topbar">
        <h1>Bicho Battler</h1>
        <span className="muted">gen {m.generation}</span>
      </header>

      <div className="screen">
        <div className="monster">
          <div className={`sprite${evolving ? ' evolving' : ''}`}>
            {m.alive ? <MonsterSprite species={species} /> : <EggSprite />}
          </div>
          <strong>{m.alive ? species.name : 'Descansa en paz'}</strong>
          <span className="muted">
            {m.alive
              ? `${species.stage}${isElder(m, CFG) ? ' · viejito' : ''} · ${species.types.join('/')}`
              : `${species.name} vivió ${Math.round(m.ageHours)}h`}
          </span>
        </div>

        {m.alive ? (
          <>
            <div className="bars">
              <Bar label="Hambre" value={m.fullness} low={att.hungry} />
              <Bar label="Limpieza" value={m.cleanliness} low={att.dirty} />
              <Bar label="Energía" value={m.energy} low={att.tired} />
              <Bar label="Vida" value={100 - lifePct} low={lifePct > 80} />
              <div className="muted small">
                Salud: {m.health}
                {m.poopCount > 0 ? ` · 💩×${m.poopCount}` : ''}
                {m.fatigue > 50 ? ' · cansado' : ''}
              </div>
            </div>

            <section>
              <h2>Comida</h2>
              <div className="actions">
                {Object.values(FOODS).map((f) => (
                  <button key={f.id} className="secondary" onClick={() => update(feed(m, f.id))}>
                    {f.name}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2>Cuidado y entrenamiento</h2>
              <div className="actions">
                <button onClick={() => update(cleanUp(m))}>🧼 Limpiar</button>
                {Object.values(MINIGAMES).map((g) => (
                  <button
                    key={g.id}
                    className="secondary"
                    onClick={() => update(train(m, g.id, { mode: 'auto' }, CFG).monster)}
                    title={g.description}
                  >
                    🏋 {g.name}
                  </button>
                ))}
              </div>
            </section>

            <div className="stats">
              <div>HP {m.stats.hp}</div>
              <div>MP {m.stats.mp}</div>
              <div>FUE {m.stats.fuerza}</div>
              <div>DEF {m.stats.defensa}</div>
              <div>INT {m.stats.inteligencia}</div>
              <div>AGI {m.stats.agilidad}</div>
            </div>

            {evoTarget && (
              <div className="evo">
                <span className="muted">Listo para evolucionar a {SPECIES[evoTarget].name}</span>
                <button onClick={() => doEvolve(evoTarget)} disabled={evolving}>
                  ✨ Evolucionar
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="evo">
            <span className="muted">Su linaje continúa: el heredero conserva técnicas y un poco de su fuerza.</span>
            <button onClick={() => update(hatchHeir(m, Date.now(), CFG))}>🥚 Nacer heredero</button>
          </div>
        )}
      </div>

      <p className="muted small foot">
        Versión single-player. Login con Google, persistencia en servidor y peleas online
        (Supabase) se activan al configurar las credenciales — ver README.
      </p>
    </main>
  );
}

function Bar({ label, value, low }: { label: string; value: number; low: boolean }) {
  return (
    <div className="bar">
      <span>{label}</span>
      <span className="track">
        <span
          className={`fill${low ? ' low' : ''}`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </span>
      <span>{Math.round(value)}</span>
    </div>
  );
}
