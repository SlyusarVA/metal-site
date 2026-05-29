import MarkochnikSearch from '@/components/markochnik/MarkochnikSearch'

export default function MarkochnikLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={scrollShellStyle}>
      <MarkochnikSearch />
      <div style={contentStyle}>{children}</div>
    </div>
  )
}

const scrollShellStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  height: '100dvh',
  width: '100vw',
  minHeight: 0,
  overflowY: 'scroll',
  overflowX: 'hidden',
  overscrollBehaviorY: 'contain',
  WebkitOverflowScrolling: 'touch',
  background: 'var(--surface-variant)',
  touchAction: 'pan-y',
}

const contentStyle: React.CSSProperties = {
  minHeight: 0,
}
