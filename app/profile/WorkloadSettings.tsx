'use client'

import { useState, useTransition } from 'react'
import { saveWorkloadMode } from './actions'

const MODES = [
  { label: 'Лёгкий', desc: '10–15 минут в день', value: 15 },
  { label: 'Средний', desc: '20–40 минут в день', value: 30 },
  { label: 'Ударный', desc: '45–90 минут в день', value: 60 },
]

function minutesToMode(minutes: number): number {
  if (minutes <= 15) return 15
  if (minutes <= 45) return 30
  return 60
}

export default function WorkloadSettings({ dailyMinutes }: { dailyMinutes: number }) {
  const [selected, setSelected] = useState<number>(minutesToMode(dailyMinutes))
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isDirty = selected !== minutesToMode(dailyMinutes)

  function handleSave() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await saveWorkloadMode(selected)
      if (result.error) {
        setError(result.error)
      } else {
        setSaved(true)
      }
    })
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 12,
        padding: '16px',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginBottom: 2 }}>
        Режим нагрузки
      </p>

      {MODES.map(({ label, desc, value }) => {
        const active = selected === value
        return (
          <button
            key={value}
            onClick={() => { setSelected(value); setSaved(false) }}
            style={{
              padding: '13px 14px',
              borderRadius: 10,
              border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              background: active ? 'rgba(124,92,252,0.12)' : 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.12s',
            }}
          >
            <span style={{ fontSize: 15, fontWeight: active ? 700 : 400, color: active ? 'var(--accent)' : 'var(--text)' }}>
              {label}
            </span>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{desc}</span>
          </button>
        )
      })}

      <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, marginTop: 2 }}>
        Новый режим начнёт влиять на новые миссии со следующего дня.
      </p>

      {error && (
        <p style={{ fontSize: 13, color: '#ef4444' }}>{error}</p>
      )}

      {saved && (
        <p style={{ fontSize: 13, color: '#22c55e', fontWeight: 600 }}>✓ Сохранено</p>
      )}

      {isDirty && (
        <button
          onClick={handleSave}
          disabled={isPending}
          className="btn btn-primary"
          style={{ marginTop: 4 }}
        >
          {isPending ? 'Сохранение...' : 'Сохранить'}
        </button>
      )}
    </div>
  )
}
