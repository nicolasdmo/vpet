// Supabase Edge Function (Deno) — server-authoritative battle resolution (R22).
// The client can only POST a challenge id it is allowed to accept; the ACTUAL fight
// is resolved here with the service role, so stats/results can't be forged.
//
// The pure combat engine under src/game/*.ts is Deno-compatible (explicit .ts
// extensions). Deploy by linking it into `_shared/engine/` (see README) so this
// import resolves; kept as the single source of truth shared with the client.
//
// NOTE: written but NOT deployed/verified here (no Supabase project/creds).

// @ts-nocheck — Deno runtime types differ from the Node/Next typecheck.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { DEFAULT_BALANCE } from '../_shared/engine/config/balance.ts';
import { resolveBattle, makeRng, type Combatant } from '../_shared/engine/combat.ts';
import { applyBattleAftermath } from '../_shared/engine/aftermath.ts';
import { SPECIES } from '../_shared/engine/data/monsters.ts';

function toCombatant(id: string, state: any): Combatant {
  return {
    id,
    stats: state.stats,
    types: SPECIES[state.speciesId]?.types ?? ['bestia'],
    techniques: state.techniques,
    health: state.health,
    fatigue: state.fatigue,
  };
}

Deno.serve(async (req: Request) => {
  try {
    const { challengeId } = await req.json();
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Load + validate the challenge (must be pending and not expired).
    const { data: ch } = await admin
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single();
    if (!ch || ch.status !== 'pending') {
      return new Response(JSON.stringify({ error: 'invalid challenge' }), { status: 400 });
    }
    if (new Date(ch.expires_at) < new Date()) {
      await admin.from('challenges').update({ status: 'expired' }).eq('id', challengeId);
      return new Response(JSON.stringify({ error: 'challenge expired' }), { status: 410 });
    }

    const { data: rows } = await admin
      .from('monsters')
      .select('owner_id, state')
      .in('owner_id', [ch.challenger_id, ch.challenged_id]);
    const byOwner = Object.fromEntries((rows ?? []).map((r: any) => [r.owner_id, r.state]));
    const aState = byOwner[ch.challenger_id];
    const bState = byOwner[ch.challenged_id];

    // Edge case: a participant has no battle-ready monster (egg/dead).
    if (!aState?.alive || !bState?.alive) {
      return new Response(JSON.stringify({ error: 'a monster is not battle-ready' }), { status: 409 });
    }

    const A = toCombatant(ch.challenger_id, aState);
    const B = toCombatant(ch.challenged_id, bState);

    const seed = (challengeId * 2654435761) >>> 0; // deterministic per challenge
    const result = resolveBattle(A, B, DEFAULT_BALANCE, makeRng(seed));
    const winnerId = result.winnerId ?? ch.challenger_id; // deterministic tie-break

    // Persist the battle + apply aftermath/rewards (server only).
    const { data: battle } = await admin
      .from('battles')
      .insert({
        challenger_id: ch.challenger_id,
        challenged_id: ch.challenged_id,
        winner_id: winnerId,
        log: result.log,
      })
      .select('id')
      .single();

    const newA = applyBattleAftermath(aState, { opponentWasSick: bState.health === 'sick' }, DEFAULT_BALANCE, makeRng(seed ^ 1));
    const newB = applyBattleAftermath(bState, { opponentWasSick: aState.health === 'sick' }, DEFAULT_BALANCE, makeRng(seed ^ 2));
    await admin.from('monsters').update({ state: newA }).eq('owner_id', ch.challenger_id);
    await admin.from('monsters').update({ state: newB }).eq('owner_id', ch.challenged_id);
    await admin.from('challenges').update({ status: 'accepted', battle_id: battle?.id }).eq('id', challengeId);

    return new Response(JSON.stringify({ winnerId, battleId: battle?.id, log: result.log }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
