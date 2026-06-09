import gostData from '../data/metal-reference/gosts.compact.json'
import productTypeData from '../data/metal-reference/product-types.compact.json'
import designationTokenData from '../data/metal-reference/designation-tokens.compact.json'
import parserRuleData from '../data/metal-reference/parser-rules.compact.json'

export type MetalReferenceConfidence = 'verified' | 'contextual' | 'unknown'

export interface MetalDesignationSpan {
  start: number
  end: number
}

export interface CandidateNormalization {
  raw: string
  normalizedCandidate: string
  confidence: 'contextual'
  needsReview: true
  notes: string[]
}

export interface MetalDesignationTokenResult {
  raw: string
  normalized: string
  type: string
  meaning: string
  confidence: MetalReferenceConfidence
  sourceGosts: string[]
  displayWarning: string | null
  span: MetalDesignationSpan
  notes: string[]
  sourceId?: string
  sourceKind?: 'gost' | 'product-type' | 'designation-token' | 'parser-rule' | 'unknown'
  candidateNormalization?: CandidateNormalization
}

export interface MetalDesignationPartResult {
  raw: string
  span: MetalDesignationSpan
  tokens: MetalDesignationTokenResult[]
}

export interface MetalDesignationParseResult {
  input: string
  normalizedInput: string
  parts: MetalDesignationPartResult[]
  tokens: MetalDesignationTokenResult[]
  unknownTokens: MetalDesignationTokenResult[]
  candidateNormalizations: CandidateNormalization[]
}

interface CompactReferenceRecord {
  id: string
  token: string
  key: string
  aliases?: string[]
  type: string
  meaning: string
  confidence: MetalReferenceConfidence
  sourceGosts: string[]
  appliesTo?: string[]
  displayWarning: string | null
}

const gosts = gostData.gosts as CompactReferenceRecord[]
const productTypes = productTypeData.productTypes as CompactReferenceRecord[]
const designationTokens = designationTokenData.tokens as CompactReferenceRecord[]
const parserRules = parserRuleData.rules as CompactReferenceRecord[]

const UNKNOWN_MEANING = 'Обозначение не найдено в текущей partial-базе'
const UNKNOWN_WARNING = 'Токен не найден в текущем partial compact seed; требуется ручная проверка перед пользовательским выводом.'

const LOOKALIKE_PAIRS: Array<[string, string[]]> = [
  ['Х', ['X']],
  ['С', ['C']],
  ['А', ['A']],
  ['В', ['B']],
  ['О', ['O', '0']],
  ['Н', ['H']],
  ['З', ['3']],
  ['Р', ['P']],
  ['М', ['M']],
]

function normalizeInput(input: string): string {
  return input
    .normalize('NFC')
    .replace(/[‐‑‒–—―]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function isWordChar(value: string): boolean {
  return /[0-9A-Za-zА-Яа-яЁё]/.test(value)
}

function hasTokenBoundary(input: string, start: number, end: number): boolean {
  const before = start > 0 ? input[start - 1] : ''
  const after = end < input.length ? input[end] : ''
  return (!before || !isWordChar(before)) && (!after || !isWordChar(after))
}

function toResult(
  record: CompactReferenceRecord,
  raw: string,
  normalized: string,
  span: MetalDesignationSpan,
  sourceKind: MetalDesignationTokenResult['sourceKind'],
  notes: string[] = [],
): MetalDesignationTokenResult {
  return {
    raw,
    normalized,
    type: record.type,
    meaning: record.meaning,
    confidence: record.confidence,
    sourceGosts: [...record.sourceGosts],
    displayWarning: record.displayWarning,
    span,
    notes,
    sourceId: record.id,
    sourceKind,
  }
}

function toUnknown(raw: string, span: MetalDesignationSpan, notes: string[] = []): MetalDesignationTokenResult {
  return {
    raw,
    normalized: raw,
    type: 'unknown',
    meaning: UNKNOWN_MEANING,
    confidence: 'unknown',
    sourceGosts: [],
    displayWarning: UNKNOWN_WARNING,
    span,
    notes,
    sourceKind: 'unknown',
  }
}

function addToken(results: MetalDesignationTokenResult[], result: MetalDesignationTokenResult): void {
  if (results.some(existing => existing.span.start === result.span.start && existing.span.end === result.span.end && existing.type === result.type)) {
    return
  }
  results.push(result)
}

function hasOverlap(spans: MetalDesignationSpan[], candidate: MetalDesignationSpan): boolean {
  return spans.some(span => candidate.start < span.end && candidate.end > span.start)
}

function findGosts(input: string): MetalDesignationTokenResult[] {
  const results: MetalDesignationTokenResult[] = []
  const byKey = new Map(gosts.map(gost => [gost.key, gost]))
  const re = /(^|[^0-9A-Za-zА-Яа-яЁё])ГОСТ\s+(\d{3,5})-(\d{2,4})(?=$|[^0-9A-Za-zА-Яа-яЁё])/gi
  let match: RegExpExecArray | null

  while ((match = re.exec(input))) {
    const prefixLength = match[1].length
    const key = `${match[2]}-${match[3]}`
    const record = byKey.get(key)
    if (!record || match.index == null) continue
    const start = match.index + prefixLength
    const raw = match[0].slice(prefixLength)
    addToken(
      results,
      toResult(record, raw, record.token, { start, end: start + raw.length }, 'gost', [
        'Matched by explicit ГОСТ reference rule from compact seed.',
      ]),
    )
  }

  return results
}

function findProductTypes(input: string, occupied: MetalDesignationSpan[]): MetalDesignationTokenResult[] {
  const results: MetalDesignationTokenResult[] = []

  for (const record of productTypes) {
    const aliases = record.aliases?.length ? record.aliases : [record.token]
    for (const alias of aliases) {
      const re = new RegExp(escapeRegExp(alias), 'gi')
      let match: RegExpExecArray | null

      while ((match = re.exec(input))) {
        const span = { start: match.index, end: match.index + match[0].length }
        if (!hasTokenBoundary(input, span.start, span.end) || hasOverlap(occupied, span)) continue
        addToken(results, toResult(record, match[0], record.token, span, 'product-type', ['Matched as compact product type.']))
      }
    }
  }

  return results
}

function findSizePatternTokens(input: string, occupied: MetalDesignationSpan[]): MetalDesignationTokenResult[] {
  const results: MetalDesignationTokenResult[] = []
  const tolerance = designationTokens.find(token => token.key === 'h11')
  const dimension = designationTokens.find(token => token.token === '7,0')
  const sizeRule = parserRules.find(rule => rule.key === 'recognize-tolerance-plus-decimal-comma-size')
  const re = /(^|[^0-9A-Za-zА-Яа-яЁё])([hH]\d{1,2})\s*-\s*(\d+(?:,\d+)?)(?=$|[^0-9A-Za-zА-Яа-яЁё])/g
  let match: RegExpExecArray | null

  while ((match = re.exec(input))) {
    const prefixLength = match[1].length
    const toleranceRaw = match[2]
    const dimensionRaw = match[3]
    const toleranceStart = match.index + prefixLength
    const toleranceSpan = { start: toleranceStart, end: toleranceStart + toleranceRaw.length }
    const dimensionStart = input.indexOf(dimensionRaw, toleranceSpan.end)
    const dimensionSpan = { start: dimensionStart, end: dimensionStart + dimensionRaw.length }

    if (tolerance && !hasOverlap(occupied, toleranceSpan)) {
      addToken(
        results,
        toResult(tolerance, toleranceRaw, tolerance.token, toleranceSpan, 'designation-token', [
          'Matched inside tolerance-plus-size pattern.',
          sizeRule ? `Pattern rule: ${sizeRule.id}.` : 'Pattern rule missing from compact seed.',
        ]),
      )
    }

    if (dimension && dimensionStart >= 0 && !hasOverlap(occupied, dimensionSpan)) {
      addToken(
        results,
        toResult(dimension, dimensionRaw, dimension.token, dimensionSpan, 'designation-token', [
          'Matched inside tolerance-plus-size pattern.',
          sizeRule ? `Pattern rule: ${sizeRule.id}.` : 'Pattern rule missing from compact seed.',
        ]),
      )
    }
  }

  return results
}

function findDesignationTokens(input: string, occupied: MetalDesignationSpan[]): MetalDesignationTokenResult[] {
  const results: MetalDesignationTokenResult[] = []

  for (const record of designationTokens) {
    const re = new RegExp(escapeRegExp(record.token), 'gi')
    let match: RegExpExecArray | null

    while ((match = re.exec(input))) {
      const span = { start: match.index, end: match.index + match[0].length }
      if (!hasTokenBoundary(input, span.start, span.end) || hasOverlap(occupied, span)) continue
      addToken(results, toResult(record, match[0], record.token, span, 'designation-token', ['Matched as compact designation token.']))
    }
  }

  return results
}

function buildCandidateNormalization(raw: string): CandidateNormalization | undefined {
  const notes: string[] = []
  let candidate = raw

  for (const [cyrillic, variants] of LOOKALIKE_PAIRS) {
    for (const variant of variants) {
      if (candidate.includes(variant)) {
        candidate = candidate.split(variant).join(cyrillic)
        notes.push(`${variant} -> ${cyrillic}`)
      }
    }
  }

  if (!notes.length || candidate === raw) return undefined

  return {
    raw,
    normalizedCandidate: candidate,
    confidence: 'contextual',
    needsReview: true,
    notes,
  }
}

function findUnknowns(input: string, knownSpans: MetalDesignationSpan[]): MetalDesignationTokenResult[] {
  const results: MetalDesignationTokenResult[] = []
  const re = /[0-9A-Za-zА-Яа-яЁё]+(?:,[0-9]+)?/g
  let match: RegExpExecArray | null

  while ((match = re.exec(input))) {
    const span = { start: match.index, end: match.index + match[0].length }
    if (hasOverlap(knownSpans, span)) continue

    const unknown = toUnknown(match[0], span, ['Not found in current partial compact seed.'])
    const candidateNormalization = buildCandidateNormalization(match[0])
    if (candidateNormalization) {
      unknown.candidateNormalization = candidateNormalization
      unknown.notes.push('Contains Russian/Latin lookalike characters; candidate normalization requires review.')
    }
    results.push(unknown)
  }

  return results
}

function splitParts(input: string, tokens: MetalDesignationTokenResult[]): MetalDesignationPartResult[] {
  const parts: MetalDesignationPartResult[] = []
  const re = /[^/]+/g
  let match: RegExpExecArray | null

  while ((match = re.exec(input))) {
    const raw = match[0].trim()
    const leadingSpaces = match[0].search(/\S/)
    const start = match.index + (leadingSpaces < 0 ? 0 : leadingSpaces)
    const end = start + raw.length
    parts.push({
      raw,
      span: { start, end },
      tokens: tokens.filter(token => token.span.start >= start && token.span.end <= end),
    })
  }

  return parts
}

export function parseMetalDesignation(input: string): MetalDesignationParseResult {
  const normalizedInput = normalizeInput(input)
  const tokens: MetalDesignationTokenResult[] = []

  const gostMatches = findGosts(normalizedInput)
  gostMatches.forEach(token => addToken(tokens, token))

  const sizeMatches = findSizePatternTokens(normalizedInput, tokens.map(token => token.span))
  sizeMatches.forEach(token => addToken(tokens, token))

  const designationMatches = findDesignationTokens(normalizedInput, tokens.map(token => token.span))
  designationMatches.forEach(token => addToken(tokens, token))

  const productMatches = findProductTypes(normalizedInput, tokens.map(token => token.span))
  productMatches.forEach(token => addToken(tokens, token))

  tokens.sort((a, b) => a.span.start - b.span.start || a.span.end - b.span.end)

  const unknownTokens = findUnknowns(normalizedInput, tokens.map(token => token.span))
  const allTokens = [...tokens, ...unknownTokens].sort((a, b) => a.span.start - b.span.start || a.span.end - b.span.end)
  const candidateNormalizations = allTokens.flatMap(token => (token.candidateNormalization ? [token.candidateNormalization] : []))

  return {
    input,
    normalizedInput,
    parts: splitParts(normalizedInput, allTokens),
    tokens: allTokens,
    unknownTokens,
    candidateNormalizations,
  }
}
