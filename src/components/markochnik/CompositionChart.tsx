import { CompositionItem, compositionValue } from '@/data/markochnik'

type Props = {
  items: CompositionItem[]
  withoutFe?: boolean
}

export default function CompositionChart({ items, withoutFe = true }: Props) {
  const visible = items.filter(item => withoutFe ? item.element !== 'Fe' : true)
  const max = Math.max(1, ...visible.map(compositionValue))

  return (
    <div style={st.card}>
      <div style={st.head}>
        <div>
          <div style={st.title}>Диаграмма состава</div>
          <div style={st.subtitle}>{withoutFe ? 'Без железа: лучше видны легирующие и примесные элементы' : 'Все элементы'}</div>
        </div>
      </div>
      <div style={st.rows}>
        {visible.map(item => {
          const value = compositionValue(item)
          const width = `${Math.max(2, (value / max) * 100)}%`
          return (
            <div key={item.element} style={st.row}>
              <div style={st.label}>{item.element}</div>
              <div style={st.track}>
                <div style={{ ...st.bar, width }} />
              </div>
              <div style={st.value}>{item.valueText}</div>
            </div>
          )
        })}
      </div>
      <p style={st.note}>Для диапазонов используется среднее значение; для «до ...» — верхняя граница. Нормативным источником остаётся таблица состава.</p>
    </div>
  )
}

const st: Record<string, React.CSSProperties> = {
  card: { minWidth: 0, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', padding: 14, boxShadow: 'var(--shadow-1)', overflow: 'hidden' },
  head: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  title: { fontSize: 'var(--text-md)', fontWeight: 800, color: 'var(--on-surface)' },
  subtitle: { marginTop: 2, fontSize: 'var(--text-xs)', color: 'var(--on-surface-variant)' },
  rows: { display: 'flex', flexDirection: 'column', gap: 8 },
  row: { minWidth: 0, display: 'grid', gridTemplateColumns: '28px minmax(0, 1fr) 76px', alignItems: 'center', gap: 7 },
  label: { fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--primary)' },
  track: { minWidth: 0, height: 10, borderRadius: 999, background: 'var(--surface-container)', border: '1px solid var(--outline-variant)', overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 999, background: 'var(--primary)' },
  value: { minWidth: 0, fontSize: 'var(--text-xs)', color: 'var(--on-surface-variant)', textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
  note: { margin: '10px 0 0', fontSize: 'var(--text-xs)', color: 'var(--on-surface-variant)', lineHeight: 1.45, overflowWrap: 'anywhere' },
}
