import Link from 'next/link'

export default function WelcomePage() {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '64px 24px 48px',
    }}>
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <div
            key={s}
            style={{
              height: 3,
              flex: 1,
              borderRadius: 2,
              background: s === 1 ? 'var(--accent)' : 'var(--border)',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <p style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            SOLO LEVEL
          </p>
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            color: 'var(--text)',
            marginBottom: 24,
          }}>
            Добро пожаловать.
          </h1>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            color: 'var(--muted)',
            fontSize: 16,
            lineHeight: 1.6,
          }}>
            <p>Это не социальная сеть.</p>
            <p>Не игра.</p>
            <p>Не очередной трекер привычек.</p>
            <p style={{ color: 'var(--text)', fontWeight: 500 }}>
              Это система развития человека через реальные действия.
            </p>
          </div>
        </div>
      </div>

      {/* Button */}
      <Link href="/onboarding/path" className="btn btn-primary">
        Начать
      </Link>
    </div>
  )
}
