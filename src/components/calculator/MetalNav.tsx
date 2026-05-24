'use client'

interface Props {
  groups: string[]
  selected: string
  highlighted?: string[]
  onSelect: (group: string) => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function MetalNav({ groups, selected, highlighted = [], onSelect, mobileOpen, onMobileClose }: Props) {
  const content = (
    <div style={{
      width: 130,
      flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--outline-variant)',
      overflowY: 'auto',
      height: '100%',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '.08em',
        color: 'var(--on-surface-variant)',
        padding: '10px 14px 4px',
        textTransform: 'uppercase',
      }}>
        Металл
      </div>

      {groups.map(group => {
        const isActive = group === selected
        const isHighlighted = highlighted.includes(group)

        let bg = 'none'
        let borderColor = 'transparent'
        let color = 'var(--on-surface)'
        let fontWeight: number = 400

        if (isActive && isHighlighted) {
          bg = 'var(--primary-container)'; borderColor = 'var(--primary)'; color = 'var(--primary)'; fontWeight = 700
        } else if (isActive) {
          bg = 'var(--primary-container)'; borderColor = 'var(--primary)'; color = 'var(--primary)'; fontWeight = 600
        } else if (isHighlighted) {
          bg = '#FFFDE7'; borderColor = '#F9A825'; color = '#E65100'; fontWeight = 600
        }

        return (
          <button
            key={group}
            className="nav-item"
            onClick={() => { onSelect(group); onMobileClose?.() }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              width: '100%', textAlign: 'left',
              background: bg, border: 'none',
              borderLeft: `3px solid ${borderColor}`,
              cursor: 'pointer', padding: '7px 10px 7px 11px',
              fontSize: 13, fontWeight, color,
              fontFamily: 'Manrope, sans-serif',
              transition: 'background .12s, color .12s',
              minHeight: 36,
            }}
            onMouseEnter={e => { if (!isActive && !isHighlighted) (e.currentTarget as HTMLElement).style.background = 'var(--surface-container)' }}
            onMouseLeave={e => { if (!isActive && !isHighlighted) (e.currentTarget as HTMLElement).style.background = 'none' }}
          >
            {isHighlighted && !isActive && (
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F9A825', flexShrink: 0 }} />
            )}
            {group}
          </button>
        )
      })}
    </div>
  )

  if (mobileOpen === undefined) return content

  return (
    <>
      {mobileOpen && (
        <div onClick={onMobileClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200 }} />
      )}
      <div style={{
        position: 'fixed', top: 48, left: 0, bottom: 0,
        width: 200, zIndex: 201,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform .25s cubic-bezier(0.2,0,0,1)',
        overflowY: 'auto',
        background: 'var(--surface)',
        borderRight: '1px solid var(--outline-variant)',
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '.08em',
          color: 'var(--on-surface-variant)',
          padding: '12px 14px 6px',
          textTransform: 'uppercase',
        }}>
          Металл
        </div>
        {groups.map(group => {
          const isActive = group === selected
          const isHighlighted = highlighted.includes(group)
          let bg = 'none', borderColor = 'transparent', color = 'var(--on-surface)', fontWeight = 400
          if (isActive && isHighlighted) { bg = 'var(--primary-container)'; borderColor = 'var(--primary)'; color = 'var(--primary)'; fontWeight = 700 }
          else if (isActive) { bg = 'var(--primary-container)'; borderColor = 'var(--primary)'; color = 'var(--primary)'; fontWeight = 600 }
          else if (isHighlighted) { bg = '#FFFDE7'; borderColor = '#F9A825'; color = '#E65100'; fontWeight = 600 }
          return (
            <button key={group} className="nav-item" onClick={() => { onSelect(group); onMobileClose?.() }} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              width: '100%', textAlign: 'left',
              background: bg, border: 'none', borderLeft: `3px solid ${borderColor}`,
              cursor: 'pointer', padding: '12px 14px',
              fontSize: 14, fontWeight, color,
              fontFamily: 'Manrope, sans-serif', minHeight: 44,
            }}>
              {isHighlighted && !isActive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F9A825', flexShrink: 0 }} />}
              {group}
            </button>
          )
        })}
      </div>
    </>
  )
}
