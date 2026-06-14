'use client'

import { useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { signInWithPassword, signUp, sendPasswordReset } from './actions'

type Mode = 'register' | 'login'

export default function AuthPage() {
  const searchParams = useSearchParams()
  const hasError = searchParams.get('error')

  const [mode, setMode] = useState<Mode>('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(
    hasError ? { type: 'error', text: 'Ошибка авторизации. Попробуй ещё раз.' } : null
  )
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    const formData = new FormData()
    formData.set('email', email)
    formData.set('password', password)

    startTransition(async () => {
      const result = mode === 'login'
        ? await signInWithPassword(formData) as { error?: string; success?: boolean } | undefined
        : await signUp(formData)

      if (result?.error) {
        setMessage({ type: 'error', text: result.error })
      } else if (result?.success) {
        // Только при register + email confirmation включён
        setMessage({
          type: 'success',
          text: 'Проверь почту — мы отправили ссылку для подтверждения.',
        })
      }
    })
  }

  function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    const formData = new FormData()
    formData.set('email', resetEmail)

    startTransition(async () => {
      await sendPasswordReset(formData)
      setMessage({
        type: 'success',
        text: 'Если аккаунт существует, мы отправили ссылку для восстановления пароля.',
      })
    })
  }

  function switchMode(m: Mode) {
    setMode(m)
    setMessage(null)
    setShowReset(false)
    setEmail('')
    setPassword('')
  }

  const msgStyle = (type: 'error' | 'success') => ({
    padding: '12px 14px',
    borderRadius: 10,
    fontSize: 14,
    background: type === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
    color: type === 'error' ? '#ef4444' : '#22c55e',
    border: `1px solid ${type === 'error' ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
  })

  return (
    <div className="app-shell">
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '32px 24px',
          gap: '32px',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>⚔️</div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
            }}
          >
            Solo Level
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>
            Прокачивай себя каждый день
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            background: 'var(--surface)',
            borderRadius: 12,
            padding: 4,
            gap: 2,
          }}
        >
          {([
            { key: 'register', label: 'Регистрация' },
            { key: 'login',    label: 'Войти' },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => switchMode(tab.key)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 9,
                border: 'none',
                background: mode === tab.key ? 'var(--accent)' : 'transparent',
                color: mode === tab.key ? '#fff' : 'var(--muted)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Форма восстановления пароля ── */}
        {showReset ? (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 4 }}>
              Введи email, привязанный к аккаунту
            </p>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: 6 }}>
                Email
              </label>
              <input
                className="input"
                type="email"
                placeholder="твой@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                autoComplete="email"
                inputMode="email"
              />
            </div>

            {message && <div style={msgStyle(message.type)}>{message.text}</div>}

            <button className="btn btn-primary" type="submit" disabled={isPending} style={{ marginTop: 4 }}>
              {isPending ? 'Отправка...' : 'Отправить ссылку для восстановления'}
            </button>
            <button
              type="button"
              onClick={() => { setShowReset(false); setMessage(null) }}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer', padding: '4px 0' }}
            >
              ← Назад
            </button>
          </form>
        ) : (
          /* ── Основная форма ── */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: 6 }}>
                Email
              </label>
              <input
                className="input"
                type="email"
                placeholder="твой@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                inputMode="email"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: 6 }}>
                Пароль
              </label>
              <input
                className="input"
                type="password"
                placeholder={mode === 'register' ? 'Минимум 6 символов' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
            </div>

            {/* Forgot password — только на вкладке Войти */}
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => { setShowReset(true); setResetEmail(email); setMessage(null) }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--muted)',
                  fontSize: 12,
                  cursor: 'pointer',
                  textAlign: 'right',
                  padding: '0',
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                }}
              >
                Забыли пароль?
              </button>
            )}

            {message && <div style={msgStyle(message.type)}>{message.text}</div>}

            <button
              className="btn btn-primary"
              type="submit"
              disabled={isPending}
              style={{ marginTop: 4 }}
            >
              {isPending ? 'Загрузка...' : mode === 'register' ? 'Создать аккаунт' : 'Войти'}
            </button>
          </form>
        )}

        {/* Hint */}
        {!showReset && (
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
            {mode === 'register'
              ? 'Создай аккаунт и начни прокачку.'
              : 'Войди с email и паролем.'}
          </p>
        )}
      </div>
    </div>
  )
}
