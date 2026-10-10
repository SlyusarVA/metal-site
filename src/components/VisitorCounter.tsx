'use client'

import { useEffect, useState } from 'react'
import AnimatedNumber from './ui/AnimatedNumber'

type Counts = { today: number; total: number; date: string; startedAt: string; timeZone: string; sandbox: boolean }

export default function VisitorCounter() {
  const [counts, setCounts] = useState<Counts | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let stopped = false
    let controller: AbortController | undefined
    let lastDate = ''
    const endpoint = location.hostname === 'sortament.pro' || location.hostname === 'www.sortament.pro'
      ? 'https://metal-site-five.vercel.app/api/visitors'
      : '/api/visitors'
    async function visit() {
      controller?.abort()
      controller = new AbortController()
      const current = controller
      const timeout = window.setTimeout(() => current.abort(), 5000)
      try {
        // One background request per page load. Mobile visits count too; the widget stays hidden.
        const response = await fetch(endpoint, { method: 'POST', credentials: 'omit', cache: 'no-store', signal: current.signal, priority: 'low' } as RequestInit)
        if (!response.ok) throw new Error('counter unavailable')
        const data: Counts = await response.json()
        if (![data.today, data.total].every(v => Number.isSafeInteger(v) && v >= 0) || data.today > data.total || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) throw new Error('invalid counts')
        if (!stopped) { setCounts(data); setFailed(false); lastDate = data.date }
      } catch { if (!stopped) setFailed(true) }
      finally { clearTimeout(timeout) }
    }
    const delayed = window.setTimeout(visit, 800)
    const refreshOnReturn = () => {
      if (document.visibilityState !== 'visible' || !lastDate) return
      const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Novosibirsk', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
      if (date !== lastDate) void visit()
    }
    document.addEventListener('visibilitychange', refreshOnReturn)
    return () => { stopped = true; clearTimeout(delayed); controller?.abort(); document.removeEventListener('visibilitychange', refreshOnReturn) }
  }, [])
  const title = counts
    ? 'Оценка по уникальным IP: один адрес может принадлежать нескольким людям, а один человек — использовать несколько адресов. Сегодня: ' + counts.date + ', ' + counts.timeZone + '. Подсчёт с ' + counts.startedAt + '.'
    : 'Счётчик уникальных IP. Статистика появится после подключения хранилища.'
  return <aside className="visitor-counter" aria-label="Уникальные посетители" title={title}>
    <div className="visitor-counter-title">Уникальные посетители{counts?.sandbox && <span> · тест</span>}</div>
    <div className="visitor-counter-values" aria-live="polite">
      <div><span>Сегодня</span><strong><AnimatedNumber value={counts?.today ?? null} digits={0} /></strong></div>
      <div><span>За всё время</span><strong><AnimatedNumber value={counts?.total ?? null} digits={0} /></strong></div>
    </div>
    {failed && <div className="visitor-counter-status">Статистика недоступна</div>}
  </aside>
}
