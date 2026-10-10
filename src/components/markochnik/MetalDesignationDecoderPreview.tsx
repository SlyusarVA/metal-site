'use client'

import { useMemo, useState } from 'react'
import { parseMetalDesignation, type MetalDesignationTokenResult } from '@/lib/metalDesignationParser'

const DEFAULT_INPUT = 'Круг h11-7,0 ГОСТ 7417-75 / 30ХГСА-В-ТО ГОСТ 4543-2016'

export default function MetalDesignationDecoderPreview() {
  const [input, setInput] = useState(DEFAULT_INPUT)
  const result = useMemo(() => parseMetalDesignation(input), [input])
  const verifiedCount = result.tokens.filter(token => token.confidence === 'verified').length
  const contextualCount = result.tokens.filter(token => token.confidence === 'contextual').length
  const unknownCount = result.unknownTokens.length

  return (
    <section style={st.preview} aria-labelledby="metal-decoder-preview-title">
      <div style={st.previewHead}>
        <div>
          <div style={st.kicker}>Preview</div>
          <h2 id="metal-decoder-preview-title" style={st.h2}>Расшифровщик обозначений металла</h2>
        </div>
        <div style={st.counters} aria-label="Статистика разбора">
          <span style={{ ...st.counter, ...st.verifiedSoft }}>{verifiedCount} verified</span>
          <span style={{ ...st.counter, ...st.contextualSoft }}>{contextualCount} contextual</span>
          <span style={{ ...st.counter, ...st.unknownSoft }}>{unknownCount} unknown</span>
        </div>
      </div>

      <p style={st.notice}>
        Это preview на partial-базе. Contextual означает, что точная трактовка требует проверки по полному обозначению и ГОСТ.
      </p>

      <div style={st.inputGrid}>
        <label style={st.inputLabel} htmlFor="metal-designation-input">Обозначение</label>
        <textarea
          id="metal-designation-input"
          value={input}
          onChange={event => setInput(event.target.value)}
          rows={3}
          style={st.textarea}
          spellCheck={false}
        />
        <button type="button" onClick={() => setInput(DEFAULT_INPUT)} style={st.resetButton}>
          Вернуть пример
        </button>
      </div>

      <div style={st.partsGrid} aria-label="Части обозначения">
        {result.parts.map(part => (
          <div key={`${part.span.start}-${part.span.end}`} style={st.part}>
            <div style={st.partTitle}>{part.raw}</div>
            <div style={st.partMeta}>{part.tokens.length} токенов</div>
          </div>
        ))}
      </div>

      <div style={st.tokenList} aria-label="Найденные токены" aria-live="polite" aria-atomic="false">
        {result.tokens.length > 0 ? (
          result.tokens.map(token => <TokenCard key={`${token.raw}-${token.span.start}-${token.span.end}`} token={token} />)
        ) : (
          <div style={st.emptyState}>Введите обозначение, чтобы увидеть разбор по текущей partial-базе.</div>
        )}
      </div>
    </section>
  )
}

function TokenCard({ token }: { token: MetalDesignationTokenResult }) {
  const isVerified = token.confidence === 'verified'
  const isContextual = token.confidence === 'contextual'
  const cardStyle = {
    ...st.tokenCard,
    ...(isVerified ? st.verifiedCard : isContextual ? st.contextualCard : st.unknownCard),
  }

  return (
    <article style={cardStyle} aria-label={`Токен ${token.raw}`}>
      <div style={st.tokenTop}>
        <div style={st.rawToken}>{token.raw}</div>
        <span style={{
          ...st.confidenceBadge,
          ...(isVerified ? st.verifiedBadge : isContextual ? st.contextualBadge : st.unknownBadge),
        }}>
          {token.confidence}
        </span>
      </div>

      <dl style={st.details}>
        <div style={st.detailRow}>
          <dt style={st.detailLabel}>Normalized</dt>
          <dd style={st.detailValue}>{token.normalized}</dd>
        </div>
        <div style={st.detailRow}>
          <dt style={st.detailLabel}>Type</dt>
          <dd style={st.detailValue}>{token.type}</dd>
        </div>
        <div style={st.detailRow}>
          <dt style={st.detailLabel}>Meaning</dt>
          <dd style={st.detailValue}>{token.meaning}</dd>
        </div>
        <div style={st.detailRow}>
          <dt style={st.detailLabel}>ГОСТ</dt>
          <dd style={st.detailValue}>{token.sourceGosts.length ? token.sourceGosts.join(', ') : 'нет в partial-базе'}</dd>
        </div>
      </dl>

      {token.displayWarning ? (
        <p style={st.warning}>{token.displayWarning}</p>
      ) : null}

      {token.confidence === 'unknown' ? (
        <p style={st.unknownNote}>Нет в текущей partial-базе. Это не означает, что обозначение неверное.</p>
      ) : null}
    </article>
  )
}

const st: Record<string, React.CSSProperties> = {
  preview: { maxWidth: 1120, margin: '0 auto 12px', padding: 18, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', boxShadow: 'var(--shadow-1)' },
  previewHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' },
  kicker: { fontSize: 'var(--text-xs)', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--primary)' },
  h2: { margin: '4px 0 0', fontSize: 'var(--text-xl)', lineHeight: 1.2 },
  counters: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  counter: { padding: '6px 9px', borderRadius: 999, border: '1px solid var(--outline-variant)', fontSize: 'var(--text-xs)', fontWeight: 800 },
  verifiedSoft: { color: 'var(--success)', background: 'var(--success-container)', borderColor: 'var(--success-border)' },
  contextualSoft: { color: 'var(--warning)', background: 'var(--warning-container)', borderColor: 'var(--warning-border)' },
  unknownSoft: { color: 'var(--on-surface-variant)', background: 'var(--surface-container)' },
  notice: { margin: '14px 0', padding: 12, border: '1px solid var(--warning-border)', borderRadius: 'var(--radius-md)', color: 'var(--warning)', background: 'var(--warning-container)', lineHeight: 1.5, fontSize: 'var(--text-sm)', fontWeight: 700 },
  inputGrid: { display: 'grid', gap: 8 },
  inputLabel: { fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--on-surface-variant)' },
  textarea: { width: '100%', minHeight: 84, resize: 'vertical', padding: 12, border: '1px solid var(--outline)', borderRadius: 'var(--radius-md)', color: 'var(--on-surface)', background: 'var(--surface-variant)', lineHeight: 1.5, outlineColor: 'var(--primary)' },
  resetButton: { justifySelf: 'start', padding: '8px 11px', border: '1px solid var(--outline-variant)', borderRadius: 999, color: 'var(--primary)', background: 'var(--surface-container)', fontSize: 'var(--text-xs)', fontWeight: 800, cursor: 'pointer' },
  partsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: 10, marginTop: 14 },
  part: { minWidth: 0, padding: 11, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)' },
  partTitle: { fontWeight: 800, overflowWrap: 'anywhere' },
  partMeta: { marginTop: 4, color: 'var(--on-surface-variant)', fontSize: 'var(--text-xs)', fontWeight: 700 },
  tokenList: { display: 'grid', gap: 10, marginTop: 14 },
  tokenCard: { minWidth: 0, padding: 13, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)' },
  verifiedCard: { borderColor: 'var(--success-border)' },
  contextualCard: { borderColor: 'var(--warning-border)' },
  unknownCard: { borderColor: 'var(--outline)' },
  tokenTop: { display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' },
  rawToken: { fontSize: 'var(--text-lg)', fontWeight: 900, color: 'var(--on-surface)', overflowWrap: 'anywhere' },
  confidenceBadge: { flexShrink: 0, padding: '5px 8px', borderRadius: 999, border: '1px solid var(--outline-variant)', fontSize: 'var(--text-xs)', fontWeight: 900, lineHeight: 1.1 },
  verifiedBadge: { color: 'var(--success)', background: 'var(--success-container)', borderColor: 'var(--success-border)' },
  contextualBadge: { color: 'var(--warning)', background: 'var(--warning-container)', borderColor: 'var(--warning-border)' },
  unknownBadge: { color: 'var(--on-surface-variant)', background: 'var(--surface)' },
  details: { display: 'grid', gap: 7, margin: '11px 0 0' },
  detailRow: { display: 'grid', gridTemplateColumns: '116px minmax(0, 1fr)', gap: 10, alignItems: 'baseline' },
  detailLabel: { color: 'var(--on-surface-variant)', fontSize: 'var(--text-xs)', fontWeight: 800 },
  detailValue: { margin: 0, color: 'var(--on-surface)', fontSize: 'var(--text-sm)', lineHeight: 1.45, overflowWrap: 'anywhere' },
  warning: { margin: '12px 0 0', padding: 10, border: '1px solid var(--warning-border)', borderRadius: 'var(--radius-sm)', color: 'var(--warning)', background: 'var(--warning-container)', lineHeight: 1.45, fontSize: 'var(--text-xs)', fontWeight: 700 },
  unknownNote: { margin: '12px 0 0', color: 'var(--on-surface-variant)', fontSize: 'var(--text-xs)', lineHeight: 1.45 },
  emptyState: { padding: 14, border: '1px dashed var(--outline)', borderRadius: 'var(--radius-md)', color: 'var(--on-surface-variant)', background: 'var(--surface-container)', fontSize: 'var(--text-sm)' },
}
