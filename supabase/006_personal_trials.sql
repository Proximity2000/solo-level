-- ============================================================
-- 006_personal_trials.sql — Personal Trials
-- Run manually in Supabase SQL Editor after 005_trial_trophies.sql
-- ============================================================

-- ── Table ────────────────────────────────────────────────────
create table personal_trials (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users(id) on delete cascade,
  title          text        not null,
  why            text        not null,
  daily_minutes  int         not null,
  intensity      text        not null,
  status         text        not null default 'active',
  started_at     date        not null default current_date,
  completed_at   timestamptz null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint personal_trials_status_check
    check (status in ('active', 'completed', 'abandoned')),
  constraint personal_trials_intensity_check
    check (intensity in ('soft', 'medium', 'focused')),
  constraint personal_trials_minutes_check
    check (daily_minutes in (10, 30, 60))
);

-- ── One active personal trial per user ───────────────────────
create unique index personal_trials_one_active_per_user
  on personal_trials (user_id)
  where (status = 'active');

-- ── Indexes ──────────────────────────────────────────────────
create index personal_trials_user_status_idx on personal_trials (user_id, status);

-- ── RLS ──────────────────────────────────────────────────────
alter table personal_trials enable row level security;

create policy "owner select personal_trials"
  on personal_trials for select
  using (auth.uid() = user_id);

create policy "owner insert personal_trials"
  on personal_trials for insert
  with check (auth.uid() = user_id);

create policy "owner update personal_trials"
  on personal_trials for update
  using (auth.uid() = user_id);

-- ── updated_at trigger ───────────────────────────────────────
-- Reuses set_updated_at() created in 003_trials.sql
create trigger personal_trials_updated_at
  before update on personal_trials
  for each row execute function set_updated_at();
