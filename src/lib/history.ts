// История расчётов — localStorage
import { ProfileKey } from '../data/profiles'

export interface HistoryRecord {
  id: string
  timestamp: number
  profileKey: ProfileKey
  profileName: string
  metalGroup: string
  grade: string
  params: Record<string, number>
  quantity: number
  length: number
  mass: number
  massOne: number
  linearDensity: number
}

const STORAGE_KEY = 'metal_calc_history'
const MAX_RECORDS = 50

export function loadHistory(): HistoryRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveRecord(record: Omit<HistoryRecord, 'id' | 'timestamp'>): HistoryRecord {
  const full: HistoryRecord = {
    ...record,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  }
  const history = [full, ...loadHistory()].slice(0, MAX_RECORDS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  return full
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function formatTimestamp(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return 'только что'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} мин назад`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} ч назад`
  return new Date(ts).toLocaleDateString('ru-RU')
}
