import Link from 'next/link'
import { markochnikCategories } from '@/data/markochnik'

type Props = {
  params: { family: string }
}

export function generateStaticParams() {
  return markochnikCategories.map(family => ({ family: family.familySlug }))
}

export function generateMetadata({ params }: Props) {
  const family = markochnikCategories.find(item => item.familySlug === params.family)
  return {
    title: family ? `${family.title} — марочник металлов` : 'Марочник металлов',
    description: family?.description ?? 'Раздел марочника металлов и сплавов.',
  }
}

export default function MarkochnikFamilyPage({ params }: Props) {
  const family = markochnikCategories.find(item => item.familySlug === params.family)

  return (
    <main style={st.page}>
      <nav style={st.breadcrumbs}>
        <Link href="/" style={st.crumb}>Калькулятор</Link>
        <span>/</span>
        <Link href="/marki-metallov" style={st.crumb}>Марочник</Link>
        <span>/</span>
        <span>{family?.title ?? 'Раздел'}</span>
      </nav>

      <section style={st.hero}>
        <div style={st.kicker}>Марочник</div>
        <h1 style={st.h1}>{family?.title ?? 'Раздел марочника'}</h1>
        <p style={st.lead}>{family?.description ?? 'Раздел марочника с группами материалов.'}</p>
      </section>

      <section style={st.grid}>
        {(family?.categories ?? []).map(category => (
          <Link key={category.slug} href={`/marki-metallov/${params.family}/${category.slug}`} style={st.card}>
            <strong style={st.cardTitle}>{category.title}</strong>
            <span style={st.cardText}>{category.description}</span>
          </Link>
        ))}
      </section>
    </main>
  )
}

const st: Record<string, React.CSSProperties> = {
  page: { minHeight: '100dvh', padding: '24px 16px 48px', background: 'var(--surface-variant)', color: 'var(--on-surface)' },
  breadcrumbs: { maxWidth: 1120, margin: '0 auto 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-xs)', color: 'var(--on-surface-variant)' },
  crumb: { color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 },
  hero: { maxWidth: 1120, margin: '0 auto 14px', padding: 22, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' },
  kicker: { fontSize: 'var(--text-xs)', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--primary)' },
  h1: { margin: '8px 0', fontSize: 'clamp(26px, 4vw, 40px)', lineHeight: 1.12 },
  lead: { margin: 0, maxWidth: 760, color: 'var(--on-surface-variant)', lineHeight: 1.6 },
  grid: { maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 },
  card: { display: 'grid', gap: 8, padding: 16, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', color: 'inherit', textDecoration: 'none', boxShadow: 'var(--shadow-1)' },
  cardTitle: { color: 'var(--primary)', fontSize: 'var(--text-lg)' },
  cardText: { color: 'var(--on-surface-variant)', fontSize: 'var(--text-sm)', lineHeight: 1.55 },
}
