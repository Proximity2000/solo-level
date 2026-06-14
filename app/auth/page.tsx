'use client'

import { useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { signInWithMagicLink, signInWithPassword, signUp } from './actions'

type Mode = 'magic' | 'password' | 'register'

export default function AuthPage() {
  const searchParams = useSearchParams()
  const hasError = searchParams.get('error')

  const [mode, setMode] = useState<Mode>('magic')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      let result: { error?: string; success?: boolean } | undefined

      if (mode === 'magic') {
        result = await signInWithMagicLink(formData)
      } else if (mode === 'password') {
        result = await signInWithPassword(formData)
      } else {
        result = await signUp(formData)
      }

      if (result?.error) {
        setMessage({ type: 'error', text: result.error })
      } else if (result?.success) {
        if (mode === 'magic') {
          setMessage({
            type: 'success',
            text: 'Ссылка отправлена на почту. Проверь входящие.',
          })
        } else if (mode === 'register') {
          setMessage({
            type: 'success',
            text: 'Проверь почту — мы отправили ссылку для подтверждения.',
          })
        }
      }
    })
  }

  const isPasswordMode = mode === 'password' || mode === 'register'

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
          <div
            style={{
              fontSize: 40,
              marginBottom: 8,
            }}
          >
            ⚔️
          </div>
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
            Прокачай себя. Каждый день.
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
          {(
            [
              { key: 'magic', label: 'Magic Link' },
              { key: 'password', label: 'Войти' },
              { key: 'register', label: 'Регистрация' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setMode(tab.key)
                setMessage(null)
              }}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 9,
                border: 'none',
                background: mode === tab.key ? 'var(--accent)' : 'transparent',
                color: mode === tab.key ? '#fff' : 'var(--muted)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--muted)',
                marginBottom: 6,
              }}
            >
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

          {isPasswordMode && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--muted)',
                  marginBottom: 6,
                }}
              >
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
          )}

          {/* Message */}
          {message && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                fontSize: 14,
                background:
                  message.type === 'error'
                    ? 'rgba(239,68,68,0.12)'
                    : 'rgba(34,197,94,0.12)',
                color: message.type === 'error' ? '#ef4444' : '#22c55e',
                border: `1px solid ${message.type === 'error' ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
              }}
            >
              {message.text}
            </div>
          )}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={isPending}
            style={{ marginTop: 4 }}
          >
            {isPending
              ? 'Загрузка...'
              : mode === 'magic'
              ? 'Отправить ссылку'
              : mode === 'register'
              ? 'Создать аккаунт'
              : 'Войти'}
          </button>
        </form>

        {/* Hint */}
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
          {mode === 'magic' &&
            'Мы отправим ссылку для входа без пароля.'}
          {mode === 'password' &&
            'Войди с email и паролем.'}
          {mode === 'register' &&
            'Создай аккаунт и начни прокачку.'}
        </p>
      </div>
    </div>
  )
}
