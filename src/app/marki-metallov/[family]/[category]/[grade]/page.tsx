import Link from 'next/link'
import { getGradeBySlug, metalGrades } from '@/data/markochnik'
import CompositionChart from '@/components/markochnik/CompositionChart'

type Props = {
  params: { family: string; category: string; grade: string }
}

type SourceRef = { document: string; section?: string; table?: string; note?: string; url?: string; status: string }

const decoding = [
  ['Х', 'хром'],
  ['В', 'вольфрам'],
  ['С', 'кремний'],
  ['Г', 'марганец'],
  ['Ф', 'ванадий'],
]

const supplyForms = ['Прутки', 'Полосы', 'Мотки']
const quickActions = [
  ['Рассчитать вес', '/'],
  ['Сравнить марки', '/marki-metallov'],
]

export function generateStaticParams() {
  return metalGrades.map(grade => ({ family: grade.familySlug, category: grade.categorySlug, grade: grade.slug }))
}

export function generateMetadata({ params }: Props) {
  const grade = getGradeBySlug(params.family, params.category, params.grade)
  return {
    title: grade ? `${grade.title}: состав, хранение, применение` : 'Марка металла',
    description: grade ? `${grade.title}: нормативные поля, хранение, химический состав и применение.` : 'Карточка марки металла.',
  }
}

export default function GradePage({ params }: Props) {
  const grade = getGradeBySlug(params.family, params.category, params.grade)

  if (!grade) {
    return (
      <main style={st.page}>
        <section style={st.hero}><h1 style={st.h1}>Марка не найдена</h1></section>
      </main>
    )
  }

  return (
    <main id="top" style={st.page}>
      <nav style={st.breadcrumbs}>
        <Link href="/" style={st.crumb}>Калькулятор</Link><span>/</span>
        <Link href="/marki-metallov" style={st.crumb}>Марочник</Link><span>/</span>
        <Link href={`/marki-metallov/${grade.familySlug}`} style={st.crumb}>Стали</Link><span>/</span>
        <Link href={`/marki-metallov/${grade.familySlug}/${grade.categorySlug}`} style={st.crumb}>{grade.categoryTitle}</Link><span>/</span>
        <span>{grade.designation}</span>
      </nav>

      <section style={st.hero}>
        <h1 style={st.h1}>{grade.title}</h1>
        <p style={st.lead}>Химический состав, классификация и условия хранения приведены с указанием нормативных источников.</p>
      </section>

      <section style={st.topGrid}>
        <article style={st.card}>
          <h2 style={st.h2}>Нормативный блок</h2>
          <div style={st.tableLike}>
            <InfoRow label="Марка" value={grade.designation} />
            <InfoRow label="Класс" value={grade.gradeClass.value} source={grade.gradeClass.source} />
            <InfoRow label="Хранение" value={`${grade.storage.method.value} ${grade.storage.temperature.value} ${grade.storage.corrosionProtection.value}`} source={grade.storage.method.source} />
          </div>
        </article>

        <article style={st.card}>
          <h2 style={st.h2}>Применение</h2>
          <p style={st.text}>{grade.application.summary}</p>
          <div style={st.chips}>{grade.application.examples.map(item => <span key={item} style={st.chip}>{item}</span>)}</div>
          <h3 style={st.h3}>Оборудование</h3>
          <div style={st.chips}>{grade.application.equipment.map(item => <span key={item} style={st.chipAlt}>{item}</span>)}</div>
        </article>
      </section>

      <section style={st.featureGrid}>
        <article style={st.card}>
          <h2 style={st.h2}>Вид поставки</h2>
          <div style={st.chips}>{supplyForms.map(item => <span key={item} style={st.chip}>{item}</span>)}</div>
        </article>

        <article style={st.card}>
          <h2 style={st.h2}>Близкие марки</h2>
          <div style={st.chips}>{grade.relatedGrades.map(item => <span key={item} style={st.chip}>{item}</span>)}</div>
        </article>

        <article style={st.card}>
          <h2 style={st.h2}>Расшифровка</h2>
          <div style={st.decodeGrid}>{decoding.map(([symbol, meaning]) => <div key={symbol} style={st.decodeItem}><strong>{symbol}</strong><span>{meaning}</span></div>)}</div>
        </article>

        <article style={st.card}>
          <h2 style={st.h2}>Действия</h2>
          <div style={st.actionRow}>{quickActions.map(([label, href]) => <Link key={label} href={href} style={st.action}>{label}</Link>)}</div>
        </article>
      </section>

      <section style={st.compositionGrid}>
        <article style={st.card}>
          <h2 style={st.h2}>Химический состав</h2>
          <p style={st.sourceLine}><SourceLabel source={grade.composition[0]?.source} /></p>
          <div style={st.compTableWrap}>
            <div style={st.compTable}>
              <div style={st.compHead}>Элемент</div>
              <div style={st.compHead}>Содержание, %</div>
              {grade.composition.map(item => (
                <ReactFragment key={item.element}>
                  <div style={st.compCell}><strong>{item.element}</strong> <span style={st.muted}>{item.label}</span></div>
                  <div style={st.compCell}>{item.valueText}</div>
                </ReactFragment>
              ))}
            </div>
          </div>
        </article>
        <CompositionChart items={grade.composition} withoutFe />
      </section>

      <section style={st.cardWide}>
        <h2 style={st.h2}>Источники данных</h2>
        <div style={st.sources}>
          {grade.documents.map((source, index) => (
            <div key={`${source.document}-${index}`} style={st.sourceItem}>
              <SourceLabel source={source} strong />
              {source.section && <span>{source.section}</span>}
              {source.table && <span>{source.table}</span>}
            </div>
          ))}
        </div>
      </section>

      <a href="#top" style={st.backTop}>Наверх</a>
    </main>
  )
}

function ReactFragment({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function sourceText(source?: SourceRef) {
  if (!source) return 'Источник не указан'
  return [source.document, source.section, source.table].filter(Boolean).join(', ')
}

function SourceLabel({ source, strong }: { source?: SourceRef; strong?: boolean }) {
  const text = sourceText(source)
  const content = strong ? <strong>{text}</strong> : <span>{text}</span>
  if (!source || !source.url) return content
  return <a href={source.url} style={st.sourceLink}>{content}</a>
}

function InfoRow({ label, value, source }: { label: string; value: string; source?: SourceRef }) {
  return (
    <div style={st.infoRow}>
      <div style={st.infoLabel}>{label}</div>
      <div style={st.infoValue}>{value}</div>
      {source && <div style={st.infoSource}><SourceLabel source={source} /></div>}
    </div>
  )
}

const st: Record<string, React.CSSProperties> = {
  page: { minHeight: '100dvh', padding: '16px 10px 40px', background: 'var(--surface-variant)', color: 'var(--on-surface)', overflowX: 'hidden' },
  breadcrumbs: { maxWidth: 1120, margin: '0 auto 10px', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: 'var(--text-xs)', color: 'var(--on-surface-variant)' },
  crumb: { color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 },
  hero: { maxWidth: 1120, margin: '0 auto 12px', padding: 16, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', boxShadow: 'var(--shadow-1)' },
  h1: { margin: '8px 0', fontSize: 'clamp(24px, 7vw, 44px)', lineHeight: 1.08 },
  h2: { margin: '0 0 12px', fontSize: 'var(--text-xl)', lineHeight: 1.2 },
  h3: { margin: '14px 0 8px', fontSize: 'var(--text-md)' },
  lead: { margin: 0, maxWidth: 820, color: 'var(--on-surface-variant)', lineHeight: 1.65 },
  topGrid: { maxWidth: 1120, margin: '0 auto 12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: 12 },
  featureGrid: { maxWidth: 1120, margin: '0 auto 12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))', gap: 12 },
  compositionGrid: { maxWidth: 1120, margin: '0 auto 12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: 12 },
  card: { minWidth: 0, padding: 14, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', boxShadow: 'var(--shadow-1)', overflow: 'hidden' },
  cardWide: { maxWidth: 1120, minWidth: 0, margin: '0 auto 12px', padding: 14, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', overflow: 'hidden' },
  tableLike: { display: 'grid', gap: 0 },
  infoRow: { display: 'grid', gridTemplateColumns: 'minmax(0, 140px) minmax(0, 1fr)', gap: '4px 10px', padding: '10px 0', borderBottom: '1px solid var(--outline-variant)' },
  infoLabel: { minWidth: 0, fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '.04em', overflowWrap: 'anywhere' },
  infoValue: { minWidth: 0, fontSize: 'var(--text-sm)', color: 'var(--on-surface)', lineHeight: 1.45, overflowWrap: 'anywhere' },
  infoSource: { minWidth: 0, gridColumn: '2', fontSize: 'var(--text-xs)', color: 'var(--primary)', overflowWrap: 'anywhere' },
  sourceLink: { color: 'var(--primary)', textDecoration: 'underline', textUnderlineOffset: 3, overflowWrap: 'anywhere' },
  sourceLine: { margin: '0 0 10px', fontSize: 'var(--text-xs)', color: 'var(--primary)', overflowWrap: 'anywhere' },
  text: { margin: 0, color: 'var(--on-surface)', lineHeight: 1.55 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 10 },
  chip: { border: '1px solid var(--outline-variant)', borderRadius: 999, padding: '6px 9px', background: 'var(--surface-container)', fontSize: 'var(--text-xs)', fontWeight: 700 },
  chipAlt: { border: '1px solid var(--info-border)', borderRadius: 999, padding: '6px 9px', background: 'var(--info-container)', color: 'var(--info)', fontSize: 'var(--text-xs)', fontWeight: 700 },
  decodeGrid: { display: 'grid', gap: 8 },
  decodeItem: { display: 'grid', gridTemplateColumns: '32px 1fr', gap: 8, fontSize: 'var(--text-sm)' },
  actionRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  action: { display: 'inline-flex', padding: '8px 10px', border: '1px solid var(--outline-variant)', borderRadius: 999, color: 'var(--primary)', textDecoration: 'none', fontSize: 'var(--text-xs)', fontWeight: 800 },
  backTop: { display: 'inline-flex', maxWidth: 1120, padding: '8px 10px', border: '1px solid var(--outline-variant)', borderRadius: 999, color: 'var(--primary)', textDecoration: 'none', fontSize: 'var(--text-xs)', fontWeight: 800 },
  compTableWrap: { width: '100%', overflowX: 'auto' },
  compTable: { minWidth: 330, display: 'grid', gridTemplateColumns: 'minmax(140px, 1fr) 130px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', overflow: 'hidden' },
  compHead: { padding: 9, background: 'var(--surface-container)', fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--on-surface-variant)', borderBottom: '1px solid var(--outline-variant)' },
  compCell: { minWidth: 0, padding: 9, borderTop: '1px solid var(--outline-variant)', fontSize: 'var(--text-xs)', lineHeight: 1.4, overflowWrap: 'anywhere' },
  muted: { color: 'var(--on-surface-variant)', marginLeft: 4 },
  sources: { display: 'grid', gap: 8 },
  sourceItem: { minWidth: 0, display: 'grid', gap: 4, padding: 10, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', fontSize: 'var(--text-xs)', overflowWrap: 'anywhere' },
}
