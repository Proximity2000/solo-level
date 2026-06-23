'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { completeTrialMission } from './actions'

type Props = {
  currentDay: number
  missionTitle: string
  missionDescription: string
  isCompleted: boolean
}

export default function TrialMissionCard({ currentDay, missionTitle, missionDescription, isCompleted }: Props) {
  const router = useRouter()
  const [completed, setCompleted] = useState(isCompleted)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleConfirm() {
    setError(null)
    startTransition(async () => {
      const result = await completeTrialMission()
      if ('success' in result || 'alreadyCompleted' in result) {
        setCompleted(true)
        setShowConfirm(false)
        router.refresh()
      } else {
        setError(result.error)
        setShowConfirm(false)
      }
    })
  }

  return (
    <>
      {/* ── Card ── */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '18px 16px',
        }}
      >
        {/* Title */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>
            Бросить курить
          </p>
          <p style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
            День {currentDay}
          </p>
        </div>

        {/* Mission description */}
        <div
          style={{
            background: 'var(--bg)',
            borderRadius: 12,
            padding: '14px',
            marginBottom: 14,
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            {missionTitle}
          </p>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65 }}>
            {missionDescription}
          </p>
        </div>

        {/* Hint */}
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.55, marginBottom: 14 }}>
          Это миссия твоего личного испытания. Она не заменяет обычные ежедневные миссии.
        </p>

        {/* Action area */}
        {completed ? (
          <div
            style={{
              borderRadius: 12,
              border: '1px solid rgba(74,222,128,0.35)',
              background: 'rgba(74,222,128,0.08)',
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>✅</span>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#4ade80' }}>
                Выполнено сегодня
              </p>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.55 }}>
              Ты сделал шаг в испытании. Следующая миссия откроется завтра.
            </p>
          </div>
        ) : (
          <>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isPending}
              style={{
                width: '100%',
                padding: '13px 16px',
                borderRadius: 12,
                border: 'none',
                background: isPending ? 'rgba(124,92,252,0.5)' : 'var(--accent)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: isPending ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s',
              }}
            >
              {isPending ? 'Сохранение...' : 'Отметить выполнено'}
            </button>
            {error && (
              <p style={{ fontSize: 12, color: '#ef4444', marginTop: 8, textAlign: 'center' }}>
                {error}
              </p>
            )}
          </>
        )}
      </div>

      {/* ── Confirmation overlay ── */}
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
            if (e.target === e.currentTarget) setShowConfirm(false)
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
              Ты правда выполнил миссию?
            </p>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 28 }}>
              Здесь нет наказаний. Важна честность с собой.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 12,
                  border: 'none',
                  background: isPending ? 'rgba(124,92,252,0.5)' : 'var(--accent)',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: isPending ? 'not-allowed' : 'pointer',
                }}
              >
                {isPending ? 'Сохранение...' : 'Да, выполнено'}
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
                Ещё нет
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
