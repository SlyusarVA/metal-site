import Link from 'next/link'
import { markochnikCategories, metalGrades } from '@/data/markochnik'

export const metadata = {
  title: 'Марочник металлов и сплавов',
  description: 'Марочник металлов: нормативные данные, хранение, температурный режим, химический состав и справочное применение.',
}

export default function MarkiMetallovPage() {
  return (
    <main style={st.page}>
      <section style={st.hero}>
        <div style={st.kicker}>Марочник</div>
        <h1 style={st.h1}>Марочник металлов и сплавов</h1>
        <p style={st.lead}>Раздел строится с жёстким разделением: нормативные значения публикуются только с источником, а применение и оборудование показываются как справочная информация.</p>
        <div style={st.badges}>
          <span style={st.badge}>ГОСТ / НД</span>
          <span style={st.badge}>Хранение</span>
          <span style={st.badge}>Температурный режим</span>
          <span style={st.badge}>Диаграмма состава</span>
        </div>
      </section>

      <section style={st.grid}>
        {markochnikCategories.map(family => (
          <article key={family.familySlug} style={st.card}>
            <h2 style={st.h2}>{family.title}</h2>
            <p style={st.text}>{family.description}</p>
            <div style={st.links}>
              {family.categories.map(category => (
                <Link key={category.slug} href={`/marki-metallov/${family.familySlug}/${category.slug}`} style={st.link}>
                  <span style={st.linkTitle}>{category.title}</span>
                  <span style={st.linkText}>{category.description}</span>
                </Link>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section style={st.section}>
        <h2 style={st.h2}>Первые карточки</h2>
        <div style={st.gradeList}>
          {metalGrades.map(grade => (
            <Link key={grade.slug} href={`/marki-metallov/${grade.familySlug}/${grade.categorySlug}/${grade.slug}`} style={st.gradeCard}>
              <strong>{grade.designation}</strong>
              <span>{grade.categoryTitle}</span>
              <small>Статус: {grade.dataStatus === 'partial' ? 'частично проверено' : grade.dataStatus}</small>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

const st: Record<string, React.CSSProperties> = {
  page: { minHeight: '100dvh', padding: '28px 16px 48px', background: 'var(--surface-variant)', color: 'var(--on-surface)' },
  hero: { maxWidth: 1120, margin: '0 auto 18px', padding: 24, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', boxShadow: 'var(--shadow-1)' },
  kicker: { fontSize: 'var(--text-xs)', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--primary)' },
  h1: { margin: '8px 0', fontSize: 'clamp(28px, 5vw, 44px)', lineHeight: 1.08 },
  h2: { margin: 0, fontSize: 'var(--text-xl)', lineHeight: 1.2 },
  lead: { maxWidth: 760, margin: 0, fontSize: 'var(--text-md)', lineHeight: 1.65, color: 'var(--on-surface-variant)' },
  badges: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 },
  badge: { border: '1px solid var(--outline-variant)', borderRadius: 999, padding: '6px 10px', background: 'var(--surface-container)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--on-surface)' },
  grid: { maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 },
  card: { padding: 18, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' },
  text: { color: 'var(--on-surface-variant)', lineHeight: 1.55, fontSize: 'var(--text-sm)' },
  links: { display: 'grid', gap: 8, marginTop: 12 },
  link: { display: 'grid', gap: 3, padding: 12, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', color: 'inherit', textDecoration: 'none' },
  linkTitle: { fontWeight: 800, color: 'var(--primary)' },
  linkText: { fontSize: 'var(--text-xs)', color: 'var(--on-surface-variant)' },
  section: { maxWidth: 1120, margin: '14px auto 0', padding: 18, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' },
  gradeList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 12 },
  gradeCard: { display: 'grid', gap: 4, padding: 12, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', color: 'inherit', textDecoration: 'none' },
}
