-- ============================================================
-- 007_personal_trial_drafts.sql
-- Extend personal_trials to support AI v2 draft flow
-- ============================================================

-- 1. Make daily_minutes and intensity nullable (draft rows won't have them yet)
ALTER TABLE personal_trials ALTER COLUMN daily_minutes DROP NOT NULL;
ALTER TABLE personal_trials ALTER COLUMN intensity DROP NOT NULL;

-- 2. Add new columns
ALTER TABLE personal_trials
  ADD COLUMN IF NOT EXISTS category            text         NULL,
  ADD COLUMN IF NOT EXISTS questionnaire       jsonb        NULL,
  ADD COLUMN IF NOT EXISTS plan_status         text         NULL,
  ADD COLUMN IF NOT EXISTS plan_generated_at   timestamptz  NULL,
  ADD COLUMN IF NOT EXISTS generation_attempts integer      NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS regeneration_used   boolean      NOT NULL DEFAULT false;

-- 3. Update status constraint to include 'draft'
ALTER TABLE personal_trials
  DROP CONSTRAINT IF EXISTS personal_trials_status_check;
ALTER TABLE personal_trials
  ADD CONSTRAINT personal_trials_status_check
    CHECK (status IN ('draft', 'active', 'completed', 'abandoned'));

-- 4. Add category constraint
ALTER TABLE personal_trials
  ADD CONSTRAINT personal_trials_category_check
    CHECK (
      category IS NULL OR
      category IN ('routine', 'learning', 'fitness', 'focus', 'finance', 'project', 'custom')
    );

-- 5. Add plan_status constraint
ALTER TABLE personal_trials
  ADD CONSTRAINT personal_trials_plan_status_check
    CHECK (
      plan_status IS NULL OR
      plan_status IN ('draft', 'generating', 'ready', 'failed')
    );

-- 6. Partial unique index: only one draft per user at a time
CREATE UNIQUE INDEX IF NOT EXISTS personal_trials_one_draft_per_user
  ON personal_trials (user_id)
  WHERE (status = 'draft');
