# Bicho Battler

Juego web (PWA) de mascota-monstruo de pelea en tiempo real — Remagotchi × Digimon World, con identidad argentina. Implementado a partir de [`specs/bicho-battler.md`](../specs/bicho-battler.md).

Esta es la **primera entrega por hitos** (el spec recomienda construir por hitos dado el tamaño). Lo que está hecho, probado y pendiente está abajo y en el reporte de cobertura del build.

## Qué hay en este repo

```
src/game/            Motor del juego (TS puro, sin framework) — PROBADO con node --test
  config/balance.ts  R39 — toda la configuración de balance (un solo lugar, editable)
  needs.ts           R4/R5 — necesidades en tiempo real desde timestamps
  foods.ts + data    R6 — comidas con efectos distintos
  lifespan.ts        R7/R8 — envejecimiento, longevidad, muerte
  training.ts + data R10-R12 — entrenamiento por minijuegos (auto o jugado)
  evolution.ts + data R13/R16 — árbol evolutivo ramificado (baby→mega)
  inheritance.ts     R18-R20 — herencia de técnicas + boost con tope
  combat.ts          R21-R25 — combate automático, determinístico, server-side
  aftermath.ts       R26-R28 — cansancio, lesión, contagio
  items.ts           R29 — curita / jeringa
  data/elementTypes  R24 — tipos + matriz de afinidades (Pokémon-style)
  data/monsters.ts   R14/R15 — roster (slice real del árbol; ver nota de alcance)
src/app/             UI Next.js — prototipo single-player del ciclo de cuidado (R37/R38)
src/lib/supabase/    Clientes Supabase (auth Google R1, persistencia R2)
supabase/schema.sql  Tablas + RLS (R2/R3/R8/R25/R30-R33)
supabase/functions/  Edge Function de combate server-authoritative (R22)
public/              PWA: manifest + service worker push (R34-R36)
```

## Correr

```bash
npm install
npm run dev        # prototipo single-player (no necesita Supabase)
npm test           # corre la suite del motor (node --test)
```

Para la parte online (auth, persistencia, peleas, ranking, push) hace falta:
1. Crear proyecto en **Supabase**, correr `supabase/schema.sql`, habilitar **Google** en Auth.
2. Copiar `.env.example` a `.env.local` y completar las claves.
3. Linkear el motor en `supabase/functions/_shared/engine/` y desplegar la función `resolve-battle`.
4. Generar claves VAPID y desplegar en **Vercel** con un Cron para las notificaciones (R36).

## Estado

- ✅ **Probado**: todo `src/game` (motor) — 17 tests pasando.
- 🟡 **Escrito, no desplegado/verificado** (sin credenciales en este entorno): UI Next.js, schema Supabase, Edge Function de combate, clientes auth, PWA/push.
- ⏳ **Pendiente de contenido**: completar el roster a 40+ (la estructura ya soporta agregarlos como datos), y conectar la UI online a los próximos hitos.

Ver el reporte de cobertura del `/build` para el detalle requisito por requisito.
