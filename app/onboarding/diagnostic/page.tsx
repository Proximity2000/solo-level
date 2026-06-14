'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveDiagnostic } from '../actions'

const ACTIVITY_OPTIONS = [
  { value: 'none', label: 'Не занимаюсь' },
  { value: 'sometimes', label: 'Иногда' },
  { value: 'regular', label: 'Регулярно' },
]

const READING_OPTIONS = [
  { value: 'rarely', label: 'Редко' },
  { value: 'sometimes', label: 'Иногда' },
  { value: 'regular', label: 'Регулярно' },
]

export default function DiagnosticPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [activity, setActivity] = useState('')
  const [reading, setReading] = useState('')
  const [discipline, setDiscipline] = useState(5)
  const [goal3m, setGoal3m] = useState('')

  function handleSave() {
    setError(null)
    const formData = new FormData()
    if (age) formData.set('age', age)
    if (height) formData.set('height_cm', height)
    if (weight) formData.set('weight_kg', weight)
    if (activity) formData.set('activity_level', activity)
    if (reading) formData.set('reading_level', reading)
    formData.set('discipline_score', String(discipline))
    if (goal3m) formData.set('goal_3months', goal3m)

    startTransition(async () => {
      const result = await saveDiagnostic(formData)
      if (result?.error) setError(result.error)
    })
  }

  function handleSkip() {
    router.push('/onboarding/first-mission')
  }

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600 as const,
    color: 'var(--muted)',
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '64px 24px 32px',
      gap: 28,
      overflowY: 'auto',
    }}>
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <div key={s} style={{
            height: 3, flex: 1, borderRadius: 2,
            background: s <= 5 ? 'var(--accent)' : 'var(--border)',
          }} />
        ))}
      </div>

      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 8 }}>
          Стартовая диагностика
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.5 }}>
          Поможет подобрать задания под тебя. Можно пропустить.
        </p>
      </div>

      {/* Age / Height / Weight */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          { label: 'Возраст', value: age, set: setAge, placeholder: '25', max: 3 },
          { label: 'Рост, см', value: height, set: setHeight, placeholder: '175', max: 3 },
          { label: 'Вес, кг', value: weight, set: setWeight, placeholder: '70', max: 5 },
        ].map(({ label, value, set, placeholder, max }) => (
          <div key={label}>
            <label style={labelStyle}>{label}</label>
            <input
              className="input"
              type="number"
              placeholder={placeholder}
              value={value}
              onChange={(e) => set(e.target.value)}
              maxLength={max}
              style={{ textAlign: 'center' }}
            />
          </div>
        ))}
      </div>

      {/* Activity */}
      <div>
        <label style={labelStyle}>Физическая активность</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {ACTIVITY_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setActivity(activity === value ? '' : value)}
              style={{
                flex: 1,
                padding: '10px 4px',
                borderRadius: 10,
                border: `1px solid ${activity === value ? 'var(--accent)' : 'var(--border)'}`,
                background: activity === value ? 'rgba(124,92,252,0.12)' : 'var(--surface)',
                color: activity === value ? 'var(--accent)' : 'var(--muted)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Reading */}
      <div>
        <label style={labelStyle}>Чтение</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {READING_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setReading(reading === value ? '' : value)}
              style={{
                flex: 1,
                padding: '10px 4px',
                borderRadius: 10,
                border: `1px solid ${reading === value ? 'var(--accent)' : 'var(--border)'}`,
                background: reading === value ? 'rgba(124,92,252,0.12)' : 'var(--surface)',
                color: reading === value ? 'var(--accent)' : 'var(--muted)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Discipline */}
      <div>
        <label style={labelStyle}>
          Дисциплина — {discipline}/10
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={discipline}
          onChange={(e) => setDiscipline(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>Хаос</span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>Железная воля</span>
        </div>
      </div>

      {/* Goal 3 months */}
      <div>
        <label style={labelStyle}>Цель на 3 месяца</label>
        <textarea
          className="input"
          placeholder="Что хочу изменить в себе за 3 месяца..."
          value={goal3m}
          onChange={(e) => setGoal3m(e.target.value)}
          rows={3}
          style={{ resize: 'none' }}
        />
      </div>

      {error && (
        <p style={{ color: '#ef4444', fontSize: 14 }}>{error}</p>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isPending}
        >
          {isPending ? 'Сохранение...' : 'Сохранить и продолжить'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleSkip}
          disabled={isPending}
        >
          Пропустить
        </button>
      </div>
    </div>
  )
}
