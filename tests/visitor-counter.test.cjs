const test = require('node:test')
const assert = require('node:assert/strict')
const { countVisit, dateKey, canonicalIp } = require('../server/visitor-counter.cjs')
const env = { VERCEL: '1', UPSTASH_REDIS_REST_URL: 'https://test.invalid', UPSTASH_REDIS_REST_TOKEN: 'test-token', VISITOR_COUNTER_SECRET: 'test-only-secret-with-at-least-32-chars' }
const headers = { origin: 'https://sortament.pro', host: 'metal-site-five.vercel.app', 'x-vercel-forwarded-for': '192.0.2.1', 'user-agent': 'Safari' }
const now = new Date('2026-10-10T17:00:00Z')
function request(overrides = {}) { return { method: 'POST', env, headers, now, fetcher: async () => ({ ok: true, json: async () => ({ result: [2, 10, '2026-10-01'] }) }), ...overrides } }
test('visitor date changes at Novosibirsk midnight', () => {
 assert.equal(dateKey(new Date('2026-10-10T16:59:59Z')), '2026-10-10')
 assert.equal(dateKey(now), '2026-10-11')
})
test('canonical IPv6 and mapped IPv4 avoid duplicate addresses', () => {
 assert.equal(canonicalIp('2001:0db8:0:0:0:0:0:1'), canonicalIp('2001:db8::1'))
 assert.equal(canonicalIp('::ffff:192.0.2.1'), '192.0.2.1')
 assert.equal(canonicalIp('192.0.2.1, 198.51.100.1'), null)
})
test('public result contains aggregate counts only; backend receives HMAC, never IP', async () => {
 let payload
 const r = await countVisit(request({ fetcher: async (_, opts) => { payload=JSON.parse(opts.body);return {ok:true,json:async()=>({result:[2,10,'2026-10-01']})} } }))
 assert.equal(r.status,200); assert.equal(r.body.today,2); assert.equal(r.body.total,10); assert.equal(r.body.sandbox,false)
 assert.equal(r.headers['Access-Control-Allow-Origin'],headers.origin)
 assert.equal(payload[2],4);assert.match(payload[7],/^[0-9a-f]{64}$/)
 assert.equal(JSON.stringify(payload).includes(headers['x-vercel-forwarded-for']),false)
 assert.equal(JSON.stringify(r.body).includes(payload[7]),false)
 assert.match(payload[3],/production:all$/);assert.match(payload[4],/production:2026-10-11$/)
})
test('test deployments have isolated counters and show test label', async () => {
 let payload
 const r=await countVisit(request({headers:{...headers,origin:'https://metal-site-five.vercel.app'},fetcher:async(_,o)=>{payload=JSON.parse(o.body);return {ok:true,json:async()=>({result:[1,1,'2026-10-11']})}}}))
 assert.equal(r.body.sandbox,true); assert.match(payload[3],/preview:/)
})
test('foreign or absent origins cannot write; preflight does not touch database', async () => {
 const fetcher=()=>{throw Error('must not call')}
 assert.equal((await countVisit(request({headers:{...headers,origin:'https://foreign.invalid'},fetcher}))).status,403)
 assert.equal((await countVisit(request({headers:{...headers,origin:undefined},fetcher}))).status,403)
 assert.equal((await countVisit(request({method:'OPTIONS',fetcher}))).status,204)
})
test('unconfigured store, untrusted IP, bots and tracking opt-out fail closed', async () => {
 const fetcher=()=>{throw Error('must not call')}
 assert.equal((await countVisit(request({env:{},fetcher}))).status,503)
 assert.equal((await countVisit(request({headers:{...headers,'x-vercel-forwarded-for':undefined,'x-forwarded-for':'192.0.2.1'},fetcher}))).status,400)
 for(const extra of [{dnt:'1'},{'sec-gpc':'1'},{'user-agent':'Googlebot'}]) assert.equal((await countVisit(request({headers:{...headers,...extra},fetcher}))).status,204)
})
test('GET reads without increment; repeated address generates same identifier', async () => {
 const commands=[];const fetcher=async(_,opts)=>{commands.push(JSON.parse(opts.body));return {ok:true,json:async()=>({result:[2,10,'2026-10-01']})}}
 await countVisit(request({fetcher})); await countVisit(request({fetcher}));await countVisit(request({method:'GET',fetcher}))
 assert.equal(commands[0][7],commands[1][7]);assert.equal(commands[2][8],'0');assert.equal(commands[0][8],'1')
})
test('rate limit and corrupt backend response never become fake counts', async () => {
 const r=await countVisit(request({fetcher:async()=>({ok:true,json:async()=>({result:[-1]})})}))
 assert.equal(r.status,429);assert.equal(r.headers['Retry-After'],'60')
 assert.equal((await countVisit(request({fetcher:async()=>({ok:true,json:async()=>({result:[10,2,'']})})}))).status,503)
})
