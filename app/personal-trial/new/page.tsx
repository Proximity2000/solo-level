import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PersonalTrialForm from './PersonalTrialForm'

export default async function NewPersonalTrialPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Redirect if a draft or active personal trial already exists
  const { data: existing } = await supabase
    .from('personal_trials')
    .select('id, status')
    .eq('user_id', user.id)
    .in('status', ['draft', 'active'])
    .maybeSingle()

  if (existing) redirect('/personalization')

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
            Личное испытание
          </p>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 6, lineHeight: 1.5 }}>
            Твой личный вызов. Только ты решаешь, когда и как его проходить.
          </p>
        </div>

        <PersonalTrialForm />
      </div>
    </div>
  )
}
