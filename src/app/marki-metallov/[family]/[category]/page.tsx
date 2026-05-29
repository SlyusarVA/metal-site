import Link from 'next/link'
import { getCategoryGrades, markochnikCategories } from '@/data/markochnik'

type Props = {
  params: { family: string; category: string }
}

export function generateStaticParams() {
  return markochnikCategories.flatMap(family =>
    family.categories.map(category => ({ family: family.familySlug, category: category.slug }))
  )
}

export function generateMetadata({ params }: Props) {
  const family = markochnikCategories.find(item => item.familySlug === params.family)
  const category = family?.categories.find(item => item.slug === params.category)
  return {
    title: category ? `${category.title} — марочник металлов` : 'Марочник металлов',
    description: category?.description ?? 'Категория марочника металлов и сплавов.',
  }
}

export default function MarkochnikCategoryPage({ params }: Props) {
  const family = markochnikCategories.find(item => item.familySlug === params.family)
  const category = family?.categories.find(item => item.slug === params.category)
  const grades = getCategoryGrades(params.family, params.category)

  return (
    <main style={st.page}>
      <nav style={st.breadcrumbs}>
        <Link href="/" style={st.crumb}>Калькулятор</Link>
        <span>/</span>
        <Link href="/marki-metallov" style={st.crumb}>Марочник</Link>
        <span>/</span>
        <span>{category?.title ?? 'Категория'}</span>
      </nav>

      <section style={st.hero}>
        <div style={st.kicker}>{family?.title ?? 'Материалы'}</div>
        <h1 style={st.h1}>{category?.title ?? 'Категория марочника'}</h1>
        <p style={st.lead}>{category?.description ?? 'Раздел марочника с карточками марок.'}</p>
      </section>

      <section style={st.section}>
        <h2 style={st.h2}>Марки</h2>
        {grades.length > 0 ? (
          <div style={st.grid}>
            {grades.map(grade => (
              <Link key={grade.slug} href={`/marki-metallov/${grade.familySlug}/${grade.categorySlug}/${grade.slug}`} style={st.gradeCard}>
                <strong style={st.gradeTitle}>{grade.designation}</strong>
                <span style={st.gradeText}>{grade.gradeClass.value}</span>
                <span style={st.status}>Статус данных: {grade.dataStatus === 'partial' ? 'частично проверено' : grade.dataStatus}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p style={st.empty}>Карточки для этой категории ещё не опубликованы.</p>
        )}
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
  h2: { margin: 0, fontSize: 'var(--text-xl)' },
  lead: { margin: 0, maxWidth: 760, color: 'var(--on-surface-variant)', lineHeight: 1.6 },
  section: { maxWidth: 1120, margin: '0 auto', padding: 18, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' },
  grid: { marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 },
  gradeCard: { display: 'grid', gap: 5, padding: 14, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', color: 'inherit', textDecoration: 'none' },
  gradeTitle: { fontSize: 'var(--text-lg)', color: 'var(--primary)' },
  gradeText: { color: 'var(--on-surface)', fontSize: 'var(--text-sm)' },
  status: { color: 'var(--on-surface-variant)', fontSize: 'var(--text-xs)' },
  empty: { color: 'var(--on-surface-variant)' },
}
