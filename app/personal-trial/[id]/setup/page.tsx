import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PersonalTrialSetupPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Ownership + draft check
  const { data: trial } = await supabase
    .from('personal_trials')
    .select('id, title, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('status', 'draft')
    .maybeSingle()

  if (!trial) notFound()

  return (
    <div className="app-shell">
      <div className="page-content" style={{ padding: '0 0 80px' }}>

        {/* Header */}
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
            href="/personalization"
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
            ← Персонализация
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
            {trial.title}
          </p>
        </div>

        <div
          style={{
            padding: '40px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: 40 }}>🛠️</span>
          <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>
            Маршрут готовится
          </p>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.65, maxWidth: 320 }}>
            Персональный план для этого испытания появится здесь. Скоро.
          </p>
          <a
            href="/personalization"
            style={{
              display: 'inline-block',
              marginTop: 16,
              padding: '12px 28px',
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text)',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Вернуться к персонализации
          </a>
        </div>

      </div>
    </div>
  )
}
