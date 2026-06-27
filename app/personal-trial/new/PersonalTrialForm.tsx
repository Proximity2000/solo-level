'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createDraftPersonalTrial } from '@/app/personalization/actions'
import {
  detectCategory,
  CATEGORY_LABELS,
  CATEGORY_EMOJI,
  type PersonalTrialCategory,
} from '@/lib/personal-trial-categories'
import { getQuestionsForCategory } from '@/lib/personal-trial-questions'

// ── Screen 0: Goal + Why + Category ─────────────────────────

function Screen0({
  title, setTitle,
  why, setWhy,
  category, setCategory,
  onNext,
}: {
  title: string
  setTitle: (v: string) => void
  why: string
  setWhy: (v: string) => void
  category: PersonalTrialCategory | null
  setCategory: (v: PersonalTrialCategory) => void
  onNext: () => void
}) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-detect category from title+why whenever they change
  const suggested = useMemo(
    () => (title.trim() || why.trim() ? detectCategory(title + ' ' + why) : null),
    [title, why]
  )

  // Use explicitly chosen category, else fall back to suggestion
  const effective = category ?? suggested

  function validate() {
    const e: Record<string, string> = {}
    if (!title.trim())        e.title = 'Укажи цель'
    else if (title.length > 80) e.title = 'Не более 80 символов'
    if (!why.trim())          e.why = 'Расскажи, почему это важно'
    else if (why.length > 300) e.why = 'Не более 300 символов'
    if (!effective)           e.category = 'Выбери категорию'
    return e
  }

  function handleNext() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    if (!effective) return
    setCategory(effective)
    setErrors({})
    onNext()
  }

  const ALL_CATEGORIES: PersonalTrialCategory[] = [
    'routine', 'learning', 'fitness', 'focus', 'finance', 'project', 'custom',
  ]

  return (
    <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Goal */}
      <div>
        <label style={labelStyle}>Цель</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          placeholder="Например: начать бегать, наладить сон…"
          style={{ ...inputStyle, border: errors.title ? '1px solid rgba(239,68,68,0.6)' : '1px solid var(--border)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {errors.title
            ? <span style={errorStyle}>{errors.title}</span>
            : <span />
          }
          <span style={counterStyle}>{title.length}/80</span>
        </div>
      </div>

      {/* Why */}
      <div>
        <label style={labelStyle}>Почему это важно</label>
        <textarea
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          maxLength={300}
          rows={3}
          placeholder="Это твой личный ответ. Только ты его видишь."
          style={{ ...inputStyle, resize: 'none', lineHeight: 1.55, border: errors.why ? '1px solid rgba(239,68,68,0.6)' : '1px solid var(--border)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {errors.why
            ? <span style={errorStyle}>{errors.why}</span>
            : <span />
          }
          <span style={counterStyle}>{why.length}/300</span>
        </div>
      </div>

      {/* Category */}
      <div>
        <p style={sectionLabelStyle}>Категория</p>
        {suggested && !category && (
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10, opacity: 0.7 }}>
            Предлагаем: {CATEGORY_EMOJI[suggested]} {CATEGORY_LABELS[suggested]}
          </p>
        )}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ALL_CATEGORIES.map((cat) => {
            const selected = effective === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 20,
                  border: selected ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: selected ? 'rgba(124,92,252,0.15)' : 'transparent',
                  color: selected ? 'var(--accent)' : 'var(--muted)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <span>{CATEGORY_EMOJI[cat]}</span>
                <span>{CATEGORY_LABELS[cat]}</span>
              </button>
            )
          })}
        </div>
        {errors.category && (
          <p style={{ ...errorStyle, marginTop: 6 }}>{errors.category}</p>
        )}
      </div>

      <button type="button" onClick={handleNext} style={primaryBtnStyle}>
        Далее
      </button>

      <p style={disclaimerStyle}>
        Solo Level не даёт медицинских, финансовых или профессиональных рекомендаций.
      </p>
    </div>
  )
}

// ── Screen 1: Questionnaire ──────────────────────────────────

function Screen1({
  category,
  answers,
  setAnswers,
  onBack,
  onNext,
}: {
  category: PersonalTrialCategory
  answers: Record<string, string>
  setAnswers: (v: Record<string, string>) => void
  onBack: () => void
  onNext: () => void
}) {
  const questions = getQuestionsForCategory(category)
  const [error, setError] = useState<string | null>(null)

  function handleNext() {
    const unanswered = questions.filter(q => !answers[q.id])
    if (unanswered.length > 0) {
      setError('Ответь на все вопросы, чтобы продолжить')
      return
    }
    setError(null)
    onNext()
  }

  return (
    <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.55 }}>
        Несколько вопросов, чтобы лучше понять твою цель.
      </p>

      {questions.map((q) => (
        <div key={q.id}>
          <p style={sectionLabelStyle}>{q.text}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {q.options.map((opt) => {
              const selected = answers[q.id] === opt
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 20,
                    border: selected ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: selected ? 'rgba(124,92,252,0.15)' : 'transparent',
                    color: selected ? 'var(--accent)' : 'var(--muted)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {error && <p style={{ ...errorStyle, textAlign: 'center' }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button type="button" onClick={handleNext} style={primaryBtnStyle}>
          Продолжить
        </button>
        <button type="button" onClick={onBack} style={secondaryBtnStyle}>
          Назад
        </button>
      </div>
    </div>
  )
}

// ── Screen 2: Summary + Save Draft ───────────────────────────

function Screen2({
  title,
  why,
  category,
  answers,
  onBack,
  onSave,
  isPending,
  globalError,
}: {
  title: string
  why: string
  category: PersonalTrialCategory
  answers: Record<string, string>
  onBack: () => void
  onSave: () => void
  isPending: boolean
  globalError: string | null
}) {
  const questions = getQuestionsForCategory(category)

  return (
    <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Goal summary */}
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 12,
          padding: '18px 16px',
          border: '1px solid var(--border)',
        }}
      >
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
          {CATEGORY_EMOJI[category]} {CATEGORY_LABELS[category]}
        </p>
        <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 8, lineHeight: 1.3 }}>
          {title}
        </p>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
          {why}
        </p>
      </div>

      {/* Answers summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {questions.map((q) => (
          <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', flex: 1, paddingRight: 8 }}>{q.text}</p>
            <span
              style={{
                fontSize: 12, fontWeight: 600,
                color: 'var(--accent)',
                background: 'rgba(124,92,252,0.12)',
                border: '1px solid rgba(124,92,252,0.25)',
                borderRadius: 20, padding: '3px 10px',
                flexShrink: 0,
              }}
            >
              {answers[q.id]}
            </span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.55, textAlign: 'center' }}>
        Черновик сохранится. Ты сможешь активировать его, когда будет готов маршрут.
      </p>

      {globalError && (
        <p style={{ ...errorStyle, textAlign: 'center' }}>{globalError}</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          type="button"
          onClick={onSave}
          disabled={isPending}
          style={{
            ...primaryBtnStyle,
            background: isPending ? 'var(--surface)' : 'var(--accent)',
            color: isPending ? 'var(--muted)' : '#fff',
            cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {isPending ? 'Сохраняем...' : 'Сохранить черновик'}
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          style={secondaryBtnStyle}
        >
          Назад
        </button>
      </div>

      <p style={disclaimerStyle}>
        Solo Level не даёт медицинских, финансовых или профессиональных рекомендаций.
      </p>
    </div>
  )
}

// ── Root form ────────────────────────────────────────────────

export default function PersonalTrialForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [screen, setScreen]       = useState(0)
  const [title, setTitle]         = useState('')
  const [why, setWhy]             = useState('')
  const [category, setCategory]   = useState<PersonalTrialCategory | null>(null)
  const [answers, setAnswers]     = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)

  function handleSave() {
    if (!category) return
    setGlobalError(null)
    startTransition(async () => {
      const result = await createDraftPersonalTrial({
        title:         title.trim(),
        why:           why.trim(),
        category,
        questionnaire: answers,
      })
      if ('success' in result) {
        router.push('/personalization')
      } else {
        setGlobalError(result.error)
      }
    })
  }

  if (screen === 0) {
    return (
      <Screen0
        title={title} setTitle={setTitle}
        why={why} setWhy={setWhy}
        category={category} setCategory={setCategory}
        onNext={() => setScreen(1)}
      />
    )
  }

  if (screen === 1) {
    return (
      <Screen1
        category={category!}
        answers={answers}
        setAnswers={setAnswers}
        onBack={() => setScreen(0)}
        onNext={() => setScreen(2)}
      />
    )
  }

  return (
    <Screen2
      title={title}
      why={why}
      category={category!}
      answers={answers}
      onBack={() => setScreen(1)}
      onSave={handleSave}
      isPending={isPending}
      globalError={globalError}
    />
  )
}

// ── Shared styles ────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  marginBottom: 8,
}

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  marginBottom: 10,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 14px',
  borderRadius: 12,
  background: 'var(--surface)',
  color: 'var(--text)',
  fontSize: 15,
  outline: 'none',
  boxSizing: 'border-box',
}

const errorStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#ef4444',
}

const counterStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'rgba(255,255,255,0.2)',
}

const primaryBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  borderRadius: 12,
  border: 'none',
  background: 'var(--accent)',
  color: '#fff',
  fontSize: 16,
  fontWeight: 700,
  cursor: 'pointer',
}

const secondaryBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  borderRadius: 12,
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--muted)',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
}

const disclaimerStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'rgba(255,255,255,0.2)',
  lineHeight: 1.55,
  textAlign: 'center',
}
