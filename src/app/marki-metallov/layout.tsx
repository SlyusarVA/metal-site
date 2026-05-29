export default function MarkochnikLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={scrollShellStyle}>
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
