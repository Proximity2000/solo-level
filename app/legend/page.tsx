import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserSnapshot, UserStats, UserGoal } from '@/lib/types'

const ACTIVITY_LABELS: Record<string, string> = {
  none: 'Не занимаюсь',
  sometimes: 'Иногда',
  regular: 'Регулярно',
}

const READING_LABELS: Record<string, string> = {
  rarely: 'Редко',
  sometimes: 'Иногда',
  regular: 'Регулярно',
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--muted)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.07em',
        marginBottom: 12,
      }}
    >
      {children}
    </p>
  )
}

function InfoRow({ label, value }: { label: string; value: string | number | null }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <span style={{ fontSize: 14, color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

export default async function LegendPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // user_stats
  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!stats) redirect('/auth')

  // user_snapshot (maybeSingle: null if no row, error if >1 rows)
  const { data: snapshot } = await supabase
    .from('user_snapshot')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // завершённые цели
  const { data: goals } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  const typedSnapshot = snapshot as UserSnapshot | null
  const typedStats = stats as UserStats
  const typedGoals = (goals ?? []) as UserGoal[]

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
            Моя легенда
          </p>
        </div>

        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* ─── Моё испытание ─── */}
          <div>
            <SectionTitle>Моё испытание</SectionTitle>
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 12,
                padding: '18px 16px',
                border: '1px solid var(--border)',
              }}
            >
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 14 }}>
                Выбери одно большое испытание, которое войдёт в твою Легенду.
              </p>
              <a
                href="/trials"
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  borderRadius: 10,
                  background: 'var(--accent)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Выбрать испытание
              </a>
            </div>
          </div>

          {/* ─── Точка старта ─── */}
          <div>
            <SectionTitle>Точка старта</SectionTitle>
            {typedSnapshot ? (
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 12,
                  padding: '4px 16px',
                  border: '1px solid var(--border)',
                }}
              >
                <InfoRow label="Возраст" value={typedSnapshot.age !== null ? `${typedSnapshot.age} лет` : null} />
                <InfoRow label="Рост" value={typedSnapshot.height_cm !== null ? `${typedSnapshot.height_cm} см` : null} />
                <InfoRow label="Вес" value={typedSnapshot.weight_kg !== null ? `${typedSnapshot.weight_kg} кг` : null} />
                <InfoRow
                  label="Физическая активность"
                  value={typedSnapshot.activity_level ? ACTIVITY_LABELS[typedSnapshot.activity_level] ?? typedSnapshot.activity_level : null}
                />
                <InfoRow
                  label="Чтение"
                  value={typedSnapshot.reading_level ? READING_LABELS[typedSnapshot.reading_level] ?? typedSnapshot.reading_level : null}
                />
                <InfoRow
                  label="Дисциплина"
                  value={typedSnapshot.discipline_score !== null ? `${typedSnapshot.discipline_score}/10` : null}
                />
                {typedSnapshot.goal_3months && (
                  <div style={{ padding: '10px 0' }}>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Цель на 3 месяца</p>
                    <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>
                      {typedSnapshot.goal_3months}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 12,
                  padding: '16px',
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                }}
              >
                <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 12 }}>
                  Точка старта не заполнена
                </p>
                <a
                  href="/onboarding/diagnostic?returnTo=/legend"
                  style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    borderRadius: 10,
                    background: 'var(--accent)',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Заполнить точку старта
                </a>
              </div>
            )}
          </div>

          {/* ─── Текущий путь ─── */}
          <div>
            <SectionTitle>Текущий путь</SectionTitle>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
              }}
            >
              {[
                { label: 'Уровень', value: `${typedStats.level}` },
                { label: 'Всего XP', value: `${typedStats.total_xp}` },
                { label: 'Серия', value: typedStats.current_streak > 0 ? `🔥 ${typedStats.current_streak} дн.` : '—' },
                { label: 'Лучшая серия', value: typedStats.best_streak > 0 ? `${typedStats.best_streak} дн.` : '—' },
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
          </div>

          {/* ─── Челленджи Solo Level ─── */}
          <div>
            <SectionTitle>Челленджи Solo Level</SectionTitle>
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 12,
                padding: '18px 16px',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 22 }}>🏅</span>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                  Челленджи Solo Level
                </p>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--muted)',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid var(--border)',
                    borderRadius: 20,
                    padding: '3px 10px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase' as const,
                    flexShrink: 0,
                  }}
                >
                  Скоро
                </span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 10 }}>
                Скоро здесь появятся короткие испытания на 7–30 дней: 7 дней без сладких напитков, 24 часа без соцсетей, 7 дней утренней прогулки.
              </p>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, opacity: 0.7 }}>
                Это будут добровольные вызовы для тех, кто хочет проверить себя и получить особые трофеи Легенды.
              </p>
            </div>
          </div>

          {/* ─── История целей ─── */}
          <div>
            <SectionTitle>История целей</SectionTitle>
            {typedGoals.length === 0 ? (
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 12,
                  padding: '16px',
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                  color: 'var(--muted)',
                  fontSize: 14,
                }}
              >
                Завершённых целей пока нет
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {typedGoals.map((goal) => (
                  <div
                    key={goal.id}
                    style={{
                      background: 'var(--surface)',
                      borderRadius: 12,
                      padding: '14px 16px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500, lineHeight: 1.4 }}>
                        ✅ {goal.title}
                      </p>
                      {goal.completed_in_days !== null && (
                        <span
                          style={{
                            fontSize: 11,
                            color: 'var(--muted)',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                          }}
                        >
                          {goal.completed_in_days} дн.
                        </span>
                      )}
                    </div>
                    {goal.completed_at && (
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                        {new Date(goal.completed_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
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
