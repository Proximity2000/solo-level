import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from './actions'
import WorkloadSettings from './WorkloadSettings'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!stats) redirect('/auth')

  const { data: userData } = await supabase
    .from('users')
    .select('daily_minutes')
    .eq('id', user.id)
    .single()

  return (
    <div className="app-shell">
      <div className="page-content" style={{ padding: '0 0 80px' }}>

        {/* Хедер */}
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
            Я
          </p>
        </div>

        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Email */}
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 12,
              padding: '14px 16px',
              border: '1px solid var(--border)',
            }}
          >
            <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Email</p>
            <p style={{ fontSize: 15, color: 'var(--text)', fontWeight: 500 }}>{user.email}</p>
          </div>

          {/* Статистика */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}
          >
            {[
              { label: 'Уровень', value: `${stats.level}` },
              { label: 'Всего XP', value: `${stats.total_xp}` },
              { label: 'Серия', value: stats.current_streak > 0 ? `🔥 ${stats.current_streak} дн.` : '—' },
              { label: 'Лучшая серия', value: stats.best_streak > 0 ? `${stats.best_streak} дн.` : '—' },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 12,
                  padding: '12px 14px',
                  border: '1px solid var(--border)',
                }}
              >
                <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Дата начала пути */}
          {stats.start_date && (
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 12,
                padding: '12px 16px',
                border: '1px solid var(--border)',
              }}
            >
              <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Путь начат</p>
              <p style={{ fontSize: 15, color: 'var(--text)', fontWeight: 500 }}>
                {new Date(stats.start_date).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}

          {/* Персонализация пути */}
          <div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                marginBottom: 12,
              }}
            >
              Персонализация пути
            </p>
            <WorkloadSettings dailyMinutes={userData?.daily_minutes ?? 30} />
          </div>

          {/* Заглушка */}
          <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
            Полный профиль появится позже
          </p>

          {/* Выйти */}
          <form action={signOut}>
            <button
              type="submit"
              className="btn btn-secondary"
              style={{ marginTop: 8 }}
            >
              Выйти
            </button>
          </form>
        </div>
      </div>

      {/* Нижняя навигация */}
      <nav className="bottom-nav">
        <a href="/personalization" className="nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          Персонализация
        </a>
        <a href="/path" className="nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Путь
        </a>
        <a href="/today" className="nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Сегодня
        </a>
        <a href="/legend" className="nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Легенда
        </a>
        <a href="/profile" className="nav-item active">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          Я
        </a>
      </nav>
    </div>
  )
}
