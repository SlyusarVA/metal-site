import { TapeOptions, validTapeOptions } from '../data/aluminumTape'
import { PlateOptions, validPlateOptions } from '../data/aluminumPlate'
// История расчётов — localStorage
import { BrassOptions, validBrassOptions } from '../data/brassTolerance'
import { SheetOptions, validSheetOptions } from '../data/aluminumSheet'
import { ProfileKey, profileMap } from '../data/profiles'

export interface HistoryRecord {
  brassOptions?: BrassOptions
  tapeOptions?: TapeOptions
  plateOptions?: PlateOptions
  sheetOptions?: SheetOptions
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

function isRecord(value: unknown): value is HistoryRecord {
  if (!value || typeof value !== 'object') return false
  const r = value as HistoryRecord
  const profile = profileMap.get(r.profileKey)
  return (r.tapeOptions === undefined || validTapeOptions(r.tapeOptions)) && (r.plateOptions === undefined || validPlateOptions(r.plateOptions)) && (r.brassOptions === undefined || validBrassOptions(r.brassOptions)) && (r.sheetOptions === undefined || validSheetOptions(r.sheetOptions)) && !!profile && typeof r.id === 'string' && typeof r.profileName === 'string' &&
    typeof r.metalGroup === 'string' && typeof r.grade === 'string' &&
    Number.isFinite(r.timestamp) && Number.isSafeInteger(r.quantity) && r.quantity > 0 &&
    [r.length, r.mass, r.massOne, r.linearDensity].every(v => Number.isFinite(v) && v >= 0) &&
    !!r.params && typeof r.params === 'object' && !Array.isArray(r.params) &&
    profile.params.every(p => Number.isFinite(r.params[p.key]) && r.params[p.key] > 0)
}

export function loadHistory(): HistoryRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter(isRecord).slice(0, MAX_RECORDS) : []
  } catch {
    return []
  }
}

export function createRecord(record: Omit<HistoryRecord, 'id' | 'timestamp'>): HistoryRecord {
  return {
    ...record,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  }
}

export function persistRecord(record: HistoryRecord): boolean {
  try {
    const history = [record, ...loadHistory().filter(item => item.id !== record.id)].slice(0, MAX_RECORDS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    return true
  } catch {
    return false
  }
}

export function clearHistory(): void {
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* Storage may be unavailable. */ }
}

export function formatTimestamp(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return 'только что'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} мин назад`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} ч назад`
  return new Date(ts).toLocaleDateString('ru-RU')
}
