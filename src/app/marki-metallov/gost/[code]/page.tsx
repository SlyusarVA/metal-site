import Link from 'next/link'
import { notFound } from 'next/navigation'
import { findGostReference, getAllGostCodes } from '@/data/gost'

export function generateStaticParams() {
  return getAllGostCodes().map(code => ({ code }))
}

export function generateMetadata({ params }: { params: { code: string } }) {
  const gost = findGostReference(decodeURIComponent(params.code))
  return { title: gost ? `${gost.code} — ${gost.title} | Марочник` : 'ГОСТ не найден' }
}

export default function MarkochnikGostPage({ params }: { params: { code: string } }) {
  const gost = findGostReference(decodeURIComponent(params.code))
  if (!gost) notFound()
  return <main style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px 60px' }}>
    <nav aria-label="Навигация по марочнику" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 14, marginBottom: 24 }}>
      <Link href="/" style={link}>Калькулятор</Link><span>/</span>
      <Link href="/marki-metallov" style={link}>Марочник</Link><span>/</span><span>{gost.code}</span>
    </nav>
    <div style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 700 }}>{gost.code}</div>
    <h1 style={{ fontSize: 24, lineHeight: 1.35, margin: '8px 0 24px' }}>{gost.title}</h1>
    <Section title="Область применения"><p>{gost.scope}</p></Section>
    <Section title="Ключевые параметры"><ul>{gost.keyParams.map(item => <li key={item}>{item}</li>)}</ul></Section>
    <Section title="Допуски"><ul>{gost.tolerances.map(item => <li key={item}>{item}</li>)}</ul></Section>
    {gost.critical.length > 0 && <Section title="Важно учитывать"><ul>{gost.critical.map(item => <li key={item}>{item}</li>)}</ul></Section>}
    <Section title="Маркировка"><p>{gost.marking}</p></Section>
    <a href={gost.fullTextUrl} target="_blank" rel="noopener noreferrer" style={{ ...link, display: 'inline-flex', padding: '12px 0', marginTop: 12 }}>Полный текст ГОСТа ↗</a>
  </main>
}

const link: React.CSSProperties = { color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section style={{ marginBottom: 14, padding: '16px 20px', background: 'var(--surface)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', lineHeight: 1.65, fontSize: 14 }}>
    <h2 style={{ fontSize: 16, margin: '0 0 8px' }}>{title}</h2>{children}
  </section>
}
