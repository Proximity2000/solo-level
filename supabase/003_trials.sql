-- ============================================================
-- 003_trials.sql — Official Trials
-- Run manually in Supabase SQL Editor
-- ============================================================

-- ── Table ────────────────────────────────────────────────────
create table official_trials (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  trial_key      text not null,
  title          text not null,
  status         text not null default 'active',
  started_at     date not null default current_date,
  completed_at   date null,
  mode           text null,
  profile_types  text[] default '{}',
  answers        jsonb not null default '{}',
  current_day    int not null default 1,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  constraint official_trials_status_check check (status in ('active', 'completed', 'abandoned'))
);

-- ── Only one active official trial per user ──────────────────
create unique index official_trials_one_active_per_user
  on official_trials (user_id)
  where (status = 'active');

-- ── Indexes ──────────────────────────────────────────────────
create index official_trials_user_id_idx     on official_trials (user_id);
create index official_trials_user_status_idx on official_trials (user_id, status);
create index official_trials_user_trial_idx  on official_trials (user_id, trial_key);

-- ── RLS ──────────────────────────────────────────────────────
alter table official_trials enable row level security;

create policy "Users can select own official_trials"
  on official_trials for select
  using (auth.uid() = user_id);

create policy "Users can insert own official_trials"
  on official_trials for insert
  with check (auth.uid() = user_id);

create policy "Users can update own official_trials"
  on official_trials for update
  using (auth.uid() = user_id);

-- ── updated_at trigger ───────────────────────────────────────
-- Creates the function if it does not already exist.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger official_trials_updated_at
  before update on official_trials
  for each row execute function set_updated_at();
