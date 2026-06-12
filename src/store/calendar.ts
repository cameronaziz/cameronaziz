import { proxy } from 'valtio'
import { track } from '../analytics'

const GATEWAY = 'https://gateway.cameronaziz.com'

/** PST offset in ms */
const PST_OFFSET = -480 * 60 * 1000

/** 3 hours ahead cushion (10800 seconds) */
const LOOKAHEAD_MS = 10800 * 1000

function getPSTDate(): Date {
  const utc = Date.now()
  const localOffset = new Date().getTimezoneOffset() * 60 * 1000
  return new Date(utc + PST_OFFSET + localOffset)
}

const now = getPSTDate()
const lookahead = new Date(now.getTime() + LOOKAHEAD_MS)
const lookaheadHour =
  lookahead.getMinutes() < 30 ? lookahead.getHours() : lookahead.getHours() + 1
const lookaheadMinute = lookahead.getMinutes() < 30 ? 30 : 0
const isPastCutoff = lookaheadHour >= 22

export interface Guest {
  address: string
  editable: boolean
  isValid: boolean
}

export const calendarStore = proxy<{
  guests: Guest[]
  date: Date
  startHour: number
  startMinute: number
  title: string
  description: string
  phone: string
  emailError: boolean
  phoneError: boolean
  sendStatus: 'idle' | 'sending' | 'sent' | 'error'
}>({
  guests: [{ address: 'hi@cameronaziz.com', editable: false, isValid: true }],
  date: isPastCutoff
    ? new Date(lookahead.getFullYear(), lookahead.getMonth(), lookahead.getDate() + 1)
    : lookahead,
  startHour: isPastCutoff || lookaheadHour < 7 ? 7 : lookaheadHour,
  startMinute: isPastCutoff || lookaheadHour < 7 ? 0 : lookaheadMinute,
  title: 'Connect with Cameron Aziz',
  description: 'A quick meeting to connect with Cameron Aziz and yourself.',
  phone: '',
  emailError: false,
  phoneError: false,
  sendStatus: 'idle',
})

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function isValidPhone(value: string): boolean {
  return value.replace(/\D/g, '').length >= 10
}

/**
 * The requester is reachable if they added their own email (editable: true)
 * or a phone number. The pre-filled hi@cameronaziz.com (editable: false)
 * does not count.
 */
export function hasValidContact(): boolean {
  const hasEmail = calendarStore.guests.some(
    (g) => g.editable && isValidEmail(g.address),
  )
  return hasEmail || isValidPhone(calendarStore.phone)
}

/** Remove both red borders as soon as either input satisfies the requirement. */
export function clearContactErrorsIfSatisfied(): void {
  if (hasValidContact()) {
    calendarStore.emailError = false
    calendarStore.phoneError = false
  }
}

export async function sendCalendarInvite(): Promise<void> {
  if (calendarStore.sendStatus === 'sending') return

  // Require a valid phone or a valid guest email from the visitor.
  if (!hasValidContact()) {
    calendarStore.emailError = true
    calendarStore.phoneError = true
    return
  }

  const { date, startHour, startMinute, title, description, phone, guests } =
    calendarStore
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  const guestAddresses = guests.map((g) => g.address)

  calendarStore.sendStatus = 'sending'
  const startedAt = Date.now()

  try {
    const res = await fetch(`${GATEWAY}/calendar-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        date: dateStr,
        startHour,
        startMinute,
        description,
        phone,
        guests: guestAddresses,
      }),
    })

    if (!res.ok) throw new Error(`Send failed: ${res.status}`)
    calendarStore.sendStatus = 'sent'
    track('calendar_invite_sent', {
      date: dateStr,
      guest_count: guestAddresses.length,
      latency_ms: Date.now() - startedAt,
    })
  } catch (err) {
    calendarStore.sendStatus = 'error'
    track('calendar_invite_error', {
      date: dateStr,
      error: err instanceof Error ? err.message : String(err),
      latency_ms: Date.now() - startedAt,
    })
  }
}
