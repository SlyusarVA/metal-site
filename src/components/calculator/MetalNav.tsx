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
      width: 158,
      flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--outline-variant)',
      overflow: 'hidden',
      height: '100%',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 800, letterSpacing: '.08em',
        color: 'var(--on-surface-variant)',
        padding: '12px 16px 6px',
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
        let fontWeight: number = 500

        if (isActive && isHighlighted) {
          bg = 'var(--primary-container)'; borderColor = 'var(--primary)'; color = 'var(--primary)'; fontWeight = 800
        } else if (isActive) {
          bg = 'var(--primary-container)'; borderColor = 'var(--primary)'; color = 'var(--primary)'; fontWeight = 700
        } else if (isHighlighted) {
          bg = '#FFFDE7'; borderColor = '#F9A825'; color = '#E65100'; fontWeight = 700
        }

        return (
          <button
            key={group}
            className="nav-item"
            onClick={() => { onSelect(group); onMobileClose?.() }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', textAlign: 'left',
              background: bg, border: 'none',
              borderLeft: `4px solid ${borderColor}`,
              cursor: 'pointer', padding: '8px 14px 8px 14px',
              fontSize: 15, fontWeight, color,
              fontFamily: 'Manrope, sans-serif',
              transition: 'background .12s, color .12s',
              minHeight: 40,
              lineHeight: 1.2,
            }}
            onMouseEnter={e => { if (!isActive && !isHighlighted) (e.currentTarget as HTMLElement).style.background = 'var(--surface-container)' }}
            onMouseLeave={e => { if (!isActive && !isHighlighted) (e.currentTarget as HTMLElement).style.background = 'none' }}
          >
            {isHighlighted && !isActive && (
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F9A825', flexShrink: 0 }} />
            )}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group}</span>
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
        width: 220, zIndex: 201,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform .25s cubic-bezier(0.2,0,0,1)',
        overflowY: 'auto',
        background: 'var(--surface)',
        borderRight: '1px solid var(--outline-variant)',
      }}>
        <div style={{
          fontSize: 11, fontWeight: 800, letterSpacing: '.08em',
          color: 'var(--on-surface-variant)',
          padding: '12px 14px 6px',
          textTransform: 'uppercase',
        }}>
          Металл
        </div>
        {groups.map(group => {
          const isActive = group === selected
          const isHighlighted = highlighted.includes(group)
          let bg = 'none', borderColor = 'transparent', color = 'var(--on-surface)', fontWeight = 500
          if (isActive && isHighlighted) { bg = 'var(--primary-container)'; borderColor = 'var(--primary)'; color = 'var(--primary)'; fontWeight = 800 }
          else if (isActive) { bg = 'var(--primary-container)'; borderColor = 'var(--primary)'; color = 'var(--primary)'; fontWeight = 700 }
          else if (isHighlighted) { bg = '#FFFDE7'; borderColor = '#F9A825'; color = '#E65100'; fontWeight = 700 }
          return (
            <button key={group} className="nav-item" onClick={() => { onSelect(group); onMobileClose?.() }} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', textAlign: 'left',
              background: bg, border: 'none', borderLeft: `4px solid ${borderColor}`,
              cursor: 'pointer', padding: '12px 14px',
              fontSize: 15, fontWeight, color,
              fontFamily: 'Manrope, sans-serif', minHeight: 44,
            }}>
              {isHighlighted && !isActive && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F9A825', flexShrink: 0 }} />}
              {group}
            </button>
          )
        })}
      </div>
    </>
  )
}
