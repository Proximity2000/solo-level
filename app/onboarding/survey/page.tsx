'use client'

import { useState, useTransition } from 'react'
import { saveSurvey } from '../actions'
import type { Sphere, Pace } from '@/lib/types'

const SURVEY_SPHERES: { key: Sphere; label: string; emoji: string; desc: string }[] = [
  { key: 'body',       label: 'Тело',         emoji: '💪', desc: 'Энергия, здоровье, движение, сон' },
  { key: 'mind',       label: 'Разум',        emoji: '🧠', desc: 'Обучение, мышление, фокус' },
  { key: 'discipline', label: 'Дисциплина',   emoji: '⚡', desc: 'Режим, порядок, доведение дел' },
  { key: 'awareness',  label: 'Осознанность', emoji: '🌿', desc: 'Эмоции, спокойствие, контроль реакций' },
  { key: 'social',     label: 'Социум',       emoji: '🤝', desc: 'Общение, отношения, уверенность' },
]

const GOALS = [
  'Похудеть',
  'Набрать форму',
  'Читать больше',
  'Бросить вредную привычку',
  'Стать увереннее',
  'Другое',
]

const PACES: { key: Pace; label: string; desc: string }[] = [
  { key: 'calm',     label: 'Спокойный',    desc: '~15 мин в день' },
  { key: 'standard', label: 'Стандартный',  desc: '~30 мин в день' },
  { key: 'intense',  label: 'Интенсивный',  desc: '~60 мин в день' },
]

export default function SurveyPage() {
  const [selectedSpheres, setSelectedSpheres] = useState<Sphere[]>([])
  const [selectedGoal, setSelectedGoal] = useState<string>('')
  const [customGoal, setCustomGoal] = useState<string>('')
  const [selectedPace, setSelectedPace] = useState<Pace>('standard')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function toggleSphere(sphere: Sphere) {
    setSelectedSpheres((prev) =>
      prev.includes(sphere) ? prev.filter((s) => s !== sphere) : [...prev, sphere]
    )
  }

  function handleSubmit() {
    setError(null)
    const formData = new FormData()
    formData.set('pace', selectedPace)

    const goalValue = selectedGoal === 'Другое' ? customGoal.trim() : selectedGoal
    if (goalValue) formData.set('goal', goalValue)

    formData.set('spheres', JSON.stringify(selectedSpheres))

    startTransition(async () => {
      const result = await saveSurvey(formData)
      if (result?.error) setError(result.error)
    })
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text)',
    marginBottom: 4,
  }

  const sectionHint: React.CSSProperties = {
    fontSize: 13,
    color: 'var(--muted)',
    marginBottom: 14,
    lineHeight: 1.5,
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '64px 24px 32px',
      gap: 32,
      overflowY: 'auto',
    }}>
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <div key={s} style={{
            height: 3, flex: 1, borderRadius: 2,
            background: s <= 4 ? 'var(--accent)' : 'var(--border)',
          }} />
        ))}
      </div>

      {/* Spheres */}
      <div>
        <p style={sectionLabel}>В каких сферах хочешь прокачаться?</p>
        <p style={sectionHint}>Выбери 1–3 сферы, на которые хочешь сделать упор в ближайшее время.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SURVEY_SPHERES.map(({ key, label, emoji, desc }) => {
            const active = selectedSpheres.includes(key)
            return (
              <button
                key={key}
                onClick={() => toggleSphere(key)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  background: active ? 'rgba(124,92,252,0.12)' : 'var(--surface)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'all 0.15s',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <span style={{ fontSize: 22, flexShrink: 0 }}>{emoji}</span>
                <span>
                  <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: active ? 'var(--accent)' : 'var(--text)' }}>
                    {label}
                  </span>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    {desc}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Goal */}
      <div>
        <p style={sectionLabel}>Есть личная цель?</p>
        <p style={sectionHint}>Выбери из списка или укажи свою. Если пока не знаешь — можно пропустить и добавить позже.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {GOALS.map((goal) => {
            const active = selectedGoal === goal
            return (
              <button
                key={goal}
                onClick={() => setSelectedGoal(active ? '' : goal)}
                style={{
                  padding: '13px 16px',
                  borderRadius: 12,
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  background: active ? 'rgba(124,92,252,0.12)' : 'var(--surface)',
                  color: active ? 'var(--accent)' : 'var(--text)',
                  fontSize: 15,
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                {goal}
              </button>
            )
          })}
          {selectedGoal === 'Другое' && (
            <input
              className="input"
              type="text"
              placeholder="Напиши свою цель"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              autoFocus
              style={{ marginTop: 4 }}
            />
          )}
        </div>
      </div>

      {/* Pace */}
      <div>
        <p style={sectionLabel}>Сколько времени готов уделять в день?</p>
        <p style={sectionHint}>Это поможет подобрать нагрузку. Начать можно с малого.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PACES.map(({ key, label, desc }) => {
            const active = selectedPace === key
            return (
              <button
                key={key}
                onClick={() => setSelectedPace(key)}
                style={{
                  padding: '13px 16px',
                  borderRadius: 12,
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  background: active ? 'rgba(124,92,252,0.12)' : 'var(--surface)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 15, fontWeight: active ? 600 : 400, color: active ? 'var(--accent)' : 'var(--text)' }}>
                  {label}
                </span>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>{desc}</span>
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <p style={{ color: '#ef4444', fontSize: 14 }}>{error}</p>
      )}

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={isPending}
        style={{ marginTop: 'auto' }}
      >
        {isPending ? 'Сохранение...' : 'Продолжить'}
      </button>
    </div>
  )
}
