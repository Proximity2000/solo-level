import Link from 'next/link'

export default function PathPage() {
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
              background: s <= 2 ? 'var(--accent)' : 'var(--border)',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 800,
          lineHeight: 1.25,
          letterSpacing: '-0.02em',
          color: 'var(--text)',
        }}>
          Ты начинаешь новый путь.
        </h1>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          color: 'var(--muted)',
          fontSize: 16,
          lineHeight: 1.65,
        }}>
          <p>Не путь против других.</p>
          <p style={{ color: 'var(--text)', fontWeight: 600 }}>
            Путь против вчерашней версии себя.
          </p>
          <p>Каждый день ты можешь стать немного сильнее.</p>
          <p>Немного дисциплинированнее.</p>
          <p>Немного осознаннее.</p>
          <p style={{ color: 'var(--text)', fontWeight: 500 }}>
            Маленькие шаги складываются в большие изменения.
          </p>
        </div>
      </div>

      {/* Button */}
      <Link href="/onboarding/promise" className="btn btn-primary">
        Я готов начать
      </Link>
    </div>
  )
}
