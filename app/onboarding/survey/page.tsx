'use client'

import { useState, useTransition } from 'react'
import { saveSurvey } from '../actions'
import { SPHERE_LABELS, SPHERE_EMOJI, type Sphere, type Pace } from '@/lib/types'

const GOALS = [
  'Похудеть',
  'Набрать форму',
  'Читать больше',
  'Бросить вредную привычку',
  'Стать увереннее',
  'Другое',
]

const PACES: { key: Pace; label: string; desc: string }[] = [
  { key: 'calm', label: 'Спокойный', desc: '~15 мин в день' },
  { key: 'standard', label: 'Стандартный', desc: '~30 мин в день' },
  { key: 'intense', label: 'Интенсивный', desc: '~60 мин в день' },
]

const SPHERES = Object.keys(SPHERE_LABELS) as Sphere[]

export default function SurveyPage() {
  const [selectedSpheres, setSelectedSpheres] = useState<Sphere[]>([])
  const [selectedGoal, setSelectedGoal] = useState<string>('')
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
    if (selectedGoal) formData.set('goal', selectedGoal)
    formData.set('spheres', JSON.stringify(selectedSpheres))

    startTransition(async () => {
      const result = await saveSurvey(formData)
      if (result?.error) setError(result.error)
    })
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

      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
        Расскажи о себе
      </h1>

      {/* Spheres */}
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Сферы развития
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {SPHERES.map((sphere) => {
            const active = selectedSpheres.includes(sphere)
            return (
              <button
                key={sphere}
                onClick={() => toggleSphere(sphere)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  background: active ? 'rgba(124,92,252,0.12)' : 'var(--surface)',
                  color: active ? 'var(--accent)' : 'var(--muted)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.15s',
                  textAlign: 'left',
                }}
              >
                <span>{SPHERE_EMOJI[sphere]}</span>
                <span>{SPHERE_LABELS[sphere]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Goal */}
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Главная цель
        </p>
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
        </div>
      </div>

      {/* Pace */}
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Темп развития
        </p>
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
