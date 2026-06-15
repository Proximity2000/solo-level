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

const DISCIPLINE_OPTIONS = [
  { value: 1,  label: 'Хаос',               desc: 'Часто откладываю, день проходит как попало.' },
  { value: 3,  label: 'Нестабильно',         desc: 'Иногда держусь, но быстро сбиваюсь.' },
  { value: 5,  label: 'Средне',              desc: 'Есть порядок, но многое зависит от настроения.' },
  { value: 7,  label: 'Хорошо',              desc: 'Часто довожу дела до конца, но бывают срывы.' },
  { value: 10, label: 'Железная воля',       desc: 'Стабильный режим, редко отступаю от плана.' },
]

export default function DiagnosticForm({ returnTo }: { returnTo: string | null }) {
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
    if (returnTo) formData.set('returnTo', returnTo)

    startTransition(async () => {
      const result = await saveDiagnostic(formData)
      if (result?.error) setError(result.error)
    })
  }

  function handleSkip() {
    router.push(returnTo ?? '/onboarding/first-mission')
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
        <label style={labelStyle}>Обучение и чтение</label>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10, lineHeight: 1.5 }}>
          Как часто ты читаешь, учишься или осознанно развиваешь мышление?
        </p>
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
        <label style={labelStyle}>Дисциплина</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DISCIPLINE_OPTIONS.map(({ value, label, desc }) => {
            const active = discipline === value
            return (
              <button
                key={value}
                onClick={() => setDiscipline(value)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  background: active ? 'rgba(124,92,252,0.12)' : 'var(--surface)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  width: '100%',
                }}
              >
                <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: active ? 'var(--accent)' : 'var(--text)' }}>
                  {label}
                </span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                  {desc}
                </span>
              </button>
            )
          })}
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
