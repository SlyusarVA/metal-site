import Link from 'next/link'
import { designationTerms, markochnikCategories, metalGrades } from '@/data/markochnik'

export const metadata = {
  title: 'Марочник металлов и сплавов',
  description: 'Марочник металлов: нормативные данные, хранение, температурный режим, химический состав и справочное применение.',
}

const designationTermsByCategory: Record<string, string[]> = {
  konstrukcionnye: ['steel-deoxidation-gost-380', 'b-2a', 'spring-wire-gost-9389'],
  latuni: ['dprnm', 'latun-rods-gost-2060'],
  med: ['copper-flat-gost-1173'],
  'alyuminievye-splavy': ['aluminum-temper'],
}

const designationTermsBySlug = new Map(designationTerms.map(term => [term.slug, term]))

export default function MarkiMetallovPage() {
  const catalogSections = markochnikCategories
    .map(family => ({
      ...family,
      categories: family.categories
        .map(category => ({
          ...category,
          grades: metalGrades.filter(grade => grade.familySlug === family.familySlug && grade.categorySlug === category.slug),
        }))
        .filter(category => category.grades.length > 0),
    }))
    .filter(family => family.categories.length > 0)

  return (
    <main style={st.page}>
      <section style={st.hero}>
        <div style={st.kicker}>Марочник</div>
        <h1 style={st.h1}>Марочник металлов и сплавов</h1>
        <p style={st.lead}>Раздел собран по локальной подборке ГОСТов: нормативные значения публикуются с источником, а применение и оборудование показываются как справочная информация.</p>
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
              {family.categories.map(category => {
                const terms = getDesignationTermsForCategory(category.slug)
                return (
                  <div key={category.slug} style={st.link}>
                    <Link href={`/marki-metallov/${family.familySlug}/${category.slug}`} style={st.categoryNavLink}>
                      <span style={st.linkTitle}>{category.title}</span>
                      <span style={st.linkText}>{category.description}</span>
                    </Link>
                    {terms.length > 0 && (
                      <div style={st.termGroup}>
                        <span style={st.termLabel}>Расшифровки обозначений</span>
                        <div style={st.termLinks}>
                          {terms.map(term => (
                            <Link key={term.slug} href={`/marki-metallov/rasshifrovki#${term.slug}`} style={st.termLink}>
                              {term.code}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </article>
        ))}
      </section>

      <section style={st.section}>
        <div style={st.sectionHead}>
          <div>
            <h2 style={st.h2}>Карточки марок</h2>
            <p style={st.sectionText}>Условная каталогизация по семействам и типам сплавов. Внутри каждой группы марки идут по обозначению.</p>
          </div>
          <span style={st.countBadge}>{metalGrades.length} марок</span>
        </div>

        <div style={st.catalogList}>
          {catalogSections.map(family => (
            <article key={family.familySlug} style={st.familyBlock}>
              <div style={st.familyHead}>
                <div>
                  <h3 style={st.h3}>{family.title}</h3>
                  <p style={st.familyText}>{family.description}</p>
                </div>
                <span style={st.countBadge}>{family.categories.reduce((sum, category) => sum + category.grades.length, 0)}</span>
              </div>

              <div style={st.categoryList}>
                {family.categories.map(category => (
                  <section key={category.slug} style={st.categoryBlock}>
                    <div style={st.categoryHead}>
                      <div>
                        <Link href={`/marki-metallov/${family.familySlug}/${category.slug}`} style={st.categoryTitle}>
                          {category.title}
                        </Link>
                        <p style={st.categoryText}>{category.description}</p>
                      </div>
                      <span style={st.categoryCount}>{category.grades.length}</span>
                    </div>

                    <div style={st.gradeList}>
                      {category.grades.map(grade => (
                        <Link
                          key={`${grade.familySlug}-${grade.categorySlug}-${grade.slug}`}
                          href={`/marki-metallov/${grade.familySlug}/${grade.categorySlug}/${grade.slug}`}
                          style={st.gradeCard}
                        >
                          <strong style={st.gradeTitle}>{grade.designation}</strong>
                          <span style={st.gradeText}>{grade.gradeClass.value}</span>
                          <small style={st.status}>Статус: {statusLabel(grade.dataStatus)}</small>
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function statusLabel(status: string) {
  if (status === 'partial') return 'частично проверено'
  if (status === 'verified') return 'проверено'
  if (status === 'draft') return 'черновик'
  return status
}

function getDesignationTermsForCategory(categorySlug: string) {
  return (designationTermsByCategory[categorySlug] ?? [])
    .map(slug => designationTermsBySlug.get(slug))
    .filter((term): term is NonNullable<typeof term> => Boolean(term))
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
  link: { display: 'grid', gap: 10, padding: 12, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', color: 'inherit' },
  categoryNavLink: { display: 'grid', gap: 3, minWidth: 0, color: 'inherit', textDecoration: 'none' },
  linkTitle: { fontWeight: 800, color: 'var(--primary)' },
  linkText: { fontSize: 'var(--text-xs)', color: 'var(--on-surface-variant)' },
  termGroup: { display: 'grid', gap: 6, paddingTop: 8, borderTop: '1px solid var(--outline-variant)' },
  termLabel: { color: 'var(--on-surface-variant)', fontSize: 'var(--text-xs)', fontWeight: 800 },
  termLinks: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  termLink: { border: '1px solid var(--outline-variant)', borderRadius: 999, padding: '4px 8px', color: 'var(--primary)', background: 'var(--surface)', textDecoration: 'none', fontSize: 'var(--text-xs)', fontWeight: 800, lineHeight: 1.2 },
  section: { maxWidth: 1120, margin: '14px auto 0', padding: 18, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' },
  sectionHead: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  sectionText: { maxWidth: 720, margin: '6px 0 0', color: 'var(--on-surface-variant)', lineHeight: 1.55, fontSize: 'var(--text-sm)' },
  countBadge: { alignSelf: 'flex-start', border: '1px solid var(--outline-variant)', borderRadius: 999, padding: '5px 9px', background: 'var(--surface-container)', color: 'var(--on-surface)', fontSize: 'var(--text-xs)', fontWeight: 800, whiteSpace: 'nowrap' },
  catalogList: { display: 'grid', gap: 18, marginTop: 16 },
  familyBlock: { display: 'grid', gap: 12, paddingTop: 16, borderTop: '1px solid var(--outline-variant)' },
  familyHead: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  h3: { margin: 0, fontSize: 'var(--text-lg)', lineHeight: 1.25 },
  familyText: { margin: '5px 0 0', color: 'var(--on-surface-variant)', lineHeight: 1.5, fontSize: 'var(--text-sm)' },
  categoryList: { display: 'grid', gap: 14 },
  categoryBlock: { display: 'grid', gap: 10 },
  categoryHead: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 10, alignItems: 'start', padding: 12, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)' },
  categoryTitle: { color: 'var(--primary)', textDecoration: 'none', fontWeight: 800, fontSize: 'var(--text-md)' },
  categoryText: { margin: '4px 0 0', color: 'var(--on-surface-variant)', lineHeight: 1.45, fontSize: 'var(--text-xs)' },
  categoryCount: { minWidth: 28, padding: '4px 7px', border: '1px solid var(--outline-variant)', borderRadius: 999, textAlign: 'center', color: 'var(--on-surface)', fontSize: 'var(--text-xs)', fontWeight: 800 },
  gradeList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 },
  gradeCard: { display: 'grid', gap: 5, minHeight: 118, padding: 12, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', background: 'var(--surface-container)', color: 'inherit', textDecoration: 'none' },
  gradeTitle: { color: 'var(--on-surface)', fontSize: 'var(--text-md)' },
  gradeText: { color: 'var(--on-surface)', fontSize: 'var(--text-sm)', lineHeight: 1.35 },
  status: { color: 'var(--on-surface-variant)', fontSize: 'var(--text-xs)', lineHeight: 1.3 },
}
