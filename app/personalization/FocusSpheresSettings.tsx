'use client'

import { useState, useTransition } from 'react'
import { saveFocusSpheres } from './actions'

const ALL_SPHERES: { id: string; label: string }[] = [
  { id: 'body', label: 'Тело' },
  { id: 'mind', label: 'Разум' },
  { id: 'discipline', label: 'Дисциплина' },
  { id: 'awareness', label: 'Осознанность' },
  { id: 'social', label: 'Социум' },
]

export default function FocusSpheresSettings({ initialSpheres }: { initialSpheres: string[] }) {
  const [selected, setSelected] = useState<string[]>(initialSpheres)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isDirty =
    JSON.stringify([...selected].sort()) !== JSON.stringify([...initialSpheres].sort())

  function toggle(sphere: string) {
    setSaved(false)
    setSelected((prev) =>
      prev.includes(sphere) ? prev.filter((s) => s !== sphere) : [...prev, sphere]
    )
  }

  function handleSave() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await saveFocusSpheres(selected)
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
        gap: 12,
      }}
    >
      <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.55 }}>
        Все сферы развиваются постепенно. Выбранные акценты будут появляться чаще в новых миссиях.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {ALL_SPHERES.map(({ id, label }) => {
          const active = selected.includes(id)
          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              disabled={isPending}
              style={{
                padding: '8px 18px',
                borderRadius: 20,
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                background: active ? 'rgba(124,92,252,0.15)' : 'rgba(255,255,255,0.04)',
                color: active ? 'var(--accent)' : 'var(--muted)',
                fontSize: 14,
                fontWeight: active ? 700 : 400,
                cursor: isPending ? 'not-allowed' : 'pointer',
                transition: 'all 0.12s',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {selected.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, opacity: 0.7 }}>
          Если акценты не выбраны, миссии будут распределяться равномерно.
        </p>
      )}

      <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
        Изменения начнут влиять на новые миссии со следующего дня.
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
          {isPending ? 'Сохранение...' : 'Сохранить акценты'}
        </button>
      )}
    </div>
  )
}
