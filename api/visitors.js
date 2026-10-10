const { countVisit } = require('../server/visitor-counter.cjs')
module.exports = async function handler(req, res) {
  try {
    const result = await countVisit({ headers: req.headers, method: req.method })
    for (const [key, value] of Object.entries(result.headers)) res.setHeader(key, value)
    res.statusCode = result.status
    res.end(result.body ? JSON.stringify(result.body) : undefined)
  } catch {
    // Do not log request headers, IP addresses or credentials.
    console.error('visitor_counter_store_unavailable')
    res.setHeader('Cache-Control', 'no-store')
    res.statusCode = 503
    res.end(JSON.stringify({ error: 'counter_unavailable' }))
  }
}
