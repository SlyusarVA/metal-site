import MarkochnikSearch from '@/components/markochnik/MarkochnikSearch'

export default function MarkochnikLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={scrollShellStyle}>
      <MarkochnikSearch />
      {children}
    </div>
  )
}

const scrollShellStyle: React.CSSProperties = {
  height: '100dvh',
  minHeight: 0,
  overflowY: 'auto',
  overflowX: 'hidden',
  WebkitOverflowScrolling: 'touch',
  background: 'var(--surface-variant)',
}
