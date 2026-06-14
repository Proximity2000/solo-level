'use client'

type Props = {
  onConfirm: () => void
  onCancel: () => void
  isPending?: boolean
}

export default function HonestyModal({ onConfirm, onCancel, isPending }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: '24px 24px 0 0',
          padding: '32px 24px 48px',
          width: '100%',
          maxWidth: 430,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ textAlign: 'center', fontSize: 36 }}>🤝</div>

        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: 'var(--text)',
            lineHeight: 1.3,
            textAlign: 'center',
          }}
        >
          Ты действительно выполнил это задание?
        </h2>

        <div
          style={{
            background: 'var(--surface2)',
            borderRadius: 12,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Помни:
          </p>
          <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.55 }}>
            Ты развиваешь себя.
          </p>
          <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.55 }}>
            Обмануть приложение легко.
          </p>
          <p style={{ fontSize: 15, color: '#ef4444', fontWeight: 600, lineHeight: 1.55 }}>
            Обмануть себя — намного дороже.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Сохранение...' : 'Да, выполнил'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isPending}
          >
            Вернуться
          </button>
        </div>
      </div>
    </div>
  )
}
