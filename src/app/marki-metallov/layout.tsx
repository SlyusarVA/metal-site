import MarkochnikSearch from '@/components/markochnik/MarkochnikSearch'
import MarkochnikScrollFix from '@/components/markochnik/MarkochnikScrollFix'

export default function MarkochnikLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={shellStyle}>
      <MarkochnikScrollFix />
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
