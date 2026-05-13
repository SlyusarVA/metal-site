'use client'

import { useState, useRef, useEffect } from 'react'
import { search, SearchResult } from '@/data/gostSearch'
import { ProfileKey } from '@/data/profiles'

interface Props {
  onResult: (metalGroups: string[], profileKeys: ProfileKey[], grade?: string) => void
  onClear: () => void
}

const TYPE_ICON: Record<string, string> = {
  grade: '⬡',
  group: '▦',
  gost:  '§',
}

const TYPE_COLOR: Record<string, string> = {
  grade: '#1565C0',
  group: '#2E7D32',
  gost:  '#6A1B9A',
}

const TYPE_BG: Record<string, string> = {
  grade: '#E3F2FD',
  group: '#E8F5E9',
  gost:  '#F3E5F5',
}

export default function GostSearchBar({ onResult, onClear }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [activeResult, setActiveResult] = useState<SearchResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const found = search(query)
    setResults(found)

    if (query.length === 0) {
      setActiveResult(null)
      setOpen(false)
      onClear()
      return
    }

    setOpen(found.length > 0)

    // Автовыбор при точном совпадении
    const exact = found.find(r => r.score === 1.0)
    if (exact) {
      setActiveResult(exact)
      setOpen(false)
      onResult(exact.metalGroups, exact.profileKeys, exact.grade)
    }
  }, [query])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!inputRef.current?.contains(e.target as Node) && !dropdownRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (r: SearchResult) => {
    setQuery(r.type === 'grade' ? r.label : r.label)
    setActiveResult(r)
    setOpen(false)
    onResult(r.metalGroups, r.profileKeys, r.grade)
  }

  const handleClear = () => {
    setQuery('')
    setActiveResult(null)
    setOpen(false)
    onClear()
    inputRef.current?.focus()
  }

  const hasResult = activeResult !== null && query.length > 0

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        background: hasResult ? 'var(--primary-container)' : 'var(--surface-container)',
        border: `1px solid ${hasResult ? 'var(--primary)' : 'var(--outline-variant)'}`,
        borderRadius: 'var(--radius-sm)',
        padding: '0 10px', gap: 8,
        transition: 'all .2s',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke={hasResult ? 'var(--primary)' : 'var(--on-surface-variant)'} strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Поиск: марка (Д16Т, Ст3сп), ГОСТ (8239-89), металл (латунь)..."
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          style={{
            flex: 1, border: 'none', background: 'transparent',
            padding: '8px 0', fontSize: 13,
            color: hasResult ? 'var(--primary)' : 'var(--on-surface)',
            fontFamily: 'Manrope, sans-serif', outline: 'none',
          }}
        />

        {activeResult && (
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: TYPE_COLOR[activeResult.type],
            background: TYPE_BG[activeResult.type],
            borderRadius: 'var(--radius-full)',
            padding: '2px 10px', whiteSpace: 'nowrap',
            maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {TYPE_ICON[activeResult.type]} {activeResult.label}
          </span>
        )}

        {query.length > 0 && (
          <button onClick={handleClear} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 2, color: 'var(--on-surface-variant)', lineHeight: 1, flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div ref={dropdownRef} style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'var(--surface)', border: '1px solid var(--outline-variant)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-2)',
          zIndex: 50, overflow: 'hidden', maxHeight: 320, overflowY: 'auto',
        }}>
          {results.map((r, i) => (
            <button key={i} onClick={() => handleSelect(r)} style={{
              display: 'flex', flexDirection: 'column', width: '100%', textAlign: 'left',
              background: 'none', border: 'none',
              borderBottom: '1px solid var(--outline-variant)',
              padding: '10px 14px', cursor: 'pointer',
              fontFamily: 'Manrope, sans-serif', transition: 'background .1s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-container)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '1px 8px',
                  borderRadius: 'var(--radius-full)',
                  color: TYPE_COLOR[r.type], background: TYPE_BG[r.type],
                }}>
                  {TYPE_ICON[r.type]} {r.type === 'grade' ? 'Марка' : r.type === 'group' ? 'Металл' : 'ГОСТ'}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>
                  {r.label}
                </span>
                {r.metalGroups.length > 0 && r.type !== 'group' && (
                  <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                    {r.metalGroups.map(g => (
                      <span key={g} style={{
                        fontSize: 10, fontWeight: 600,
                        background: 'var(--primary-container)',
                        color: 'var(--on-primary-container)',
                        borderRadius: 'var(--radius-full)', padding: '1px 7px',
                      }}>{g}</span>
                    ))}
                  </div>
                )}
              </div>
              <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{r.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
