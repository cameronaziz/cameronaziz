/**
 * Lightweight analytics helper.
 * Sends events to the gateway; silently fails if unavailable.
 * Every event is enriched with the current path, a timestamp, and the chat
 * session id so downstream tooling can correlate activity without each call
 * site having to pass that context.
 */
const ANALYTICS_ENDPOINT = 'https://analytics.cameronaziz.com/event'

function getDistinctId(): string {
  try {
    const existing = localStorage.getItem('distinct_id')
    if (existing) return existing
    const id = generateId()
    localStorage.setItem('distinct_id', id)
    return id
  } catch {
    return generateId()
  }
}

function defaultProps(): Record<string, unknown> {
  const props: Record<string, unknown> = {}
  try {
    props.path = window.location.pathname + window.location.hash
    props.ts = new Date().toISOString()
    const session = localStorage.getItem('chat_session_id')
    if (session) props.session_id = session
  } catch {
    // ignore — defaults are best-effort
  }
  return props
}

export function track(event: string, props?: Record<string, unknown>): void {
  try {
    const distinctId = getDistinctId()

    fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        distinctId,
        properties: { ...defaultProps(), ...(props ?? {}) },
      }),
      keepalive: true,
    }).catch(() => undefined)
  } catch {
    // Silent fail — analytics should never break the app
  }
}

let errorTrackingReady = false

/**
 * Registers global listeners so uncaught errors, rejected promises, and
 * tab visibility changes are logged. Safe to call more than once.
 */
export function initErrorTracking(): void {
  if (errorTrackingReady || typeof window === 'undefined') return
  errorTrackingReady = true

  window.addEventListener('error', (e) => {
    track('client_error', {
      message: e.message,
      source: e.filename,
      line: e.lineno,
      column: e.colno,
      stack: e.error instanceof Error ? e.error.stack?.slice(0, 1000) : undefined,
    })
  })

  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason
    track('unhandled_rejection', {
      message: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack?.slice(0, 1000) : undefined,
    })
  })

  document.addEventListener('visibilitychange', () => {
    track('visibility_changed', { state: document.visibilityState })
  })
}

function generateId(): string {
  const hex = '0123456789abcdef'
  let id = ''
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      id += '-'
    } else if (i === 14) {
      id += '4'
    } else if (i === 19) {
      id += hex[((Math.random() * 4) | 0) + 8]
    } else {
      id += hex[(Math.random() * 16) | 0]
    }
  }
  return id
}
