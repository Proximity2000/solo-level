'use client'

import type { DayResult } from '@/lib/types'

interface DayEntry {
  date: string      // YYYY-MM-DD
  result: DayResult | null
}

interface PathCalendarProps {
  logs: { date: string; result: DayResult }[]
  days?: number
}

// Цвет клетки по результату дня
function dayColor(result: DayResult | null, isToday: boolean): string {
  if (isToday && !result) return 'var(--accent)'
  switch (result) {
    case 'full':       return 'var(--accent)'    // фиолетовый
    case 'simplified': return 'var(--mind)'      // синий
    case 'minimum':    return 'var(--awareness)' // жёлтый
    case 'skipped':    return 'var(--body)'      // красный
    default:           return '#2e2e42'           // пусто/будущее
  }
}

function dayLabel(result: DayResult | null): string {
  switch (result) {
    case 'full':       return 'Выполнено полностью'
    case 'simplified': return 'Упрощённый день'
    case 'minimum':    return 'Минимум дня'
    case 'skipped':    return 'Пропущен'
    default:           return 'Нет данных'
  }
}

export default function PathCalendar({ logs, days = 90 }: PathCalendarProps) {
  // Строим карту date → result
  const logMap = new Map<string, DayResult>()
  for (const log of logs) {
    logMap.set(log.date, log.result)
  }

  // Генерируем массив дат: от (сегодня - days + 1) до сегодня
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  const entries: DayEntry[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    entries.push({
      date: dateStr,
      result: logMap.get(dateStr) ?? null,
    })
  }

  // Заполняем пустые дни в начале до полной недели (Пн — первый день)
  const firstDayOfWeek = new Date(entries[0].date).getDay() // 0=Вс
  // Смещение: хотим Пн=0, Вс=6
  const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
  const paddingDays: DayEntry[] = Array.from({ length: offset }, (_, i) => ({
    date: `pad-${i}`,
    result: null,
  }))
  const allEntries = [...paddingDays, ...entries]

  // Подсчёт итогов
  const counts = { full: 0, simplified: 0, minimum: 0, skipped: 0 }
  for (const e of entries) {
    if (e.result && e.result in counts) {
      counts[e.result as keyof typeof counts]++
    }
  }

  return (
    <div>
      {/* Метки дней недели */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 3,
          marginBottom: 4,
        }}
      >
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontSize: 10,
              color: 'var(--muted)',
              fontWeight: 600,
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Сетка дней */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 3,
        }}
      >
        {allEntries.map((entry) => {
          const isPad = entry.date.startsWith('pad-')
          const isToday = entry.date === todayStr
          const color = isPad ? 'transparent' : dayColor(entry.result, isToday)

          return (
            <div
              key={entry.date}
              title={isPad ? '' : `${entry.date}: ${dayLabel(entry.result)}`}
              style={{
                height: 44,
                borderRadius: 4,
                backgroundColor: color,
                border: isToday ? '2px solid var(--accent)' : 'none',
                opacity: isPad ? 0 : 1,
              }}
            />
          )
        })}
      </div>

      {/* Легенда */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px 16px',
          marginTop: 16,
          fontSize: 11,
          color: 'var(--muted)',
        }}
      >
        {[
          { color: 'var(--accent)',    label: `Полный (${counts.full})` },
          { color: 'var(--mind)',      label: `Упрощённый (${counts.simplified})` },
          { color: 'var(--awareness)',  label: `Минимум (${counts.minimum})` },
          { color: 'var(--body)',      label: `Пропущен (${counts.skipped})` },
          { color: '#2e2e42',          label: 'Нет данных' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: color,
                flexShrink: 0,
              }}
            />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
