-- ЗАПУСТИ ЭТО В SUPABASE → SQL Editor
-- Добавляет RLS-политики для таблицы user_snapshot
-- (без них SELECT возвращает пустой результат)

-- Убедимся, что RLS включён
ALTER TABLE user_snapshot ENABLE ROW LEVEL SECURITY;

-- SELECT: пользователь видит только свой snapshot
CREATE POLICY IF NOT EXISTS "user_snapshot_select_own"
  ON user_snapshot FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: пользователь может создать свой snapshot
CREATE POLICY IF NOT EXISTS "user_snapshot_insert_own"
  ON user_snapshot FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: пользователь может обновить свой snapshot
CREATE POLICY IF NOT EXISTS "user_snapshot_update_own"
  ON user_snapshot FOR UPDATE
  USING (auth.uid() = user_id);
