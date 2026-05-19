'use client'

import { useState } from 'react'
import { gostReferences, GostReference } from '@/data/gost'

interface Props {
  onClose: () => void
}

export default function GostPanel({ onClose }: Props) {
  const [selected, setSelected] = useState<GostReference>(gostReferences[0])
  const [search, setSearch] = useState('')

  const filtered = gostReferences.filter(g =>
    g.code.toLowerCase().includes(search.toLowerCase()) ||
    g.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,.32)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 8px 32px rgba(0,0,0,.18)',
        width: 820,
        maxWidth: '96vw',
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Шапка */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--outline-variant)',
          flexShrink: 0,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Справочник ГОСТ</h2>
          <button onClick={onClose} style={iconBtnStyle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Тело: список + детали */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Левая колонка — список */}
          <div style={{
            width: 260,
            flexShrink: 0,
            borderRight: '1px solid var(--outline-variant)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Поиск */}
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--outline-variant)', flexShrink: 0 }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск по коду или названию..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '7px 10px',
                  border: '1px solid var(--outline-variant)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12,
                  fontFamily: 'Manrope, sans-serif',
                  background: 'var(--surface-variant)',
                  color: 'var(--on-surface)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Список ГОСТов */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filtered.map(g => (
                <button
                  key={g.code}
                  onClick={() => setSelected(g)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: selected.code === g.code ? 'var(--primary-container)' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--outline-variant)',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    fontFamily: 'Manrope, sans-serif',
                    transition: 'background .12s',
                  }}
                  onMouseEnter={e => { if (selected.code !== g.code) (e.currentTarget.style.background = 'var(--surface-variant)') }}
                  onMouseLeave={e => { if (selected.code !== g.code) (e.currentTarget.style.background = 'transparent') }}
                >
                  <div style={{
                    fontSize: 12, fontWeight: 700,
                    color: selected.code === g.code ? 'var(--primary)' : 'var(--on-surface)',
                  }}>
                    {g.code}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: 'var(--on-surface-variant)',
                    marginTop: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {g.title}
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div style={{ padding: 20, fontSize: 12, color: 'var(--on-surface-variant)', textAlign: 'center' }}>
                  Ничего не найдено
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка — детали */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, letterSpacing: '.06em', marginBottom: 4 }}>
              {selected.code}
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.4 }}>
              {selected.title}
            </h3>

            <Section title="Область применения">
              <p style={textStyle}>{selected.scope}</p>
            </Section>

            <Section title="Ключевые параметры">
              <ul style={ulStyle}>
                {selected.keyParams.map((p, i) => <li key={i} style={liStyle}>{p}</li>)}
              </ul>
            </Section>

            <Section title="Допуски">
              <ul style={ulStyle}>
                {selected.tolerances.map((t, i) => <li key={i} style={liStyle}>{t}</li>)}
              </ul>
            </Section>

            {selected.critical.length > 0 && (
              <Section title="Важно учитывать">
                <div style={{
                  background: 'var(--primary-container)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}>
                  {selected.critical.map((c, i) => (
                    <div key={i} style={{ fontSize: 12, color: 'var(--on-surface)', display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 700, flexShrink: 0 }}>!</span>
                      {c}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section title="Маркировка">
              <p style={textStyle}>{selected.marking}</p>
            </Section>

            <a
              href={selected.fullTextUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 8,
                fontSize: 12,
                color: 'var(--primary)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Полный текст ГОСТа →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: 'var(--on-surface-variant)',
        letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6,
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

const textStyle: React.CSSProperties = {
  fontSize: 13, color: 'var(--on-surface)', margin: 0, lineHeight: 1.6,
}

const ulStyle: React.CSSProperties = {
  margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4,
}

const liStyle: React.CSSProperties = {
  fontSize: 13, color: 'var(--on-surface)', lineHeight: 1.5,
}

const iconBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--on-surface-variant)', padding: 4,
  borderRadius: 'var(--radius-sm)', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
}
