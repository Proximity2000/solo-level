'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PromisePage() {
  const [accepted, setAccepted] = useState(false)
  const router = useRouter()

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
              background: s <= 3 ? 'var(--accent)' : 'var(--border)',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
            color: 'var(--text)',
            marginBottom: 20,
          }}>
            Перед началом пути
          </h1>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            color: 'var(--muted)',
            fontSize: 16,
            lineHeight: 1.65,
          }}>
            <p>В Solo Level нет соревнования с другими людьми.</p>
            <p style={{ color: 'var(--text)', fontWeight: 500 }}>
              Есть только честность перед собой.
            </p>
          </div>
        </div>

        {/* Promise card */}
        <div
          onClick={() => setAccepted(!accepted)}
          style={{
            background: 'var(--surface)',
            border: `1px solid ${accepted ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 16,
            padding: '20px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
        >
          {/* Custom checkbox */}
          <div style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            border: `2px solid ${accepted ? 'var(--accent)' : 'var(--border)'}`,
            background: accepted ? 'var(--accent)' : 'transparent',
            flexShrink: 0,
            marginTop: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}>
            {accepted && (
              <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <p style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: accepted ? 'var(--text)' : 'var(--muted)',
            transition: 'color 0.15s',
          }}>
            Я обещаю быть честным с собой и отмечать только то, что действительно сделал.
          </p>
        </div>
      </div>

      {/* Button */}
      <button
        className="btn btn-primary"
        disabled={!accepted}
        onClick={() => router.push('/onboarding/survey')}
      >
        Продолжить
      </button>
    </div>
  )
}
