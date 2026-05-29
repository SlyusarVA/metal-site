'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { markochnikCategories, metalGrades } from '@/data/markochnik'

type SearchItem = {
  kind: 'Марка' | 'Раздел' | 'Группа'
  title: string
  subtitle: string
  href: string
  searchText: string
}

function normalize(value: string) {
  return value.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim()
}

const searchItems: SearchItem[] = [
  ...markochnikCategories.flatMap(family => [
    {
      kind: 'Раздел' as const,
      title: family.title,
      subtitle: family.description,
      href: `/marki-metallov/${family.familySlug}`,
      searchText: [family.title, family.description, family.familySlug].join(' '),
    },
    ...family.categories.map(category => ({
      kind: 'Группа' as const,
      title: category.title,
      subtitle: category.description,
      href: `/marki-metallov/${family.familySlug}/${category.slug}`,
      searchText: [family.title, category.title, category.description, family.familySlug, category.slug].join(' '),
    })),
  ]),
  ...metalGrades.map(grade => ({
    kind: 'Марка' as const,
    title: grade.designation,
    subtitle: `${grade.title} · ${grade.categoryTitle}`,
    href: `/marki-metallov/${grade.familySlug}/${grade.categorySlug}/${grade.slug}`,
    searchText: [
      grade.designation,
      grade.title,
      grade.categoryTitle,
      grade.gradeClass.value,
      grade.application.summary,
      ...grade.application.examples,
      ...grade.application.equipment,
      ...grade.relatedGrades,
      ...grade.documents.map(source => `${source.document} ${source.section ?? ''} ${source.table ?? ''}`),
    ].join(' '),
  })),
]

export default function MarkochnikSearch() {
  const [query, setQuery] = useState('')
  const normalizedQuery = normalize(query)

  const results = useMemo(() => {
    if (!normalizedQuery) return []
    return searchItems
      .map(item => ({ item, index: normalize(item.searchText).indexOf(normalizedQuery) }))
      .filter(result => result.index !== -1)
      .sort((a, b) => a.index - b.index || a.item.title.localeCompare(b.item.title, 'ru'))
      .slice(0, 8)
      .map(result => result.item)
  }, [normalizedQuery])

  return (
    <div style={st.shell}>
      <div style={st.inner}>
        <label style={st.label} htmlFor="markochnik-search">Поиск по марочнику</label>
        <input
          id="markochnik-search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Марка, ГОСТ, применение, группа..."
          style={st.input}
        />
        {query && (
          <div style={st.results}>
            {results.length > 0 ? results.map(item => (
              <Link key={`${item.kind}-${item.href}`} href={item.href} style={st.result} onClick={() => setQuery('')}>
                <span style={st.kind}>{item.kind}</span>
                <span style={st.resultText}>
                  <strong>{item.title}</strong>
                  <small>{item.subtitle}</small>
                </span>
              </Link>
            )) : (
              <div style={st.empty}>Ничего не найдено</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const st: Record<string, React.CSSProperties> = {
  shell: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    padding: '10px 16px',
    background: 'color-mix(in srgb, var(--surface-variant) 92%, transparent)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--outline-variant)',
  },
  inner: { position: 'relative', maxWidth: 1120, margin: '0 auto' },
  label: { display: 'block', marginBottom: 5, fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '.06em' },
  input: { width: '100%', boxSizing: 'border-box', minHeight: 42, padding: '9px 12px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', color: 'var(--on-surface)', fontSize: 'var(--text-sm)', fontFamily: 'Manrope, sans-serif', outline: 'none' },
  results: { position: 'absolute', insetInline: 0, top: 'calc(100% + 6px)', display: 'grid', gap: 6, padding: 8, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', boxShadow: 'var(--shadow-2)' },
  result: { display: 'grid', gridTemplateColumns: '72px minmax(0, 1fr)', gap: 10, alignItems: 'center', padding: 9, borderRadius: 'var(--radius-sm)', color: 'inherit', textDecoration: 'none' },
  kind: { fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: 800 },
  resultText: { display: 'grid', gap: 2, minWidth: 0 },
  empty: { padding: 10, fontSize: 'var(--text-sm)', color: 'var(--on-surface-variant)' },
}
