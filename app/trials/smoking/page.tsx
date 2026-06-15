'use client'

import { useState } from 'react'

// ── Types ──────────────────────────────────────────────────────
type Answers = {
  step1: string[]
  step2: string
  step2custom: string
  step3: string
  step4: string[]
  step5: string[]
  step6: string
  step7: string[]
  step8: string
  step9: string
  step10: string[]
}

type Step = {
  id: number
  question: string
  multi: boolean
  options: string[]
  key: keyof Answers
}

const TOTAL = 10

const STEPS: Step[] = [
  {
    id: 1,
    question: 'Что ты хочешь убрать?',
    multi: true,
    key: 'step1',
    options: [
      'Сигареты',
      'Электронки / одноразки',
      'Вейп',
      'Кальян',
      'Никотиновые смеси / снюс',
      'Сам ритуал курения',
      'Другое',
    ],
  },
  {
    id: 2,
    question: 'Сколько сейчас употребляешь?',
    multi: false,
    key: 'step2',
    options: [
      '1–5 раз в день',
      '6–10 раз в день',
      '11–20 раз в день',
      '20+ раз в день',
      'Почти постоянно',
      'Добавить свой ответ',
    ],
  },
  {
    id: 3,
    question: 'Как давно это с тобой?',
    multi: false,
    key: 'step3',
    options: [
      'Меньше 6 месяцев',
      '6–12 месяцев',
      '1–3 года',
      '3–10 лет',
      '10+ лет',
    ],
  },
  {
    id: 4,
    question: 'Когда сильнее всего тянет?',
    multi: true,
    key: 'step4',
    options: [
      'Утром',
      'После еды',
      'С кофе',
      'На работе / учёбе',
      'В машине',
      'Когда стресс',
      'Когда скучно',
      'Когда злюсь',
      'С алкоголем',
      'В компании',
      'Перед сном',
      'Автоматически, даже не замечаю',
    ],
  },
  {
    id: 5,
    question: 'Что сложнее всего отпустить?',
    multi: true,
    key: 'step5',
    options: [
      'Никотин',
      'Привычка держать в руке',
      'Сам процесс затяжки',
      'Перерыв / выйти покурить',
      'Способ снять стресс',
      'Компания',
      'Страх набрать вес',
      'Страх стать раздражительным',
      'Страх сорваться',
      'Не знаю',
    ],
  },
  {
    id: 6,
    question: 'Ты уже пробовал бросать?',
    multi: false,
    key: 'step6',
    options: [
      'Нет',
      'Да, один раз',
      'Да, несколько раз',
      'Да, много раз',
    ],
  },
  {
    id: 7,
    question: 'Если срывался, почему?',
    multi: true,
    key: 'step7',
    options: [
      'Стресс',
      'Компания',
      'Алкоголь',
      'Сильная тяга',
      'Раздражительность',
      'Скука',
      'Не было плана',
      'Не было поддержки',
      'Не применимо',
    ],
  },
  {
    id: 8,
    question: 'Насколько ты готов сейчас?',
    multi: false,
    key: 'step8',
    options: [
      '1 — пока сомневаюсь',
      '3 — хочу, но боюсь',
      '5 — готов попробовать',
      '7 — настроен серьёзно',
      '10 — я реально хочу закончить с этим',
    ],
  },
  {
    id: 9,
    question: 'Как хочешь идти?',
    multi: false,
    key: 'step9',
    options: [
      'Мягко — постепенно снижать и менять привычки',
      'Средне — чёткий план, но без жести',
      'Резко — хочу назначить день отказа и бросить',
      'Помоги выбрать по моим ответам',
    ],
  },
  {
    id: 10,
    question: 'Почему ты хочешь бросить?',
    multi: true,
    key: 'step10',
    options: [
      'Здоровье',
      'Деньги',
      'Внешность / запах',
      'Семья / отношения',
      'Самоуважение',
      'Спорт / выносливость',
      'Устал зависеть',
      'Хочу доказать себе',
      'Другое',
    ],
  },
]

const EMPTY: Answers = {
  step1: [], step2: '', step2custom: '', step3: '', step4: [], step5: [],
  step6: '', step7: [], step8: '', step9: '', step10: [],
}

const CUSTOM_OPTION = 'Добавить свой ответ'

function step2Placeholder(step1: string[]): string {
  if (step1.length > 1) return 'Например: сигареты утром, электронка в течение дня'
  if (step1.includes('Сигареты')) return 'Например: 8–12 сигарет в день, иногда больше'
  if (step1.includes('Электронки / одноразки')) return 'Например: электронка почти весь день, около 30–40 затяжек'
  if (step1.includes('Вейп')) return 'Например: электронка почти весь день, около 30–40 затяжек'
  if (step1.includes('Кальян')) return 'Например: 1–2 раза в неделю, обычно по выходным'
  if (step1.includes('Никотиновые смеси / снюс')) return 'Например: 5–6 раз в день'
  if (step1.includes('Сам ритуал курения')) return 'Например: несколько раз в день хочется просто выйти и подержать что-то в руке'
  return 'Например: опиши свой режим употребления'
}

// ── Profile detector ──────────────────────────────────────────
function detectTypes(a: Answers): string[] {
  const types: string[] = []

  const nicotine =
    a.step1.some((x) => ['Сигареты', 'Электронки / одноразки', 'Никотиновые смеси / снюс'].includes(x)) ||
    ['20+ раз в день', 'Почти постоянно'].includes(a.step2)
  if (nicotine) types.push('Никотиновый тип')

  const ritual =
    a.step1.includes('Сам ритуал курения') ||
    a.step4.some((x) => ['С кофе', 'После еды'].includes(x)) ||
    a.step5.some((x) => ['Привычка держать в руке', 'Сам процесс затяжки', 'Перерыв / выйти покурить'].includes(x))
  if (ritual) types.push('Ритуальный тип')

  const stress =
    a.step4.some((x) => ['Когда стресс', 'Когда злюсь'].includes(x)) ||
    a.step5.some((x) => ['Способ снять стресс', 'Страх стать раздражительным'].includes(x))
  if (stress) types.push('Стрессовый тип')

  const social =
    a.step4.some((x) => ['В компании', 'С алкоголем'].includes(x)) ||
    a.step5.includes('Компания')
  if (social) types.push('Социальный тип')

  const auto = a.step4.includes('Автоматически, даже не замечаю')
  if (auto) types.push('Автоматический тип')

  // Вернуть не более двух самых вероятных
  return types.slice(0, 2).length > 0 ? types.slice(0, 2) : ['Смешанный тип']
}

function profileText(types: string[]): string {
  if (types.includes('Ритуальный тип') && types.includes('Никотиновый тип'))
    return 'Похоже, твоя привычка держится не только на никотине. Важную роль играют повторяющиеся ситуации и ритуалы. Это хорошо: такие связки можно постепенно разрывать.'
  if (types.includes('Стрессовый тип'))
    return 'Сигарета стала твоим способом справляться с напряжением. Путь начнётся с поиска альтернативных якорей для сложных моментов.'
  if (types.includes('Социальный тип'))
    return 'Большую часть тяги создаёт окружение и ситуации. Хорошая новость: социальные триггеры поддаются планированию.'
  if (types.includes('Автоматический тип'))
    return 'Привычка стала фоновой — ты куришь не задумываясь. Первый шаг — вернуть осознанность в каждую затяжку.'
  return 'У тебя сложная картина с несколькими переплетёнными факторами. Именно поэтому важно идти шаг за шагом, а не просто «взять волю в кулак».'
}

// ── Styles ────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  padding: '16px 14px',
  cursor: 'pointer',
  textAlign: 'left',
  width: '100%',
  transition: 'all 0.12s',
}

// ── Component ─────────────────────────────────────────────────
export default function SmokingTrialPage() {
  const [step, setStep] = useState(0) // 0 = intro, 1-10 = questions, 11 = result
  const [answers, setAnswers] = useState<Answers>(EMPTY)

  const currentStep = STEPS[step - 1]

  // ── Helpers ─────────────────────────────────────────────────
  function getVal(key: keyof Answers): string | string[] {
    return answers[key]
  }

  function isSelected(key: keyof Answers, option: string): boolean {
    const val = getVal(key)
    return Array.isArray(val) ? val.includes(option) : val === option
  }

  function toggle(key: keyof Answers, option: string, multi: boolean) {
    setAnswers((prev) => {
      const cur = prev[key]
      if (multi && Array.isArray(cur)) {
        return {
          ...prev,
          [key]: cur.includes(option) ? cur.filter((x) => x !== option) : [...cur, option],
        }
      }
      return { ...prev, [key]: option }
    })
  }

  function canNext(): boolean {
    if (!currentStep) return false
    const val = answers[currentStep.key]
    const hasVal = Array.isArray(val) ? val.length > 0 : val !== ''
    if (step === 2 && answers.step2 === CUSTOM_OPTION) {
      return answers.step2custom.trim().length >= 2
    }
    return hasVal
  }

  function next() {
    if (step === TOTAL) { setStep(11); return }
    setStep((s) => s + 1)
  }

  function back() {
    if (step === 0) return
    setStep((s) => s - 1)
  }

  // ── Intro ────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px 0' }}>
          <a href="/trials" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>← Назад</a>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 24px' }}>
          <span style={{ fontSize: 52, display: 'block', marginBottom: 24 }}>🚭</span>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', lineHeight: 1.2, marginBottom: 12 }}>
            Бросить курить
          </h1>
          <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 32 }}>
            10 вопросов — и ты получишь свой профиль и маршрут. Честные ответы помогают получить точный путь.
          </p>
          <button
            onClick={() => setStep(1)}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Начать опрос
          </button>
        </div>
      </div>
    )
  }

  // ── Result ───────────────────────────────────────────────────
  if (step === 11) {
    const types = detectTypes(answers)
    const text = profileText(types)
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', overflowY: 'auto' }}>
        <div style={{ padding: '24px 20px 80px' }}>

          {/* Хедер */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4 }}>
            SOLO LEVEL
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 24 }}>
            Твой профиль испытания
          </h1>

          {/* Типы */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {types.map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 13, fontWeight: 700, color: 'var(--accent)',
                  background: 'rgba(124,92,252,0.15)', border: '1px solid rgba(124,92,252,0.3)',
                  borderRadius: 20, padding: '5px 14px',
                }}
              >
                {t}
              </span>
            ))}
          </div>

          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '18px 16px', border: '1px solid var(--border)', marginBottom: 20 }}>
            <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.7 }}>{text}</p>
          </div>

          {/* Маршрут */}
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 14 }}>
            Твой маршрут
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {[
              { icon: '🔍', title: 'Разведка', desc: 'Понять, когда привычка управляет тобой' },
              { icon: '⚡', title: 'Первые разрывы', desc: 'Начать ломать автоматические связки' },
              { icon: '🔄', title: 'Замена ритуалов', desc: 'Подобрать действия вместо курения' },
              { icon: '🛡️', title: 'Антисрыв', desc: 'Подготовить план на моменты тяги' },
              { icon: '🏆', title: 'Первый трофей', desc: '7 дней пути' },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  background: 'var(--surface)', borderRadius: 12,
                  padding: '14px', border: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{title}</p>
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Трофей */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(124,92,252,0.12), rgba(124,92,252,0.05))',
              border: '1px solid rgba(124,92,252,0.3)',
              borderRadius: 14, padding: '16px', marginBottom: 20, textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 22, marginBottom: 6 }}>🪵</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Первый трофей</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Деревянная сломанная сигарета</p>
          </div>

          {/* Первая миссия */}
          <div
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '18px 16px', marginBottom: 20,
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>
              Первая миссия
            </p>
            <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}>
              Сегодня просто отследи 3 момента, когда захотелось курить: время, место и причина. Не борись с собой. Наша задача — увидеть систему.
            </p>
          </div>

          {/* Кнопки */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            <button
              disabled
              style={{
                width: '100%', padding: '13px', borderRadius: 12, border: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.04)', color: 'var(--muted)',
                fontSize: 15, fontWeight: 700, cursor: 'not-allowed',
              }}
            >
              Начать испытание
            </button>
            <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
              Сохранение испытания появится следующим шагом.
            </p>
            <a
              href="/legend"
              style={{
                display: 'block', width: '100%', padding: '13px', borderRadius: 12,
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text)', fontSize: 15, fontWeight: 600,
                textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box',
              }}
            >
              Вернуться в Легенду
            </a>
          </div>

          {/* Дисклеймер */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 12,
              padding: '14px', border: '1px solid var(--border)',
            }}
          >
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.65 }}>
              Solo Level помогает строить путь маленьких шагов. Это не медицинская консультация. Если у тебя сильная зависимость, беременность, хронические заболевания или ты хочешь использовать лекарства/никотинзаместительную терапию — лучше обсудить это со специалистом.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Question screen ───────────────────────────────────────────
  const multi = currentStep.multi
  const key = currentStep.key

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Прогресс */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <button
            onClick={back}
            style={{
              background: 'none', border: 'none', color: 'var(--muted)',
              fontSize: 13, cursor: 'pointer', padding: '4px 0',
            }}
          >
            ← Назад
          </button>
          <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>
            {step} из {TOTAL}
          </span>
        </div>
        {/* Полоска прогресса */}
        <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%', borderRadius: 2,
              background: 'var(--accent)',
              width: `${(step / TOTAL) * 100}%`,
              transition: 'width 0.25s ease',
            }}
          />
        </div>
      </div>

      {/* Вопрос */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 20px 20px' }}>
        <h2
          style={{
            fontSize: 22, fontWeight: 800, color: 'var(--text)',
            lineHeight: 1.3, marginBottom: 6,
          }}
        >
          {currentStep.question}
        </h2>
        {multi && (
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Можно выбрать несколько</p>
        )}
        {!multi && <div style={{ marginBottom: 20 }} />}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {currentStep.options.map((opt) => {
            const active = isSelected(key, opt)
            return (
              <button
                key={opt}
                onClick={() => toggle(key, opt, multi)}
                style={{
                  ...card,
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  background: active ? 'rgba(124,92,252,0.12)' : 'var(--surface)',
                  color: active ? 'var(--accent)' : 'var(--text)',
                  fontSize: 15,
                  fontWeight: active ? 600 : 400,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 18, height: 18, borderRadius: multi ? 4 : 9,
                    border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                    background: active ? 'var(--accent)' : 'transparent',
                    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {active && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                {opt}
              </button>
            )
          })}

          {/* Кастомный ответ для шага 2 */}
          {step === 2 && answers.step2 === CUSTOM_OPTION && (
            <input
              autoFocus
              className="input"
              type="text"
              placeholder={step2Placeholder(answers.step1)}
              value={answers.step2custom}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, step2custom: e.target.value }))
              }
              style={{ marginTop: 4, fontSize: 15 }}
            />
          )}
        </div>
      </div>

      {/* Кнопка Далее */}
      <div style={{ padding: '12px 20px 32px' }}>
        <button
          onClick={next}
          disabled={!canNext()}
          style={{
            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
            background: canNext() ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
            color: canNext() ? '#fff' : 'var(--muted)',
            fontSize: 15, fontWeight: 700,
            cursor: canNext() ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s',
          }}
        >
          {step === TOTAL ? 'Получить результат' : 'Далее'}
        </button>
      </div>
    </div>
  )
}
