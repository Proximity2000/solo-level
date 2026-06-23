'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { abandonOfficialTrial } from './actions'

export default function AbandonTrialButton() {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleConfirm() {
    setError(null)
    startTransition(async () => {
      const result = await abandonOfficialTrial()
      if ('success' in result) {
        setShowConfirm(false)
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <>
      {/* Subtle secondary text button */}
      <button
        onClick={() => setShowConfirm(true)}
        style={{
          background: 'none',
          border: 'none',
          padding: '4px 0',
          fontSize: 13,
          color: 'var(--muted)',
          cursor: 'pointer',
          display: 'block',
          marginTop: 14,
          textDecoration: 'underline',
          textDecorationColor: 'rgba(255,255,255,0.15)',
          textUnderlineOffset: '3px',
        }}
      >
        Завершить испытание
      </button>

      {/* Confirmation bottom sheet */}
      {showConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '0 0 32px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isPending) setShowConfirm(false)
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: '20px 20px 16px 16px',
              padding: '28px 24px 24px',
              width: '100%',
              maxWidth: 480,
              boxShadow: '0 -4px 32px rgba(0,0,0,0.4)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Handle */}
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                background: 'var(--border)',
                margin: '0 auto 24px',
              }}
            />

            <p
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: 'var(--text)',
                marginBottom: 10,
                lineHeight: 1.25,
              }}
            >
              Завершить испытание?
            </p>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 28 }}>
              Ты можешь остановиться без наказаний. История пути и полученные трофеи останутся в Легенде.
            </p>

            {error && (
              <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 12, textAlign: 'center' }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 12,
                  border: '1px solid rgba(239,68,68,0.35)',
                  background: 'rgba(239,68,68,0.08)',
                  color: '#ef4444',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  opacity: isPending ? 0.6 : 1,
                }}
              >
                {isPending ? 'Завершаем...' : 'Завершить испытание'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text)',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Продолжить путь
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
