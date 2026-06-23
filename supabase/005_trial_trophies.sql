-- ============================================================
-- Solo Level — Official Trial Trophies
-- Run manually in Supabase SQL Editor.
-- ============================================================

create table official_trial_trophies (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  trial_id    uuid        not null references official_trials(id) on delete cascade,
  trophy_key  text        not null,
  tier        text        not null,
  title       text        not null,
  description text        not null,
  unlocked_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

-- One trophy per (trial, key, tier) — prevents duplicate unlock on retry
create unique index official_trial_trophies_trial_key_tier_key
  on official_trial_trophies (trial_id, trophy_key, tier);

alter table official_trial_trophies enable row level security;

create policy "owner select trophies"
  on official_trial_trophies for select
  using (auth.uid() = user_id);

create policy "owner insert trophies"
  on official_trial_trophies for insert
  with check (auth.uid() = user_id);
