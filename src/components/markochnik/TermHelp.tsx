'use client'

import { useEffect, useRef, useState } from 'react'
import { glossaryTerms } from '@/data/markochnik'

type Props = {
  termId: keyof typeof glossaryTerms
  children?: React.ReactNode
}

export default function TermHelp({ termId, children }: Props) {
  const term = glossaryTerms[termId]
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  if (!term) return <>{children}</>

  return (
    <span ref={wrapRef} style={st.wrap}>
      <span>{children ?? term.term}</span>
      <button
        type="button"
        aria-label={`Пояснение: ${term.term}`}
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
        style={st.button}
      >
        ?
      </button>
      {open && (
        <span role="dialog" aria-label={term.term} style={st.popover}>
          <span style={st.title}>{term.term}</span>
          <span style={st.short}>{term.short}</span>
          <span style={st.details}>{term.details}</span>
          <button type="button" onClick={() => setOpen(false)} style={st.close}>Закрыть</button>
        </span>
      )}
    </span>
  )
}

const st: Record<string, React.CSSProperties> = {
  wrap: { position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 4, verticalAlign: 'baseline' },
  button: {
    inlineSize: 18,
    blockSize: 18,
    borderRadius: 999,
    border: '1px solid var(--outline)',
    background: 'var(--surface-container)',
    color: 'var(--primary)',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 800,
    lineHeight: '16px',
    padding: 0,
    flexShrink: 0,
  },
  popover: {
    position: 'absolute',
    zIndex: 50,
    insetInlineStart: 0,
    insetBlockStart: 'calc(100% + 8px)',
    width: 'min(340px, calc(100vw - 32px))',
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
    padding: 12,
    border: '1px solid var(--outline-variant)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--surface)',
    color: 'var(--on-surface)',
    boxShadow: 'var(--shadow-2)',
    textAlign: 'left',
    whiteSpace: 'normal',
  },
  title: { fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--on-surface)' },
  short: { fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--primary)', lineHeight: 1.45 },
  details: { fontSize: 'var(--text-sm)', color: 'var(--on-surface-variant)', lineHeight: 1.5 },
  close: {
    alignSelf: 'flex-start',
    border: '1px solid var(--outline-variant)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--surface-container)',
    color: 'var(--on-surface)',
    cursor: 'pointer',
    padding: '5px 9px',
    fontSize: 'var(--text-xs)',
    fontWeight: 700,
  },
}
