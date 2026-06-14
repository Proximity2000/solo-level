'use client'

import { useTransition } from 'react'
import { completeOnboarding } from '../actions'

export default function FirstMissionPage() {
  const [isPending, startTransition] = useTransition()

  function handleComplete() {
    startTransition(async () => {
      await completeOnboarding()
    })
  }

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
          <div key={s} style={{
            height: 3, flex: 1, borderRadius: 2,
            background: 'var(--accent)',
          }} />
        ))}
      </div>

      {/* Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 72 }}>⚔️</div>

        <div>
          <h1 style={{
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--text)',
            marginBottom: 16,
          }}>
            Путь начат.
          </h1>
          <p style={{
            fontSize: 16,
            color: 'var(--muted)',
            lineHeight: 1.65,
          }}>
            Сегодня ты получишь первую миссию.
          </p>
        </div>

        {/* Decorative spheres */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
          {(['💪', '🧠', '⚡', '🤝', '🌿', '🔥'] as const).map((emoji, i) => (
            <div
              key={i}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>

      {/* Button */}
      <button
        className="btn btn-primary"
        onClick={handleComplete}
        disabled={isPending}
      >
        {isPending ? 'Загрузка...' : 'Перейти к миссиям'}
      </button>
    </div>
  )
}
