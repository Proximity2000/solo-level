-- ============================================================
-- 004_trial_daily_logs.sql — Official Trial Daily Completion Log
-- Run manually in Supabase SQL Editor
-- ============================================================

-- ── Table ────────────────────────────────────────────────────
create table official_trial_daily_logs (
  id             uuid        primary key default gen_random_uuid(),
  trial_id       uuid        not null references official_trials(id) on delete cascade,
  user_id        uuid        not null references auth.users(id) on delete cascade,
  log_date       date        not null default current_date,
  day_number     integer     not null,
  mission_key    text        not null,
  mission_title  text        not null,
  completed_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── One log row per trial per calendar day ───────────────────
create unique index official_trial_daily_logs_trial_date_key
  on official_trial_daily_logs (trial_id, log_date);

-- ── Indexes ──────────────────────────────────────────────────
create index official_trial_daily_logs_user_id_idx
  on official_trial_daily_logs (user_id);

create index official_trial_daily_logs_trial_id_idx
  on official_trial_daily_logs (trial_id);

-- ── RLS ──────────────────────────────────────────────────────
alter table official_trial_daily_logs enable row level security;

create policy "Users can select own trial daily logs"
  on official_trial_daily_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own trial daily logs"
  on official_trial_daily_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own trial daily logs"
  on official_trial_daily_logs for update
  using (auth.uid() = user_id);

-- ── updated_at trigger ───────────────────────────────────────
-- Reuses set_updated_at() created in 003_trials.sql.
-- If running this file standalone (without 003), uncomment the
-- function block below first.
--
-- create or replace function set_updated_at()
-- returns trigger as $$
-- begin
--   new.updated_at = now();
--   return new;
-- end;
-- $$ language plpgsql;

create trigger official_trial_daily_logs_updated_at
  before update on official_trial_daily_logs
  for each row execute function set_updated_at();
