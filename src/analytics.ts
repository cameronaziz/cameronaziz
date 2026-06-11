/**
 * Lightweight analytics helper.
 * Sends events to the gateway; silently fails if unavailable.
 */
const GATEWAY = 'https://gateway.cameronaziz.com'

export function track(event: string, props?: Record<string, unknown>): void {
  try {
    const distinctId =
      localStorage.getItem('distinct_id') ?? generateId()
    localStorage.setItem('distinct_id', distinctId)

    fetch(`${GATEWAY}/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, distinctId, properties: props ?? {} }),
      keepalive: true,
    }).catch(() => undefined)
  } catch {
    // Silent fail — analytics should never break the app
  }
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
      id += hex[(Math.random() * 4) | 0 + 8]
    } else {
      id += hex[(Math.random() * 16) | 0]
    }
  }
  return id
}
