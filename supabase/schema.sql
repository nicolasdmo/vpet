-- Bicho Battler — Supabase schema (Postgres).
-- Covers persistence (R2), one active monster per account (R3), lineage on death
-- (R8), battle logs (R25), challenges (R30/R31), rewards/ranking (R32/R33).
-- NOTE: written but NOT deployed in this environment (no Supabase project/creds).
-- Auth (Google OAuth, R1) is handled by Supabase Auth; `auth.users` is the source
-- of identity and `profiles.id` references it.

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  -- R32 — experience + points (points are the currency for items, R29).
  -- Written ONLY by the server (resolve-battle Edge Function), never the client.
  exp int not null default 0,
  points int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- active monster (exactly one per profile, R3) ----------
create table if not exists public.monsters (
  owner_id uuid primary key references public.profiles (id) on delete cascade,
  -- Full MonsterInstance serialized as JSON (engine is the source of truth for shape).
  state jsonb not null,
  generation int not null default 1,
  updated_at timestamptz not null default now()
);

-- ---------- lineage / deceased history (R8) ----------
create table if not exists public.monster_history (
  id bigint generated always as identity primary key,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  species_id text not null,
  generation int not null,
  final_state jsonb not null,
  born_at timestamptz not null,
  died_at timestamptz not null default now()
);

-- ---------- challenges (R30, R31) ----------
create type challenge_status as enum ('pending', 'accepted', 'rejected', 'expired');

create table if not exists public.challenges (
  id bigint generated always as identity primary key,
  challenger_id uuid not null references public.profiles (id) on delete cascade,
  challenged_id uuid not null references public.profiles (id) on delete cascade,
  status challenge_status not null default 'pending',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '48 hours',
  battle_id bigint,
  check (challenger_id <> challenged_id)
);

-- ---------- battles (R25 log, R32 rewards) ----------
create table if not exists public.battles (
  id bigint generated always as identity primary key,
  challenger_id uuid not null references public.profiles (id),
  challenged_id uuid not null references public.profiles (id),
  winner_id uuid references public.profiles (id), -- null = draw
  log jsonb not null,
  created_at timestamptz not null default now()
);

-- ---------- ranking by win % with a minimum battle count (R33) ----------
create or replace view public.ranking as
with played as (
  select challenger_id as player_id, winner_id from public.battles
  union all
  select challenged_id as player_id, winner_id from public.battles
)
select
  p.id as player_id,
  pr.display_name,
  count(*) as battles,
  count(*) filter (where p.winner_id = p.player_id) as wins,
  round(100.0 * count(*) filter (where p.winner_id = p.player_id) / count(*), 1) as win_pct
from played p
join public.profiles pr on pr.id = p.player_id
group by p.id, pr.display_name
having count(*) >= 5 -- ranking.minBattlesToRank (keep in sync with balance config)
order by win_pct desc, wins desc;

-- ---------- Row Level Security ----------
-- Players read/write only their own monster; combat results are written ONLY by the
-- server (Edge Function with the service role), never by clients (R22 anti-cheat).
alter table public.profiles enable row level security;
alter table public.monsters enable row level security;
alter table public.monster_history enable row level security;
alter table public.challenges enable row level security;
alter table public.battles enable row level security;

create policy "profiles are readable by all authenticated users"
  on public.profiles for select using (auth.role() = 'authenticated');
create policy "users manage their own profile"
  on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "owner reads own monster"
  on public.monsters for select using (auth.uid() = owner_id);
create policy "owner writes own monster (care/training only)"
  on public.monsters for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "owner reads own history"
  on public.monster_history for select using (auth.uid() = owner_id);

create policy "see challenges you sent or received"
  on public.challenges for select
  using (auth.uid() = challenger_id or auth.uid() = challenged_id);
create policy "create challenges as yourself"
  on public.challenges for insert with check (auth.uid() = challenger_id);
create policy "respond to challenges sent to you"
  on public.challenges for update using (auth.uid() = challenged_id);

create policy "see battles you took part in"
  on public.battles for select
  using (auth.uid() = challenger_id or auth.uid() = challenged_id);
-- INSERT into battles + stat rewards is performed by the service role only (no client policy).
