'use client'

import { useParams, useRouter } from 'next/navigation'
import { findGostReference } from '@/data/gost'
import Link from 'next/link'

export default function GostPage() {
  const params = useParams()
  const router = useRouter()
  const code = decodeURIComponent(params.code as string)
  const ref = findGostReference(code)

  if (!ref) {
    return (
      <div style={{ maxWidth: 680, margin: '40px auto', padding: '0 20px' }}>
        <p style={{ color: 'var(--on-surface-variant)' }}>ГОСТ не найден: {code}</p>
        <Link href="/" style={{ color: 'var(--primary)', fontSize: 14 }}>← Назад</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 20px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontSize: 14, fontFamily: 'Manrope, sans-serif', padding: 0 }}
        >
          ← Назад
        </button>
        <span style={{ color: 'var(--outline)', fontSize: 14 }}>/</span>
        <span style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>{ref.code}</span>
      </div>

      <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 8 }}>
        {ref.title}
      </h1>

      <Section title="Область применения">
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--on-surface-variant)' }}>{ref.scope}</p>
      </Section>

      {ref.keyParams.length > 0 && (
        <Section title="Ключевые параметры">
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ref.keyParams.map((p, i) => (
              <li key={i} style={{ fontSize: 14, color: 'var(--on-surface-variant)', display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--primary)', flexShrink: 0 }}>·</span>
                {p}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {ref.tolerances.length > 0 && (
        <Section title="Допуски и нормы">
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ref.tolerances.map((t, i) => (
              <li key={i} style={{ fontSize: 14, fontWeight: 500, color: 'var(--on-surface)', display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--primary)', flexShrink: 0 }}>·</span>
                {t}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {ref.critical.length > 0 && (
        <Section title="Важно знать">
          <div style={{ background: '#FFF3E0', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ref.critical.map((c, i) => (
              <p key={i} style={{ fontSize: 13, fontWeight: 500, color: '#E65100', margin: 0 }}>
                ⚠ {c}
              </p>
            ))}
          </div>
        </Section>
      )}

      {ref.marking && (
        <Section title="Маркировка">
          <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.7 }}>{ref.marking}</p>
        </Section>
      )}

      {ref.fullTextUrl && !ref.fullTextUrl.endsWith('/') && (
        <div style={{ marginTop: 24 }}>
          <a
            href={ref.fullTextUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius-full)', padding: '10px 20px', fontSize: 13, fontWeight: 500, textDecoration: 'none', fontFamily: 'Manrope, sans-serif' }}
          >
            Полный текст ↗
          </a>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 20 }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 10 }}>
        {title}
      </p>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '14px 16px', border: '1px solid var(--outline-variant)' }}>
        {children}
      </div>
    </div>
  )
}
