'use client'

interface Props {
  groups: string[]
  selected: string
  /** Группы подсвеченные через поиск ГОСТа */
  highlighted?: string[]
  onSelect: (group: string) => void
}

export default function MetalNav({ groups, selected, highlighted = [], onSelect }: Props) {
  return (
    <div style={{
      width: 130,
      flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--outline-variant)',
      overflowY: 'auto',
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

        // Три состояния:
        // active + highlighted = выбран через ГОСТ (синий + жёлтая полоса сверху)
        // только highlighted = предлагается ГОСТом (жёлтая подсветка + точка)
        // только active = обычный выбор (синяя подсветка)
        let bg = 'none'
        let borderColor = 'transparent'
        let color = 'var(--on-surface)'
        let fontWeight: number = 400

        if (isActive && isHighlighted) {
          bg = 'var(--primary-container)'
          borderColor = 'var(--primary)'
          color = 'var(--primary)'
          fontWeight = 700
        } else if (isActive) {
          bg = 'var(--primary-container)'
          borderColor = 'var(--primary)'
          color = 'var(--primary)'
          fontWeight = 600
        } else if (isHighlighted) {
          bg = '#FFFDE7'
          borderColor = '#F9A825'
          color = '#E65100'
          fontWeight = 600
        }

        return (
          <button
            key={group}
            onClick={() => onSelect(group)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              width: '100%',
              textAlign: 'left',
              background: bg,
              border: 'none',
              borderLeft: `3px solid ${borderColor}`,
              cursor: 'pointer',
              padding: '9px 10px 9px 11px',
              fontSize: 13,
              fontWeight,
              color,
              fontFamily: 'Manrope, sans-serif',
              transition: 'background .12s, color .12s',
            }}
            onMouseEnter={e => {
              if (!isActive && !isHighlighted)
                (e.currentTarget as HTMLElement).style.background = 'var(--surface-container)'
            }}
            onMouseLeave={e => {
              if (!isActive && !isHighlighted)
                (e.currentTarget as HTMLElement).style.background = 'none'
            }}
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
}
