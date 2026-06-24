import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import WorkloadSettings from '@/app/profile/WorkloadSettings'
import FocusSpheresSettings from './FocusSpheresSettings'
import { getEffectiveSmokingTrialDay } from '@/lib/smoking-trial'
import { getSmokingTrialProgress } from '@/lib/smoking-trial-milestones'
import AbandonTrialButton from './AbandonTrialButton'
import AbandonPersonalTrialButton from './AbandonPersonalTrialButton'
import type { OfficialTrial, PersonalTrial } from '@/lib/types'
import { PERSONAL_TRIAL_INTENSITY_LABELS, PERSONAL_TRIAL_MINUTES_LABELS } from '@/lib/types'

export default async function PersonalizationPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: userData } = await supabase
    .from('users')
    .select('daily_minutes, preferred_spheres')
    .eq('id', user.id)
    .single()

  const { data: activeTrialRaw } = await supabase
    .from('official_trials')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  const activeTrial = activeTrialRaw as OfficialTrial | null

  const today = new Date().toISOString().split('T')[0]

  const { data: latestTrialLog } = activeTrial
    ? await supabase
        .from('official_trial_daily_logs')
        .select('log_date, day_number, completed_at')
        .eq('trial_id', activeTrial.id)
        .order('log_date', { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null }

  const effectiveTrialDay = activeTrial
    ? getEffectiveSmokingTrialDay(activeTrial, latestTrialLog, today)
    : 1

  const trialProgress = getSmokingTrialProgress(effectiveTrialDay)

  // Active personal trial
  const { data: activePersonalTrialRaw } = await supabase
    .from('personal_trials')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  const activePersonalTrial = activePersonalTrialRaw as PersonalTrial | null

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
            Персонализация
          </p>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 6, lineHeight: 1.5 }}>
            Настрой свой путь: нагрузку, акценты развития и испытания.
          </p>
        </div>

        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ─── Режим нагрузки ─── */}
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
              Режим нагрузки
            </p>
            <WorkloadSettings dailyMinutes={userData?.daily_minutes ?? 30} />
          </div>

          {/* ─── Акценты развития ─── */}
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
              Акценты развития
            </p>
            <FocusSpheresSettings initialSpheres={userData?.preferred_spheres ?? []} />
          </div>

          {/* ─── Официальное испытание ─── */}
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
              Официальное испытание
            </p>
            {activeTrial ? (
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 12,
                  padding: '18px 16px',
                  border: '1px solid var(--accent)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>🚭</span>
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginBottom: 2 }}>
                      Активно
                    </p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>
                      {activeTrial.title}
                    </p>
                  </div>
                </div>
                {/* Day chip */}
                <div style={{ marginBottom: 12 }}>
                  <span
                    style={{
                      fontSize: 12, fontWeight: 600,
                      color: 'var(--muted)',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--border)',
                      borderRadius: 20, padding: '3px 10px',
                    }}
                  >
                    День {effectiveTrialDay}
                  </span>
                </div>

                {/* Milestone progress block */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    marginBottom: 14,
                  }}
                >
                  {trialProgress.completed ? (
                    <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>
                      🏆 Золотой путь пройден
                    </p>
                  ) : trialProgress.previousMilestone ? (
                    <>
                      <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
                        Следующий трофей
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                        {trialProgress.nextMilestone!.emoji} {trialProgress.nextMilestone!.title}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>
                        До него: {trialProgress.daysRemaining} дн.
                      </p>
                    </>
                  ) : (
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
                      До первого трофея: {trialProgress.daysRemaining} дн.
                    </p>
                  )}
                  {!trialProgress.completed && (
                    <>
                      {/* Game-like progress bar */}
                      <div
                        style={{
                          height: 3,
                          background: 'rgba(255,255,255,0.08)',
                          borderRadius: 1,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${trialProgress.progressPercent}%`,
                            background: trialProgress.nextMilestone!.color,
                            borderRadius: 1,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginTop: 4,
                        }}
                      >
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                          {trialProgress.previousMilestone ? `День ${trialProgress.previousMilestone.day}` : 'Старт'}
                        </span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                          День {trialProgress.nextMilestone!.day}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <a
                  href="/trials/smoking"
                  style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    borderRadius: 10,
                    background: 'transparent',
                    color: 'var(--accent)',
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: 'none',
                    border: '1px solid var(--accent)',
                  }}
                >
                  Открыть испытание
                </a>
                <AbandonTrialButton />
              </div>
            ) : (
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 12,
                  padding: '18px 16px',
                  border: '1px solid var(--border)',
                }}
              >
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.55, marginBottom: 14 }}>
                  Выбери большое испытание, которое войдёт в твою Легенду.
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
            )}
          </div>

          {/* ─── Личное испытание ─── */}
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
              Личное испытание
            </p>

            {activePersonalTrial ? (
              /* ── Active personal trial card ── */
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 12,
                  padding: '18px 16px',
                  border: '1px solid var(--accent)',
                }}
              >
                <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginBottom: 4 }}>
                  Активно
                </p>
                <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>
                  {activePersonalTrial.title}
                </p>

                {/* Why — one truncated line */}
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--muted)',
                    marginBottom: 14,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Почему: {activePersonalTrial.why}
                </p>

                {/* Chips */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: 12, fontWeight: 600,
                      color: 'var(--muted)',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--border)',
                      borderRadius: 20, padding: '3px 10px',
                    }}
                  >
                    {PERSONAL_TRIAL_INTENSITY_LABELS[activePersonalTrial.intensity]}
                  </span>
                  <span
                    style={{
                      fontSize: 12, fontWeight: 600,
                      color: 'var(--muted)',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--border)',
                      borderRadius: 20, padding: '3px 10px',
                    }}
                  >
                    {PERSONAL_TRIAL_MINUTES_LABELS[activePersonalTrial.daily_minutes]}
                  </span>
                </div>

                <AbandonPersonalTrialButton />
              </div>
            ) : (
              /* ── Empty state ── */
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 12,
                  padding: '18px 16px',
                  border: '1px solid var(--border)',
                }}
              >
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.55, marginBottom: 14 }}>
                  Создай свой личный вызов — свою цель на любой срок. Он войдёт в Легенду.
                </p>
                <a
                  href="/personal-trial/new"
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
                  Создать испытание
                </a>
              </div>
            )}
          </div>

          {/* ─── Челленджи Solo Level ─── */}
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
              Челленджи Solo Level
            </p>
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 12,
                padding: '18px 16px',
                border: '1px solid var(--border)',
                opacity: 0.65,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>🏅</span>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
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
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.55 }}>
                Короткие добровольные вызовы на 7–30 дней с особыми трофеями Легенды.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Нижняя навигация */}
      <nav className="bottom-nav">
        <a href="/personalization" className="nav-item active">
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
