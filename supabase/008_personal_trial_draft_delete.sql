-- ============================================================
-- 008_personal_trial_draft_delete.sql
-- Add DELETE RLS policy for personal_trials
--
-- Migration 006 created SELECT / INSERT / UPDATE policies but
-- omitted DELETE, causing cancelDraftPersonalTrial() to silently
-- affect 0 rows while returning no SQL error.
--
-- This policy allows an authenticated user to delete ONLY their
-- own rows that are still in 'draft' status.
-- active / completed / abandoned rows are NOT covered and remain
-- permanently protected from deletion through this policy.
-- ============================================================

CREATE POLICY "owner_can_delete_own_draft_personal_trial"
  ON personal_trials
  FOR DELETE
  USING (
    auth.uid() = user_id
    AND status = 'draft'
  );
