import Link from 'next/link'
import { designationTerms, type NormativeRef } from '@/data/markochnik'

export const metadata = {
  title: 'Расшифровки обозначений в марочнике',
  description: 'Справочник кодов формы поставки, состояния материала, точности и классов проволоки: ДПРНМ, Б-2А и другие обозначения.',
}

export default function MarkochnikDesignationsPage() {
  return (
    <main id="top" style={st.page}>
      <nav style={st.breadcrumbs}>
        <Link href="/" style={st.crumb}>Калькулятор</Link><span>/</span>
        <Link href="/marki-metallov" style={st.crumb}>Марочник</Link><span>/</span>
        <span>Расшифровки</span>
      </nav>

      <section style={st.hero}>
        <div style={st.kicker}>Справочник обозначений</div>
        <h1 style={st.h1}>Расшифровки кодов поставки и классов</h1>
        <p style={st.lead}>
          Здесь собраны обозначения, которые встречаются рядом с маркой материала: состояние,
          форма сечения, точность изготовления, класс проволоки и размер в условной записи.
        </p>
        <div style={st.jumpList} aria-label="Быстрый переход к обозначению">
          {designationTerms.map(term => (
            <a key={term.slug} href={`#${term.slug}`} style={st.jump}>{term.code}</a>
          ))}
        </div>
      </section>

      <section style={st.grid}>
        {designationTerms.map(term => (
          <article key={term.slug} id={term.slug} style={st.card} aria-labelledby={`${term.slug}-title`}>
            <div style={st.cardHead}>
              <div>
                <div style={st.code}>{term.code}</div>
                <h2 id={`${term.slug}-title`} style={st.h2}>{term.title}</h2>
              </div>
              <span style={st.scope}>{term.materialScope}</span>
            </div>

            <p style={st.summary}>{term.summary}</p>

            <div style={st.table} role="table" aria-label={`Расшифровка ${term.code}`}>
              <div style={st.tableHead} role="columnheader">Знак</div>
              <div style={st.tableHead} role="columnheader">Значение</div>
              {term.parts.map(part => (
                <PartRow key={`${term.slug}-${part.symbol}`} symbol={part.symbol} meaning={part.meaning} note={part.note} />
              ))}
            </div>

            <div style={st.infoGrid}>
              <div>
                <h3 style={st.h3}>Примеры записи</h3>
                <ul style={st.list}>
                  {term.examples.map(example => <li key={example}>{example}</li>)}
                </ul>
              </div>
              <div>
                <h3 style={st.h3}>Близкие коды</h3>
                <div style={st.chips}>
                  {term.relatedCodes.map(code => <span key={code} style={st.chip}>{code}</span>)}
                </div>
              </div>
            </div>

            <p style={st.sourceLine}><SourceLabel source={term.source} /></p>
          </article>
        ))}
      </section>

      <a href="#top" style={st.backTop}>Наверх</a>
    </main>
  )
}

function PartRow({ symbol, meaning, note }: { symbol: string; meaning: string; note?: string }) {
  return (
    <>
      <div style={st.symbolCell} role="cell"><strong>{symbol}</strong></div>
      <div style={st.meaningCell} role="cell">
        <span>{meaning}</span>
        {note ? <small style={st.note}>{note}</small> : null}
      </div>
    </>
  )
}

function sourceText(source: NormativeRef) {
  return [source.document, source.section, source.table].filter(Boolean).join(', ')
}

function SourceLabel({ source }: { source: NormativeRef }) {
  const content = <span>{sourceText(source)}</span>
  if (!source.url) return content
  return <a href={source.url} style={st.sourceLink}>{content}</a>
}

const st: Record<string, React.CSSProperties> = {
  page: { minHeight: '100dvh', padding: '16px 10px 40px', background: 'var(--surface-variant)', color: 'var(--on-surface)', overflowX: 'hidden' },
  breadcrumbs: { maxWidth: 1120, margin: '0 auto 10px', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: 'var(--text-xs)', color: 'var(--on-surface-variant)' },
  crumb: { color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 },
  hero: { maxWidth: 1120, margin: '0 auto 12px', padding: 18, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', boxShadow: 'var(--shadow-1)' },
  kicker: { fontSize: 'var(--text-xs)', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--primary)' },
  h1: { margin: '8px 0', fontSize: 'clamp(26px, 6vw, 42px)', lineHeight: 1.08 },
  h2: { margin: '4px 0 0', fontSize: 'var(--text-xl)', lineHeight: 1.2 },
  h3: { margin: '0 0 8px', fontSize: 'var(--text-md)' },
  lead: { margin: 0, maxWidth: 820, color: 'var(--on-surface-variant)', lineHeight: 1.65 },
  jumpList: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  jump: { display: 'inline-flex', padding: '7px 10px', border: '1px solid var(--outline-variant)', borderRadius: 999, color: 'var(--primary)', background: 'var(--surface-container)', textDecoration: 'none', fontSize: 'var(--text-xs)', fontWeight: 800 },
  grid: { maxWidth: 1120, margin: '0 auto', display: 'grid', gap: 12 },
  card: { minWidth: 0, padding: 16, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', boxShadow: 'var(--shadow-1)', scrollMarginTop: 86 },
  cardHead: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 12, alignItems: 'start' },
  code: { fontSize: 'var(--text-2xl)', fontWeight: 900, lineHeight: 1, color: 'var(--primary)' },
  scope: { maxWidth: 280, padding: '6px 9px', border: '1px solid var(--outline-variant)', borderRadius: 999, background: 'var(--surface-container)', color: 'var(--on-surface-variant)', fontSize: 'var(--text-xs)', fontWeight: 700, textAlign: 'center' },
  summary: { margin: '14px 0', color: 'var(--on-surface)', lineHeight: 1.55 },
  table: { display: 'grid', gridTemplateColumns: '92px minmax(0, 1fr)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', overflow: 'hidden' },
  tableHead: { padding: 9, background: 'var(--surface-container)', borderBottom: '1px solid var(--outline-variant)', color: 'var(--on-surface-variant)', fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em' },
  symbolCell: { padding: 10, borderTop: '1px solid var(--outline-variant)', fontSize: 'var(--text-sm)' },
  meaningCell: { minWidth: 0, display: 'grid', gap: 4, padding: 10, borderTop: '1px solid var(--outline-variant)', fontSize: 'var(--text-sm)', lineHeight: 1.45, overflowWrap: 'anywhere' },
  note: { color: 'var(--on-surface-variant)', lineHeight: 1.45 },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))', gap: 14, marginTop: 14 },
  list: { margin: 0, paddingLeft: 18, color: 'var(--on-surface)', lineHeight: 1.55 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  chip: { border: '1px solid var(--outline-variant)', borderRadius: 999, padding: '6px 9px', background: 'var(--surface-container)', fontSize: 'var(--text-xs)', fontWeight: 700 },
  sourceLine: { margin: '14px 0 0', fontSize: 'var(--text-xs)', color: 'var(--primary)', overflowWrap: 'anywhere' },
  sourceLink: { color: 'var(--primary)', textDecoration: 'underline', textUnderlineOffset: 3, overflowWrap: 'anywhere' },
  backTop: { display: 'inline-flex', maxWidth: 1120, margin: '14px calc((100% - min(1120px, 100%)) / 2) 0', padding: '8px 10px', border: '1px solid var(--outline-variant)', borderRadius: 999, color: 'var(--primary)', background: 'var(--surface)', textDecoration: 'none', fontSize: 'var(--text-xs)', fontWeight: 800 },
}
