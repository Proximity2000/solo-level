'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updatePassword } from '../actions'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [done, setDone] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Пароль — минимум 6 символов' })
      return
    }
    if (password !== confirm) {
      setMessage({ type: 'error', text: 'Пароли не совпадают' })
      return
    }

    const formData = new FormData()
    formData.set('password', password)

    startTransition(async () => {
      const result = await updatePassword(formData)
      if (result?.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setDone(true)
        setMessage({ type: 'success', text: 'Пароль успешно обновлён' })
      }
    })
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
          gap: '24px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔑</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Новый пароль
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>
            Придумай новый пароль для входа
          </p>
        </div>

        {done ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {message && <div style={msgStyle(message.type)}>{message.text}</div>}
            <button
              className="btn btn-primary"
              onClick={() => router.push('/today')}
            >
              Перейти в приложение
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: 6 }}>
                Новый пароль
              </label>
              <input
                className="input"
                type="password"
                placeholder="Минимум 6 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: 6 }}>
                Повтори пароль
              </label>
              <input
                className="input"
                type="password"
                placeholder="Повтори пароль"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {message && <div style={msgStyle(message.type)}>{message.text}</div>}

            <button
              className="btn btn-primary"
              type="submit"
              disabled={isPending}
              style={{ marginTop: 4 }}
            >
              {isPending ? 'Сохранение...' : 'Установить новый пароль'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
