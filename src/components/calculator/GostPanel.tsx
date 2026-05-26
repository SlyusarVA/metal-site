'use client'

import { useState } from 'react'
import { gostReferences, GostReference } from '@/data/gost'
import AppDialog from '@/components/ui/AppDialog'

interface Props {
  onClose: () => void
  initialCode?: string | null
}

function findGost(code?: string | null): GostReference {
  if (!code) return gostReferences[0]
  const normalized = code.trim().toLowerCase()
  return gostReferences.find(g => g.code.trim().toLowerCase() === normalized) ?? gostReferences[0]
}

export default function GostPanel({ onClose, initialCode }: Props) {
  const [selected, setSelected] = useState<GostReference>(() => findGost(initialCode))
  const [search, setSearch] = useState('')

  const filtered = gostReferences.filter(g =>
    g.code.toLowerCase().includes(search.toLowerCase()) ||
    g.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppDialog title="Справочник ГОСТ" onClose={onClose} width={820} height="80dvh">
      <div className="ui-dialog-shell" style={{ height: '80dvh' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--outline-variant)',
          flexShrink: 0,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Справочник ГОСТ</h2>
          <button onClick={onClose} className="ui-icon-button" aria-label="Закрыть справочник ГОСТ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div style={{
            width: 260,
            flexShrink: 0,
            borderRight: '1px solid var(--outline-variant)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
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
                }}
              />
            </div>

            <div className="ui-scroll-area" style={{ flex: 1, overflowY: 'auto' }}>
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

          <div className="ui-scroll-area" style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, letterSpacing: '.06em', marginBottom: 4 }}>
              {selected.code}
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.4 }}>
              {selected.title}
            </h3>

            <Section title="Область применения"><p style={textStyle}>{selected.scope}</p></Section>
            <Section title="Ключевые параметры"><ul style={ulStyle}>{selected.keyParams.map((p, i) => <li key={i} style={liStyle}>{p}</li>)}</ul></Section>
            <Section title="Допуски"><ul style={ulStyle}>{selected.tolerances.map((t, i) => <li key={i} style={liStyle}>{t}</li>)}</ul></Section>

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

            <Section title="Маркировка"><p style={textStyle}>{selected.marking}</p></Section>

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
    </AppDialog>
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

const textStyle: React.CSSProperties = { fontSize: 13, color: 'var(--on-surface)', margin: 0, lineHeight: 1.6 }
const ulStyle: React.CSSProperties = { margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }
const liStyle: React.CSSProperties = { fontSize: 13, color: 'var(--on-surface)', lineHeight: 1.5 }
