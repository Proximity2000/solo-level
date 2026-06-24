'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPersonalTrial } from '@/app/personalization/actions'

type Intensity = 'soft' | 'medium' | 'focused'
type Minutes = 10 | 30 | 60

const INTENSITY_OPTIONS: { value: Intensity; label: string }[] = [
  { value: 'soft',    label: 'Мягко' },
  { value: 'medium',  label: 'Средне' },
  { value: 'focused', label: 'Собранно' },
]

const MINUTES_OPTIONS: { value: Minutes; label: string }[] = [
  { value: 10, label: 'до 10 мин' },
  { value: 30, label: '15–30 мин' },
  { value: 60, label: '30–60 мин' },
]

export default function PersonalTrialForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [title, setTitle]               = useState('')
  const [why, setWhy]                   = useState('')
  const [dailyMinutes, setDailyMinutes] = useState<Minutes | null>(null)
  const [intensity, setIntensity]       = useState<Intensity | null>(null)
  const [fieldErrors, setFieldErrors]   = useState<Record<string, string>>({})
  const [globalError, setGlobalError]   = useState<string | null>(null)

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {}
    if (!title.trim())       errors.title = 'Укажи цель'
    else if (title.length > 80) errors.title = 'Не более 80 символов'
    if (!why.trim())         errors.why = 'Расскажи, почему это важно'
    else if (why.length > 300)  errors.why = 'Не более 300 символов'
    if (!dailyMinutes)       errors.dailyMinutes = 'Выбери время'
    if (!intensity)          errors.intensity = 'Выбери интенсивность'
    return errors
  }

  function handleSubmit() {
    setGlobalError(null)
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    startTransition(async () => {
      const result = await createPersonalTrial({
        title:         title.trim(),
        why:           why.trim(),
        daily_minutes: dailyMinutes!,
        intensity:     intensity!,
      })
      if ('success' in result) {
        router.push('/personalization')
      } else {
        setGlobalError(result.error)
      }
    })
  }

  return (
    <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Цель ── */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginBottom: 8,
          }}
        >
          Цель
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          placeholder="Например: начать бегать, наладить сон…"
          style={{
            width: '100%',
            padding: '13px 14px',
            borderRadius: 12,
            border: fieldErrors.title
              ? '1px solid rgba(239,68,68,0.6)'
              : '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text)',
            fontSize: 15,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {fieldErrors.title
            ? <span style={{ fontSize: 12, color: '#ef4444' }}>{fieldErrors.title}</span>
            : <span />
          }
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>{title.length}/80</span>
        </div>
      </div>

      {/* ── Почему это важно ── */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginBottom: 8,
          }}
        >
          Почему это важно
        </label>
        <textarea
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          maxLength={300}
          rows={3}
          placeholder="Это твой личный ответ. Только ты его видишь."
          style={{
            width: '100%',
            padding: '13px 14px',
            borderRadius: 12,
            border: fieldErrors.why
              ? '1px solid rgba(239,68,68,0.6)'
              : '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text)',
            fontSize: 15,
            outline: 'none',
            resize: 'none',
            lineHeight: 1.55,
            boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {fieldErrors.why
            ? <span style={{ fontSize: 12, color: '#ef4444' }}>{fieldErrors.why}</span>
            : <span />
          }
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>{why.length}/300</span>
        </div>
      </div>

      {/* ── Сколько времени в день ── */}
      <div>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginBottom: 10,
          }}
        >
          Сколько времени в день
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {MINUTES_OPTIONS.map(({ value, label }) => {
            const selected = dailyMinutes === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setDailyMinutes(value)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 20,
                  border: selected
                    ? '1px solid var(--accent)'
                    : '1px solid var(--border)',
                  background: selected
                    ? 'rgba(124,92,252,0.15)'
                    : 'transparent',
                  color: selected ? 'var(--accent)' : 'var(--muted)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
        {fieldErrors.dailyMinutes && (
          <p style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>
            {fieldErrors.dailyMinutes}
          </p>
        )}
      </div>

      {/* ── Интенсивность ── */}
      <div>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginBottom: 10,
          }}
        >
          Интенсивность
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {INTENSITY_OPTIONS.map(({ value, label }) => {
            const selected = intensity === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setIntensity(value)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 20,
                  border: selected
                    ? '1px solid var(--accent)'
                    : '1px solid var(--border)',
                  background: selected
                    ? 'rgba(124,92,252,0.15)'
                    : 'transparent',
                  color: selected ? 'var(--accent)' : 'var(--muted)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
        {fieldErrors.intensity && (
          <p style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>
            {fieldErrors.intensity}
          </p>
        )}
      </div>

      {/* ── Submit ── */}
      {globalError && (
        <p style={{ fontSize: 13, color: '#ef4444', textAlign: 'center' }}>
          {globalError}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 12,
          border: 'none',
          background: isPending ? 'var(--surface)' : 'var(--accent)',
          color: isPending ? 'var(--muted)' : '#fff',
          fontSize: 16,
          fontWeight: 700,
          cursor: isPending ? 'not-allowed' : 'pointer',
        }}
      >
        {isPending ? 'Создаём...' : 'Создать испытание'}
      </button>

      {/* Safety disclaimer */}
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', lineHeight: 1.55, textAlign: 'center' }}>
        Личное испытание — твой собственный вызов.
        Solo Level не даёт медицинских, финансовых или профессиональных рекомендаций.
      </p>

    </div>
  )
}
