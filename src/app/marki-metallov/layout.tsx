import Link from 'next/link'
import MarkochnikSearch from '@/components/markochnik/MarkochnikSearch'
import MarkochnikScrollFix from '@/components/markochnik/MarkochnikScrollFix'

export default function MarkochnikLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={shellStyle}>
      <MarkochnikScrollFix />
      <div style={topbarStyle}>
        <Link href="/" style={backLinkStyle}>← Вернуться к калькулятору</Link>
      </div>
      <MarkochnikSearch />
      {children}
    </div>
  )
}

const shellStyle: React.CSSProperties = {
  minHeight: '100svh',
  width: '100%',
  overflow: 'visible',
  background: 'var(--surface-variant)',
}

const topbarStyle: React.CSSProperties = {
  maxWidth: 1120,
  margin: '0 auto',
  padding: '10px 10px 0',
  display: 'flex',
  justifyContent: 'flex-start',
}

const backLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 36,
  padding: '0 12px',
  border: '1px solid var(--outline-variant)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--surface-container)',
  color: 'var(--primary)',
  textDecoration: 'none',
  fontSize: 'var(--text-sm)',
  fontWeight: 800,
  lineHeight: 1,
}
