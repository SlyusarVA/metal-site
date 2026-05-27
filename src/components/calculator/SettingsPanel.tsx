'use client'

import { useEffect, useRef, useState } from 'react'
import { profiles } from '@/data/profiles'
import { useSettings, GradeSort, GradeSortMode } from '@/data/settings'
import { useTheme } from '@/hooks/useTheme'
import { useAccentScheme } from '@/hooks/useAccentScheme'
import AppDialog from '@/components/ui/AppDialog'
import type { ProfileKey } from '@/data/profiles'

interface Props {
  onClose: () => void
}

type Tab = 'metals' | 'sortament' | 'grades' | 'theme'
type Theme = 'light' | 'dark' | 'system'

const THEME_OPTIONS: { value: Theme; label: string; icon: string; desc: string }[] = [
  { value: 'light',  label: 'Светлая',   icon: '☀️', desc: 'Всегда светлый интерфейс' },
  { value: 'dark',   label: 'Тёмная',    icon: '🌙', desc: 'Всегда тёмный интерфейс' },
  { value: 'system', label: 'Системная', icon: '💻', desc: 'Следует настройкам устройства' },
]

const TABS: [Tab, string][] = [
  ['metals', 'Металл'],
  ['sortament', 'Сортамент'],
  ['grades', 'Марки'],
  ['theme', 'Тема'],
]

const TAB_INDEX: Record<Tab, number> = {
  metals: 0,
  sortament: 1,
  grades: 2,
  theme: 3,
}

export default function SettingsPanel({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>('metals')
  const [previousTab, setPreviousTab] = useState<Tab>('metals')
  const { settings, setMetalOrder, setProfileOrder, setGradeSort, resetToDefault } = useSettings()
  const { theme: currentTheme, setTheme: applyTheme } = useTheme()
  const { setAccentScheme } = useAccentScheme()

  function selectTab(next: Tab) {
    setPreviousTab(tab)
    setTab(next)
  }

  function handleResetToDefault() {
    resetToDefault()
    applyTheme('system')
    setAccentScheme('green')
  }

  const tabDirection = TAB_INDEX[tab] >= TAB_INDEX[previousTab] ? 1 : -1

  return (
    <AppDialog title="Настройки" onClose={onClose} width={540}>
      <div className="ui-dialog-shell">
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px 0', flexShrink: 0,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Настройки</h2>
          <button onClick={onClose} className="ui-icon-button" aria-label="Закрыть настройки">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div style={{
          display: 'flex', gap: 0, padding: '12px 20px 0',
          borderBottom: '1px solid var(--outline-variant)', flexShrink: 0,
        }}>
          {TABS.map(([id, label]) => (
            <button key={id} onClick={() => selectTab(id)} style={{
              background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === id ? 'var(--primary)' : 'transparent'}`,
              padding: '8px 16px', marginBottom: -1,
              fontSize: 13, fontWeight: tab === id ? 600 : 400,
              color: tab === id ? 'var(--primary)' : 'var(--on-surface-variant)',
              cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
              transition: 'color .15s, border-color .15s',
            }}>
              {label}
            </button>
          ))}
        </div>

        <div
          className="t-page-slide"
          data-page={tab}
          style={{ flex: 1, minHeight: 0, overflow: 'hidden', ['--t-page-from-x' as string]: `${tabDirection * 8}px` }}
        >
          <section className={`t-page ${tab === 'metals' ? 'is-active' : ''}`} data-page-id="metals">
            <div className="ui-scroll-area" style={pageContentStyle}>
              <DragList
                items={settings.metalOrder}
                renderLabel={g => g}
                onReorder={setMetalOrder}
                hint="Перетащите для изменения порядка в левой колонке калькулятора"
              />
            </div>
          </section>
          <section className={`t-page ${tab === 'sortament' ? 'is-active' : ''}`} data-page-id="sortament">
            <div className="ui-scroll-area" style={pageContentStyle}>
              <DragList
                items={settings.profileOrder}
                renderLabel={k => profiles.find(p => p.key === k)?.name ?? k}
                onReorder={order => setProfileOrder(order as ProfileKey[])}
                hint="Перетащите для изменения порядка в средней колонке калькулятора"
              />
            </div>
          </section>
          <section className={`t-page ${tab === 'grades' ? 'is-active' : ''}`} data-page-id="grades">
            <div className="ui-scroll-area" style={pageContentStyle}>
              <GradesSettings
                groups={settings.metalOrder}
                gradeSorts={settings.gradeSorts}
                onUpdate={setGradeSort}
              />
            </div>
          </section>
          <section className={`t-page ${tab === 'theme' ? 'is-active' : ''}`} data-page-id="theme">
            <div className="ui-scroll-area" style={pageContentStyle}>
              <ThemeSettings currentTheme={currentTheme} applyTheme={applyTheme} />
            </div>
          </section>
        </div>

        <div style={{
          padding: '12px 20px', borderTop: '1px solid var(--outline-variant)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          <button onClick={handleResetToDefault} style={{
            background: 'none', border: '1px solid var(--outline)',
            borderRadius: 'var(--radius-full)', padding: '7px 16px',
            fontSize: 12, color: 'var(--on-surface-variant)', cursor: 'pointer',
            fontFamily: 'Manrope, sans-serif',
          }}>
            Сбросить к умолчанию
          </button>
          <button onClick={onClose} style={{
            background: 'var(--primary)', border: 'none',
            borderRadius: 'var(--radius-full)', padding: '7px 20px',
            fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer',
            fontFamily: 'Manrope, sans-serif',
          }}>
            Готово
          </button>
        </div>
      </div>
    </AppDialog>
  )
}

function ThemeSettings({ currentTheme, applyTheme }: { currentTheme: Theme; applyTheme: (theme: Theme) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', margin: '0 0 8px' }}>
        Выберите цветовую схему интерфейса
      </p>
      {THEME_OPTIONS.map(opt => {
        const isActive = currentTheme === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => applyTheme(opt.value)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: isActive ? 'var(--primary-container)' : 'var(--surface)',
              border: `1px solid ${isActive ? 'var(--primary)' : 'var(--outline-variant)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              cursor: 'pointer',
              fontFamily: 'Manrope, sans-serif',
              textAlign: 'left',
              transition: 'background .15s, border-color .15s, color .15s',
            }}
          >
            <span style={{ fontSize: 22, flexShrink: 0 }}>{opt.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 13, fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--primary)' : 'var(--on-surface)',
                marginBottom: 2,
              }}>
                {opt.label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>
                {opt.desc}
              </div>
            </div>
            <div style={{
              width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
              border: `2px solid ${isActive ? 'var(--primary)' : 'var(--outline)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isActive && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />}
            </div>
          </button>
        )
      })}
    </div>
  )
}

const pageContentStyle: React.CSSProperties = {
  height: '100%',
  overflowY: 'auto',
  padding: '16px 20px',
}

function DragList<T extends string>({
  items, renderLabel, onReorder, hint,
}: {
  items: T[]
  renderLabel: (item: T) => string
  onReorder: (items: T[]) => void
  hint: string
}) {
  const [list, setList] = useState<T[]>(items)
  const [dragging, setDragging] = useState<number | null>(null)
  const [over, setOver] = useState<number | null>(null)
  const dragItem = useRef<number | null>(null)

  useEffect(() => {
    setList(items)
  }, [items])

  const handleDragStart = (i: number) => { dragItem.current = i; setDragging(i) }
  const handleDragEnter = (i: number) => { setOver(i) }
  const handleDrop = () => {
    if (dragItem.current === null || over === null || dragItem.current === over) {
      setDragging(null); setOver(null); return
    }
    const next = [...list]
    const [moved] = next.splice(dragItem.current, 1)
    next.splice(over, 0, moved)
    setList(next)
    onReorder(next)
    dragItem.current = null
    setDragging(null); setOver(null)
  }

  return (
    <div>
      <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', margin: '0 0 12px' }}>{hint}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {list.map((item, i) => {
          const isDragging = dragging === i
          const isOver = over === i && dragging !== null && dragging !== i
          return (
            <div
              key={item}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragEnter={() => handleDragEnter(i)}
              onDragEnd={handleDrop}
              onDragOver={e => e.preventDefault()}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: isDragging ? 'var(--primary-container)' : isOver ? 'var(--surface-container)' : 'var(--surface)',
                border: `1px solid ${isOver ? 'var(--primary)' : isDragging ? 'var(--primary)' : 'var(--outline-variant)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                cursor: 'grab',
                opacity: isDragging ? 0.5 : 1,
                transition: 'background .12s, border-color .12s',
                userSelect: 'none',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: 'var(--on-surface-variant)' }} aria-hidden="true">
                <circle cx="9" cy="6" r="1.5" fill="currentColor"/>
                <circle cx="15" cy="6" r="1.5" fill="currentColor"/>
                <circle cx="9" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="9" cy="18" r="1.5" fill="currentColor"/>
                <circle cx="15" cy="18" r="1.5" fill="currentColor"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{renderLabel(item)}</span>
              <span style={{
                fontSize: 11, color: 'var(--on-surface-variant)',
                background: 'var(--surface-container)',
                borderRadius: 'var(--radius-full)',
                padding: '2px 8px',
              }}>
                {i + 1}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const SORT_OPTIONS: { mode: GradeSortMode; label: string; desc: string }[] = [
  { mode: 'default', label: 'По умолчанию', desc: 'Порядок из базы данных' },
  { mode: 'alpha',   label: 'По алфавиту',  desc: 'А → Я → A → Z' },
  { mode: 'density', label: 'По плотности', desc: 'От наибольшей к наименьшей' },
  { mode: 'numeric', label: 'По номеру',    desc: 'По первому числу в марке' },
]

function GradesSettings({ groups, gradeSorts, onUpdate }: {
  groups: string[]
  gradeSorts: Record<string, GradeSort>
  onUpdate: (group: string, sort: GradeSort) => void
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', margin: '0 0 8px' }}>
        Включите кастомную сортировку для конкретной группы металла
      </p>
      {groups.map(group => {
        const sort = gradeSorts[group] ?? { enabled: false, mode: 'default' as GradeSortMode }
        const isExpanded = expanded === group
        return (
          <div key={group} style={{
            border: `1px solid ${sort.enabled ? 'var(--primary)' : 'var(--outline-variant)'}`,
            borderRadius: 'var(--radius-sm)', overflow: 'hidden', transition: 'border-color .15s',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px',
              background: sort.enabled ? 'var(--primary-container)' : 'var(--surface)',
              cursor: 'pointer',
            }}
              onClick={() => sort.enabled && setExpanded(isExpanded ? null : group)}
            >
              <button
                type="button"
                aria-label={`${sort.enabled ? 'Отключить' : 'Включить'} сортировку марок для ${group}`}
                onClick={e => {
                  e.stopPropagation()
                  const next: GradeSort = { enabled: !sort.enabled, mode: sort.mode }
                  onUpdate(group, next)
                  if (!sort.enabled) setExpanded(group)
                  else setExpanded(null)
                }}
                style={{
                  width: 18, height: 18, borderRadius: 4, flexShrink: 0, cursor: 'pointer',
                  border: `2px solid ${sort.enabled ? 'var(--primary)' : 'var(--outline)'}`,
                  background: sort.enabled ? 'var(--primary)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .15s', padding: 0,
                }}
              >
                {sort.enabled && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              <span style={{
                fontSize: 13, fontWeight: sort.enabled ? 600 : 400, flex: 1,
                color: sort.enabled ? 'var(--primary)' : 'var(--on-surface)',
              }}>
                {group}
              </span>
              {sort.enabled && (
                <span style={{
                  fontSize: 11, color: 'var(--primary)', background: 'var(--surface)',
                  border: '1px solid var(--primary)', borderRadius: 'var(--radius-full)', padding: '2px 10px',
                }}>
                  {SORT_OPTIONS.find(o => o.mode === sort.mode)?.label ?? 'По умолчанию'}
                </span>
              )}
            </div>
            {sort.enabled && isExpanded && (
              <div style={{
                borderTop: '1px solid var(--outline-variant)',
                background: 'var(--surface-variant)', padding: '8px 10px',
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.mode} onClick={() => onUpdate(group, { enabled: true, mode: opt.mode })} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: sort.mode === opt.mode ? 'var(--primary-container)' : 'transparent',
                    border: 'none', borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px', cursor: 'pointer',
                    fontFamily: 'Manrope, sans-serif', textAlign: 'left', transition: 'background .12s',
                  }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${sort.mode === opt.mode ? 'var(--primary)' : 'var(--outline)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {sort.mode === opt.mode && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)' }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: sort.mode === opt.mode ? 600 : 400, color: 'var(--on-surface)' }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
