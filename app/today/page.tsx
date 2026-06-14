import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generateDailyMissions } from '@/lib/missions'
import { completeMission } from '@/lib/actions/missions'
import { getProgressToNextLevel } from '@/lib/xp'
import MissionCard from '@/components/MissionCard'
import type { DailyMission, Task } from '@/lib/types'

export default async function TodayPage() {
  const supabase = await createClient()

  // 1. Текущий пользователь
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // 2. user_stats
  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!stats) redirect('/auth')

  // 3. Дата сегодня
  const today = new Date().toISOString().split('T')[0]

  // 3a. Streak reset: если последний daily_log не сегодня и не вчера — сбрасываем серию
  if (stats.current_streak > 0) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const { data: recentLog } = await supabase
      .from('daily_log')
      .select('date, result')
      .eq('user_id', user.id)
      .in('date', [today, yesterdayStr])
      .order('date', { ascending: false })
      .limit(1)
      .single()

    // Серия должна сброситься если:
    // — нет лога за сегодня или вчера
    // — или последний лог старше вчера
    const lastDate = recentLog?.date ?? null
    const streakAlive = lastDate === today || lastDate === yesterdayStr
    if (!streakAlive) {
      await supabase
        .from('user_stats')
        .update({ current_streak: 0 })
        .eq('user_id', user.id)
      stats.current_streak = 0
    }
  }

  // 4. Миссии на сегодня
  let { data: missions } = await supabase
    .from('daily_missions')
    .select('*, task:tasks_pool(*)')
    .eq('user_id', user.id)
    .eq('date', today)
    .order('type', { ascending: false }) // mission перед challenge

  // 5. Если миссий нет — генерируем
  if (!missions || missions.length === 0) {
    try {
      missions = await generateDailyMissions(user.id, today, supabase)
    } catch {
      missions = []
    }
  }

  // 6. XP прогресс
  const { current: xpCurrent, needed: xpNeeded, progress } = getProgressToNextLevel(
    stats.total_xp,
    stats.level
  )

  // 7. Server Action-обёртка (передаётся в Client Component)
  async function handleComplete(missionId: string, type: 'full' | 'simplified' | 'minimum') {
    'use server'
    await completeMission(missionId, type)
  }

  const typedMissions = (missions ?? []) as unknown as (DailyMission & { task: Task })[]

  return (
    <div className="app-shell">
      <div className="page-content" style={{ padding: '0 0 80px' }}>

        {/* ── Хедер ── */}
        <div
          style={{
            padding: '20px 20px 16px',
            borderBottom: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            background: 'var(--bg)',
            zIndex: 10,
          }}
        >
          {/* Верхняя строка */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: 'var(--accent)',
                  textTransform: 'uppercase',
                  marginBottom: 2,
                }}
              >
                SOLO LEVEL
              </p>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
                Уровень {stats.level}
              </p>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                Твой соперник — вчерашняя версия тебя.
              </p>
            </div>

            {/* Streak */}
            {stats.current_streak > 0 && (
              <span className="streak">🔥 {stats.current_streak} дн.</span>
            )}
          </div>

          {/* XP Bar */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 6,
                fontSize: 12,
                color: 'var(--muted)',
              }}
            >
              <span>XP: {xpCurrent} / {xpNeeded}</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div className="xp-bar">
              <div className="xp-bar-fill" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
        </div>

        {/* ── Миссии ── */}
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: 4,
            }}
          >
            Миссии на сегодня
          </p>

          {typedMissions.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--muted)',
                fontSize: 15,
              }}
            >
              <p style={{ fontSize: 32, marginBottom: 12 }}>😴</p>
              <p>Миссии не найдены. Попробуй обновить страницу.</p>
            </div>
          ) : (
            typedMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onComplete={handleComplete}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Нижняя навигация (заглушка) ── */}
      <nav className="bottom-nav">
        <a href="/today" className="nav-item active">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Сегодня
        </a>
        <a href="/path" className="nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Путь
        </a>
        <a href="/legend" className="nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Легенда
        </a>
        <a href="/profile" className="nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          Я
        </a>
      </nav>
    </div>
  )
}
