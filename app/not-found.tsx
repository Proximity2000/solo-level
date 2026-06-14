import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="app-shell">
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          gap: 24,
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 56 }}>⚔️</p>
        <div>
          <p
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: 8,
            }}
          >
            Страница не найдена
          </p>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>
            Такой страницы не существует
          </p>
        </div>
        <Link href="/today" className="btn btn-primary" style={{ maxWidth: 240 }}>
          Вернуться на главную
        </Link>
      </div>
    </div>
  )
}
