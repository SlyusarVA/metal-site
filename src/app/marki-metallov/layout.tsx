import MarkochnikSearch from '@/components/markochnik/MarkochnikSearch'

export default function MarkochnikLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={shellStyle}>
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
