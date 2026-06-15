'use client'

import { useState, useTransition } from 'react'
import HonestyModal from './HonestyModal'
import { SPHERE_LABELS, SPHERE_EMOJI } from '@/lib/types'
import type { DailyMission, Task, Sphere } from '@/lib/types'

type CompletionType = 'full' | 'simplified' | 'minimum'
type SimplificationLevel = 0 | 1 | 2 // 0=full, 1=simplified, 2=minimum

type Props = {
  mission: DailyMission & { task: Task }
  onComplete: (missionId: string, type: CompletionType) => Promise<void>
}

const SPHERE_COLOR: Record<Sphere, string> = {
  body: 'var(--body)',
  mind: 'var(--mind)',
  discipline: 'var(--discipline)',
  social: 'var(--social)',
  awareness: 'var(--awareness)',
  challenge: 'var(--challenge)',
}

export default function MissionCard({ mission, onComplete }: Props) {
  const [level, setLevel] = useState<SimplificationLevel>(0)
  const [showModal, setShowModal] = useState(false)
  const [isPending, startTransition] = useTransition()

  const { task } = mission
  const isDone = mission.completion !== 'pending'
  const sphere = mission.sphere as Sphere
  const isChallenge = mission.type === 'challenge'
  const color = SPHERE_COLOR[sphere]

  const title = level === 0 ? task.title : level === 1 ? task.simplified_title : task.minimum_title
  const desc = level === 0 ? task.description : level === 1 ? task.simplified_desc : task.minimum_desc
  const xp = level === 0 ? task.xp_full : level === 1 ? task.xp_simplified : task.xp_minimum
  const completionType: CompletionType = level === 0 ? 'full' : level === 1 ? 'simplified' : 'minimum'

  function handleConfirm() {
    startTransition(async () => {
      await onComplete(mission.id, completionType)
      setShowModal(false)
    })
  }

  return (
    <>
      <div
        style={{
          background: 'var(--surface)',
          border: `1px solid ${isDone ? color + '50' : 'var(--border)'}`,
          borderRadius: 16,
          padding: 16,
          opacity: isDone ? 0.65 : 1,
          position: 'relative',
          overflow: 'hidden',
          transition: 'opacity 0.2s',
        }}
      >
        {/* Верхняя полоска сферы при выполнении */}
        {isDone && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: color,
            }}
          />
        )}

        {/* Хедер: бейдж сферы + XP */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <span className={`badge badge-${sphere}`}>
            {SPHERE_EMOJI[sphere]}{' '}
            {isChallenge ? '⚡ Вызов дня' : SPHERE_LABELS[sphere]}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color,
              background: `${color}18`,
              padding: '3px 9px',
              borderRadius: 8,
            }}
          >
            +{xp} XP
          </span>
        </div>

        {/* Заголовок и описание */}
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--text)',
            lineHeight: 1.35,
            marginBottom: 6,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: 14,
            color: 'var(--muted)',
            lineHeight: 1.55,
            marginBottom: isDone ? 10 : 14,
          }}
        >
          {desc}
        </p>

        {/* Сегментированный выбор уровня */}
        {!isDone && (
          <div
            style={{
              display: 'flex',
              gap: 2,
              marginBottom: 12,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 10,
              padding: 3,
            }}
          >
            {([
              { lvl: 0 as SimplificationLevel, label: 'Полная' },
              { lvl: 1 as SimplificationLevel, label: 'Упрощённая' },
              { lvl: 2 as SimplificationLevel, label: 'Минимум' },
            ]).map(({ lvl, label }) => {
              const active = level === lvl
              const activeColor = lvl === 0 ? color : lvl === 1 ? '#eab308' : '#3b82f6'
              return (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  disabled={isPending}
                  style={{
                    flex: 1,
                    padding: '7px 4px',
                    borderRadius: 8,
                    border: 'none',
                    background: active ? activeColor + '22' : 'transparent',
                    color: active ? activeColor : 'var(--muted)',
                    fontSize: 12,
                    fontWeight: active ? 700 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.1s',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        )}

        {/* Статус выполнения или кнопка */}
        {isDone ? (
          <p style={{ fontSize: 13, color, fontWeight: 600 }}>
            ✓ Выполнено · +{mission.xp_earned} XP
          </p>
        ) : (
          <button
            onClick={() => setShowModal(true)}
            disabled={isPending}
            style={{
              width: '100%',
              padding: '11px 8px',
              borderRadius: 10,
              border: 'none',
              background: color,
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: isPending ? 'not-allowed' : 'pointer',
              opacity: isPending ? 0.5 : 1,
            }}
          >
            {isPending ? '...' : 'Выполнено'}
          </button>
        )}
      </div>

      {showModal && (
        <HonestyModal
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
          isPending={isPending}
        />
      )}
    </>
  )
}
