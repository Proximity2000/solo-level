import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { OfficialTrial } from '@/lib/types'

const COMING_SOON = [
  { title: 'Меньше соцсетей', emoji: '📵' },
  { title: 'Без сахара', emoji: '🍬' },
  { title: 'Наладить сон', emoji: '🌙' },
]

export default async function TrialsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: activeTrialRaw } = await supabase
    .from('official_trials')
    .select('id, trial_key, title, current_day')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  const activeTrial = activeTrialRaw as Pick<OfficialTrial, 'id' | 'trial_key' | 'title' | 'current_day'> | null

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
          <a
            href="/legend"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: 'var(--muted)',
              textDecoration: 'none',
              marginBottom: 10,
            }}
          >
            ← Легенда
          </a>
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
            Испытания Solo Level
          </p>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 6, lineHeight: 1.5 }}>
            Выбери одно большое испытание. Оно станет частью твоей Легенды.
          </p>
        </div>

        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Карточка "Бросить курить" — активная или стартовая */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--accent)',
              borderRadius: 16,
              padding: '20px 18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 26 }}>🚭</span>
              <div>
                {activeTrial && activeTrial.trial_key === 'smoking' ? (
                  <>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 2 }}>
                      Активно
                    </p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>
                      Бросить курить
                    </p>
                  </>
                ) : (
                  <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>
                    Бросить курить
                  </p>
                )}
              </div>
            </div>

            {activeTrial && activeTrial.trial_key === 'smoking' ? (
              <>
                {/* Активное состояние */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  <span
                    style={{
                      fontSize: 12, fontWeight: 600,
                      color: 'var(--muted)',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--border)',
                      borderRadius: 20, padding: '3px 10px',
                    }}
                  >
                    День {activeTrial.current_day}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 18 }}>
                  Испытание уже идёт. Продолжай путь в сегодняшних миссиях.
                </p>
                <a
                  href="/personalization"
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '13px',
                    borderRadius: 12,
                    background: 'var(--accent)',
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 700,
                    textAlign: 'center',
                    textDecoration: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  Открыть испытание
                </a>
              </>
            ) : (
              <>
                {/* Стартовое состояние */}
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 14 }}>
                  Персональный путь, который поможет разобраться с привычкой, триггерами и постепенно выйти из зависимости.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                  {['Никотин', 'Ритуал', 'Стресс', '7 / 30 / 90 дней'].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--accent)',
                        background: 'rgba(124,92,252,0.12)',
                        border: '1px solid rgba(124,92,252,0.25)',
                        borderRadius: 20,
                        padding: '3px 10px',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href="/trials/smoking"
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '13px',
                    borderRadius: 12,
                    background: 'var(--accent)',
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 700,
                    textAlign: 'center',
                    textDecoration: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  Начать опрос
                </a>
              </>
            )}
          </div>

          {/* Заголовок раздела */}
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginTop: 8,
            }}
          >
            Скоро
          </p>

          {/* Заблокированные карточки */}
          {COMING_SOON.map(({ title, emoji }) => (
            <div
              key={title}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '18px',
                opacity: 0.55,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>{emoji}</span>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{title}</p>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--muted)',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                  padding: '3px 10px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Скоро
              </span>
            </div>
          ))}
        </div>
      </div>

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
        <a href="/legend" className="nav-item active">
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
