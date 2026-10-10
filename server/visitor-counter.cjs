const { createHmac, createHash } = require('node:crypto')
const { isIP } = require('node:net')
const TIME_ZONE = 'Asia/Novosibirsk'
const PRODUCTION_ORIGINS = new Set(['https://sortament.pro', 'https://www.sortament.pro'])
function dateKey(now) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
  const get = type => parts.find(p => p.type === type).value
  return get('year') + '-' + get('month') + '-' + get('day')
}
function canonicalIp(value) {
  if (typeof value !== 'string' || !isIP(value.trim())) return null
  let ip = value.trim().toLowerCase()
  if (isIP(ip) === 6) {
    ip = new URL('http://[' + ip + ']').hostname.slice(1, -1)
    const mapped = ip.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/)
    if (mapped) { const a = parseInt(mapped[1], 16), b = parseInt(mapped[2], 16); return [a >> 8, a & 255, b >> 8, b & 255].join('.') }
  }
  return ip
}
const script = `
local hits = redis.call('INCR', KEYS[4])
if hits == 1 then redis.call('EXPIRE', KEYS[4], 60) end
if hits > 20 then return {-1} end
if ARGV[2] == '1' then
  redis.call('SADD', KEYS[1], ARGV[1])
  redis.call('SADD', KEYS[2], ARGV[1])
  redis.call('EXPIRE', KEYS[2], 172800)
  redis.call('SET', KEYS[3], ARGV[3], 'NX')
end
return {redis.call('SCARD', KEYS[2]), redis.call('SCARD', KEYS[1]), redis.call('GET', KEYS[3]) or ''}
`
function allowedOrigin(origin, host, env) {
  if (PRODUCTION_ORIGINS.has(origin)) return true
  const known = [env.VERCEL_URL, env.VERCEL_BRANCH_URL, 'metal-site-five.vercel.app']
  if (typeof host === 'string' && /^[a-z0-9-]+\.vercel\.app$/.test(host)) known.push(host)
  return known.filter(Boolean).some(domain => origin === 'https://' + domain)
}
async function countVisit({ headers, method, env = process.env, now = new Date(), fetcher = fetch }) {
  const origin = headers.origin
  const cors = { 'Cache-Control': 'no-store', 'Vary': 'Origin', 'Content-Type': 'application/json; charset=utf-8' }
  if (!allowedOrigin(origin, headers.host, env)) return { status: 403, headers: cors, body: { error: 'origin_not_allowed' } }
  cors['Access-Control-Allow-Origin'] = origin
  cors['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
  if (method === 'OPTIONS') return { status: 204, headers: cors }
  if (!['GET', 'POST'].includes(method)) return { status: 405, headers: { ...cors, Allow: 'GET, POST, OPTIONS' }, body: { error: 'method_not_allowed' } }
  if (headers.dnt === '1' || headers['sec-gpc'] === '1' || /bot|crawler|spider|headless/i.test(headers['user-agent'] || '')) return { status: 204, headers: cors }
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN
  const secret = env.VISITOR_COUNTER_SECRET
  if (!url || !token || !secret || secret.length < 32 || env.VERCEL !== '1') return { status: 503, headers: cors, body: { error: 'counter_not_configured' } }
  // This header is overwritten by Vercel. Never accept an IP from a body/query parameter.
  const ip = canonicalIp(headers['x-vercel-forwarded-for'])
  if (!ip) return { status: 400, headers: cors, body: { error: 'invalid_client_address' } }
  const visitor = createHmac('sha256', secret).update(ip).digest('hex')
  const sandbox = !PRODUCTION_ORIGINS.has(origin)
  const scope = sandbox ? 'preview:' + createHash('sha256').update(origin).digest('hex').slice(0, 16) : 'production'
  const prefix = 'sortament:visitors:v1:' + scope + ':'
  const date = dateKey(now)
  try {
  const response = await fetcher(url, { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(['EVAL', script, 4, prefix + 'all', prefix + date, prefix + 'started', prefix + 'rate:' + visitor, visitor, method === 'POST' ? '1' : '0', date]), signal: AbortSignal.timeout(3500) })
  if (!response.ok) throw new Error('visitor_store_unavailable')
  const { result, error } = await response.json()
  if (error || !Array.isArray(result)) throw new Error('invalid_store_response')
  if (result[0] === -1) return { status: 429, headers: { ...cors, 'Retry-After': '60' }, body: { error: 'too_many_requests' } }
  const [today, total, startedAt] = result
  if (![today, total].every(v => Number.isSafeInteger(v) && v >= 0) || today > total) throw new Error('invalid_store_counts')
  return { status: 200, headers: cors, body: { today, total, date, startedAt, timeZone: TIME_ZONE, sandbox } }
  } catch {
    console.error('visitor_counter_store_unavailable')
    return { status: 503, headers: cors, body: { error: 'counter_unavailable' } }
  }
}
module.exports = { countVisit, dateKey, canonicalIp, script }
