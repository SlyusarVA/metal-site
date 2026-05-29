import Link from 'next/link'
import { getGradeBySlug, metalGrades } from '@/data/markochnik'
import CompositionChart from '@/components/markochnik/CompositionChart'
import TermHelp from '@/components/markochnik/TermHelp'

type Props = {
  params: { family: string; category: string; grade: string }
}

export function generateStaticParams() {
  return metalGrades.map(grade => ({ family: grade.familySlug, category: grade.categorySlug, grade: grade.slug }))
}

export function generateMetadata({ params }: Props) {
  const grade = getGradeBySlug(params.family, params.category, params.grade)
  return {
    title: grade ? `${grade.title}: состав, хранение, применение` : 'Марка металла',
    description: grade ? `${grade.title}: нормативные поля, хранение, температурный режим, химический состав и справочное применение.` : 'Карточка марки металла.',
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

  const verified = grade.dataStatus === 'verified'

  return (
    <main style={st.page}>
      <nav style={st.breadcrumbs}>
        <Link href="/" style={st.crumb}>Калькулятор</Link><span>/</span>
        <Link href="/marki-metallov" style={st.crumb}>Марочник</Link><span>/</span>
        <Link href={`/marki-metallov/${grade.familySlug}/${grade.categorySlug}`} style={st.crumb}>{grade.categoryTitle}</Link><span>/</span>
        <span>{grade.designation}</span>
      </nav>

      <section style={st.hero}>
        <div style={st.kicker}>{grade.categoryTitle}</div>
        <h1 style={st.h1}>{grade.title}</h1>
        <p style={st.lead}>Карточка ХВСГФ приведена в рабочее состояние: химический состав и классификация сверены по ГОСТ 5950-2000, условия хранения — по ГОСТ 7566-2018. Справочное применение отделено от нормативных данных.</p>
        <div style={st.statusPill}>{verified ? 'Данные сверены' : 'Частично проверено'}</div>
      </section>

      <section style={st.topGrid}>
        <article style={st.card}>
          <h2 style={st.h2}>Нормативный блок</h2>
          <div style={st.tableLike}>
            <InfoRow label="Марка" value={grade.designation} />
            <InfoRow label="Класс" value={grade.gradeClass.value} help={<TermHelp termId="toolSteel" />} source={formatSource(grade.gradeClass.source)} />
            <InfoRow label="Способ хранения" value={grade.storage.method.value} help={<TermHelp termId="storageMethod" />} source={formatSource(grade.storage.method.source)} />
            <InfoRow label="Температурный режим" value={grade.storage.temperature.value} help={<TermHelp termId="temperatureMode" />} source={formatSource(grade.storage.temperature.source)} />
            <InfoRow label="Защита от коррозии" value={grade.storage.corrosionProtection.value} source={formatSource(grade.storage.corrosionProtection.source)} />
          </div>
          <p style={verified ? st.verifiedNote : st.warning}>{verified ? 'Поля нормативного блока заполнены по указанным источникам. Если ГОСТ не задаёт отдельный температурный диапазон для марки, это отражено в карточке прямо.' : 'Неподтверждённые значения не выводятся как нормативные. До проверки ГОСТ/НД поле остаётся в статусе «требует проверки».'}</p>
        </article>

        <article style={st.card}>
          <h2 style={st.h2}>Справочное применение <TermHelp termId="referenceApplication" /></h2>
          <p style={st.text}>{grade.application.summary}</p>
          <div style={st.chips}>{grade.application.examples.map(item => <span key={item} style={st.chip}>{item}</span>)}</div>
          <h3 style={st.h3}>Оборудование</h3>
          <div style={st.chips}>{grade.application.equipment.map(item => <span key={item} style={st.chipAlt}>{item}</span>)}</div>
          <p style={st.note}>{grade.application.note}</p>
        </article>
      </section>

      <section style={st.compositionGrid}>
        <article style={st.card}>
          <h2 style={st.h2}>Химический состав</h2>
          <div style={st.compTable}>
            <div style={st.compHead}>Элемент</div>
            <div style={st.compHead}>Содержание</div>
            <div style={st.compHead}>Источник</div>
            {grade.composition.map(item => (
              <ReactFragment key={item.element}>
                <div style={st.compCell}><strong>{item.element}</strong> <span style={st.muted}>{item.label}</span></div>
                <div style={st.compCell}>{item.valueText}</div>
                <div style={st.compCell}>{formatSource(item.source)}</div>
              </ReactFragment>
            ))}
          </div>
        </article>
        <CompositionChart items={grade.composition} withoutFe />
      </section>

      <section style={st.cardWide}>
        <h2 style={st.h2}>Источники данных</h2>
        <div style={st.sources}>
          {grade.documents.map((source, index) => (
            <div key={`${source.document}-${index}`} style={st.sourceItem}>
              <strong>{source.document}</strong>
              <span>Статус: {statusLabel(source.status)}</span>
              {source.section && <span>{source.section}</span>}
              {source.table && <span>{source.table}</span>}
              {source.note && <span>{source.note}</span>}
            </div>
          ))}
        </div>
        <p style={st.note}>Справочные блоки о применении и оборудовании не являются нормативным требованием и не заменяют ГОСТ, ТУ, КД или технологический процесс.</p>
      </section>
    </main>
  )
}

function ReactFragment({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function statusLabel(status: string) {
  if (status === 'verified') return 'сверено'
  if (status === 'needs_check') return 'требует проверки'
  if (status === 'not_specified') return 'не нормируется / не указано'
  return status
}

function formatSource(source?: { document: string; section?: string; table?: string; status: string }) {
  if (!source) return 'Источник не указан'
  const parts = [source.document, source.section, source.table].filter(Boolean)
  return parts.join(', ')
}

function InfoRow({ label, value, source, help }: { label: string; value: string; source?: string; help?: React.ReactNode }) {
  return (
    <div style={st.infoRow}>
      <div style={st.infoLabel}>{label} {help}</div>
      <div style={st.infoValue}>{value}</div>
      {source && <div style={st.infoSource}>{source}</div>}
    </div>
  )
}

const st: Record<string, React.CSSProperties> = {
  page: { minHeight: '100dvh', padding: '24px 16px 48px', background: 'var(--surface-variant)', color: 'var(--on-surface)' },
  breadcrumbs: { maxWidth: 1120, margin: '0 auto 12px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 'var(--text-xs)', color: 'var(--on-surface-variant)' },
  crumb: { color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 },
  hero: { maxWidth: 1120, margin: '0 auto 14px', padding: 22, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', boxShadow: 'var(--shadow-1)' },
  kicker: { fontSize: 'var(--text-xs)', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--primary)' },
  statusPill: { display: 'inline-flex', marginTop: 14, padding: '6px 10px', borderRadius: 999, background: 'var(--success-container)', border: '1px solid var(--success-border)', color: 'var(--success)', fontSize: 'var(--text-xs)', fontWeight: 800 },
  h1: { margin: '8px 0', fontSize: 'clamp(28px, 5vw, 44px)', lineHeight: 1.08 },
  h2: { margin: '0 0 12px', fontSize: 'var(--text-xl)', lineHeight: 1.2 },
  h3: { margin: '14px 0 8px', fontSize: 'var(--text-md)' },
  lead: { margin: 0, maxWidth: 820, color: 'var(--on-surface-variant)', lineHeight: 1.65 },
  topGrid: { maxWidth: 1120, margin: '0 auto 14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 },
  compositionGrid: { maxWidth: 1120, margin: '0 auto 14px', display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(300px, .75fr)', gap: 14 },
  card: { padding: 18, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', boxShadow: 'var(--shadow-1)' },
  cardWide: { maxWidth: 1120, margin: '0 auto', padding: 18, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' },
  tableLike: { display: 'grid', gap: 8 },
  infoRow: { display: 'grid', gridTemplateColumns: '180px minmax(0, 1fr)', gap: '4px 12px', padding: '10px 0', borderBottom: '1px solid var(--outline-variant)' },
  infoLabel: { fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '.06em' },
  infoValue: { fontSize: 'var(--text-sm)', color: 'var(--on-surface)', lineHeight: 1.45 },
  infoSource: { gridColumn: '2', fontSize: 'var(--text-xs)', color: 'var(--primary)' },
  warning: { margin: '12px 0 0', padding: 10, border: '1px solid var(--warning-border)', borderRadius: 'var(--radius-md)', background: 'var(--warning-container)', color: 'var(--warning)', fontSize: 'var(--text-xs)', lineHeight: 1.5 },
  verifiedNote: { margin: '12px 0 0', padding: 10, border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', background: 'var(--success-container)', color: 'var(--success)', fontSize: 'var(--text-xs)', lineHeight: 1.5 },
  text: { margin: 0, color: 'var(--on-surface)', lineHeight: 1.55 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 10 },
  chip: { border: '1px solid var(--outline-variant)', borderRadius: 999, padding: '6px 9px', background: 'var(--surface-container)', fontSize: 'var(--text-xs)', fontWeight: 700 },
  chipAlt: { border: '1px solid var(--info-border)', borderRadius: 999, padding: '6px 9px', background: 'var(--info-container)', color: 'var(--info)', fontSize: 'var(--text-xs)', fontWeight: 700 },
  note: { margin: '12px 0 0', color: 'var(--on-surface-variant)', fontSize: 'var(--text-xs)', lineHeight: 1.55 },
  compTable: { display: 'grid', gridTemplateColumns: '150px 130px minmax(160px, 1fr)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', overflow: 'hidden' },
  compHead: { padding: 9, background: 'var(--surface-container)', fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--on-surface-variant)', borderBottom: '1px solid var(--outline-variant)' },
  compCell: { padding: 9, borderTop: '1px solid var(--outline-variant)', fontSize: 'var(--text-xs)', lineHeight: 1.4 },
  muted: { color: 'var(--on-surface-variant)', marginLeft: 4 },
  sources: { display: 'grid', gap: 8 },
  sourceItem: { display: 'grid', gap: 4, padding: 10, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', fontSize: 'var(--text-xs)' },
}
