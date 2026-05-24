'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadHistory, clearHistory, formatTimestamp, HistoryRecord } from '@/lib/history'
import ThemeToggle from '@/components/ThemeToggle'

export default function HistoryPage() {
  const router = useRouter()
  const [records, setRecords] = useState<HistoryRecord[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setRecords(loadHistory())
    setLoaded(true)
  }, [])

  function handleClear() {
    if (confirm('Очистить всю историю расчётов?')) {
      clearHistory()
      setRecords([])
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-variant)' }}>

      {/* Шапка — те же токены что и nav в калькуляторе */}
      <div style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--outline-variant)',
        height: 44,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 8,
      }}>
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--primary)', fontSize: 12,
            fontFamily: 'Manrope, sans-serif',
            display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px',
            borderRadius: 6, transition: 'background .15s',
            fontWeight: 500,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--outline-variant)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          ← Калькулятор
        </button>
        <span style={{ color: 'var(--outline)', fontSize: 14 }}>/</span>
        <span style={{ color: 'var(--on-surface)', fontSize: 12, fontWeight: 600 }}>
          История расчётов
        </span>
        <div style={{ flex: 1 }} />
        <ThemeToggle />
      </div>

      {/* Контент — центрирован как карточка калькулятора */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '20px 16px 60px' }}>

        {/* Заголовок + кнопка очистки */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 16,
        }}>
          <div>
            <h1 style={{
              fontSize: 18, fontWeight: 700,
              color: 'var(--on-surface)', margin: '0 0 2px',
            }}>
              История расчётов
            </h1>
            {loaded && (
              <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', margin: 0 }}>
                {records.length === 0 ? 'Нет записей' : `${records.length} из 50 записей`}
              </p>
            )}
          </div>
          {records.length > 0 && (
            <button
              onClick={handleClear}
              style={{
                background: 'none',
                border: '1px solid var(--outline)',
                borderRadius: 'var(--radius-full)', padding: '6px 14px',
                fontSize: 12, color: 'var(--on-surface-variant)',
                cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
                transition: 'background .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--outline-variant)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              Очистить
            </button>
          )}
        </div>

        {/* Пустое состояние */}
        {loaded && records.length === 0 && (
          <div style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--outline-variant)',
            padding: '48px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
            <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', margin: '0 0 16px' }}>
              Здесь появятся ваши расчёты после нажатия кнопки «Рассчитать»
            </p>
            <button
              onClick={() => router.push('/')}
              style={{
                background: 'var(--primary)', color: '#fff', border: 'none',
                borderRadius: 'var(--radius-full)', padding: '10px 24px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              Перейти к калькулятору
            </button>
          </div>
        )}

        {/* Список записей */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, containerType: 'inline-size' }}>
          {records.map(r => (
            <div key={r.id} style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--outline-variant)',
              padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 16,
              transition: 'border-color .15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--outline)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--outline-variant)')}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: 8, marginBottom: 4, flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>
                    {r.metalGroup} · {r.profileName}
                  </span>
                  <span style={{
                    fontSize: 11, color: 'var(--on-surface-variant)',
                    background: 'var(--surface-container)',
                    borderRadius: 'var(--radius-full)', padding: '1px 8px',
                  }}>
                    {r.grade}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                  {Object.entries(r.params).map(([k, v]) => (
                    <span key={k} style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
                      {k} = {v} мм
                    </span>
                  ))}
                  {r.length > 0 && (
                    <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
                      L = {r.length} м
                    </span>
                  )}
                  {r.quantity > 1 && (
                    <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
                      {r.quantity} шт
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>
                  {formatTimestamp(r.timestamp)}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontSize: 20, fontWeight: 700,
                  color: 'var(--on-surface)', lineHeight: 1.2,
                }}>
                  {r.mass.toFixed(3)}
                  <span style={{
                    fontSize: 12, fontWeight: 400,
                    color: 'var(--on-surface-variant)', marginLeft: 4,
                  }}>кг</span>
                </div>
                {r.linearDensity > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginTop: 2 }}>
                    {r.linearDensity.toFixed(4)} кг/м
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
