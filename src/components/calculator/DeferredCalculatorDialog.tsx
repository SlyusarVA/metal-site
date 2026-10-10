'use client'

import { useEffect, useState, type ComponentType } from 'react'
import AppDialog from '@/components/ui/AppDialog'

type DialogProps = { onClose: () => void; initialCode?: string | null }
type Props = DialogProps & {
  title: string
  load: () => Promise<{ default: ComponentType<DialogProps> }>
}

// A failed first download must not take the locally running calculator down.
export default function DeferredCalculatorDialog({ title, load, onClose, initialCode }: Props) {
  const [Content, setContent] = useState<ComponentType<DialogProps> | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    setFailed(false)
    load().then(module => {
      if (active) setContent(() => module.default)
    }).catch(() => {
      if (active) setFailed(true)
    })
    return () => { active = false }
  }, [load, attempt])

  if (Content) return <Content onClose={onClose} initialCode={initialCode} />
  return <AppDialog title={title} onClose={onClose}>
    <div className="ui-dialog-shell" style={{ padding: 20, gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 16 }}>{title}</h2>
        <button type="button" data-dialog-close="" className="ui-icon-button" aria-label="Закрыть окно">×</button>
      </div>
      <p role={failed ? 'alert' : 'status'}>{failed ? 'Не удалось открыть окно. Проверьте подключение и повторите.' : 'Загрузка…'}</p>
      {failed && <button type="button" onClick={() => setAttempt(value => value + 1)} style={{ minHeight: 44 }}>Повторить</button>}
    </div>
  </AppDialog>
}
