/**
 * portfolio-analytics
 *
 * Cloudflare Worker that receives client events from cameronaziz.com and
 * persists them to a D1 database (analytics_events). This is the logging sink
 * the front-end `track()` helper posts to.
 *
 * Routes:
 *   OPTIONS *           CORS preflight
 *   GET  /  | /health   health check
 *   POST /  | /event     ingest one event  -> { event, distinctId, properties }
 *   GET  /events         admin read (Bearer ADMIN_TOKEN), ?limit= &event=
 *
 * Bindings:
 *   DB           D1 database (portfolio-analytics)
 *   ADMIN_TOKEN  secret guarding the read endpoint
 */

const ORIGIN_SUFFIX = 'cameronaziz.com'
const ORIGIN_EXACT = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
]

function pickOrigin(origin) {
  if (!origin) return 'https://cameronaziz.com'
  if (ORIGIN_EXACT.includes(origin)) return origin
  try {
    const host = new URL(origin).hostname
    if (host === ORIGIN_SUFFIX || host.endsWith('.' + ORIGIN_SUFFIX)) return origin
  } catch {
    // fall through
  }
  return 'https://cameronaziz.com'
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': pickOrigin(origin),
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })
}

function str(v) {
  return typeof v === 'string' ? v : null
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin')
    const url = new URL(request.url)
    const { method } = request

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    if (method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
      return json({ ok: true, service: 'portfolio-analytics' }, 200, origin)
    }

    if (method === 'GET' && url.pathname === '/events') {
      const auth = request.headers.get('Authorization') || ''
      if (!env.ADMIN_TOKEN || auth !== `Bearer ${env.ADMIN_TOKEN}`) {
        return json({ error: 'unauthorized' }, 401, origin)
      }
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10) || 100, 1000)
      const event = url.searchParams.get('event')
      const stmt = event
        ? env.DB.prepare(
            'SELECT * FROM analytics_events WHERE event = ? ORDER BY id DESC LIMIT ?',
          ).bind(event, limit)
        : env.DB.prepare('SELECT * FROM analytics_events ORDER BY id DESC LIMIT ?').bind(limit)
      const { results } = await stmt.all()
      return json({ count: results.length, events: results }, 200, origin)
    }

    if (method === 'POST') {
      let payload
      try {
        payload = await request.json()
      } catch {
        return json({ error: 'invalid_json' }, 400, origin)
      }

      const event = str(payload && payload.event)
      if (!event) return json({ error: 'missing_event' }, 400, origin)

      const props =
        payload && typeof payload.properties === 'object' && payload.properties
          ? payload.properties
          : {}

      try {
        await env.DB.prepare(
          `INSERT INTO analytics_events
             (event, distinct_id, session_id, path, properties, referer, user_agent, country, client_ts)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
          .bind(
            event,
            str(payload.distinctId) || str(props.distinct_id),
            str(props.session_id),
            str(props.path),
            JSON.stringify(props),
            request.headers.get('Referer'),
            request.headers.get('User-Agent'),
            request.headers.get('CF-IPCountry'),
            str(props.ts),
          )
          .run()
      } catch (err) {
        return json({ error: 'db_error', message: String(err) }, 500, origin)
      }

      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    return json({ error: 'not_found' }, 404, origin)
  },
}
