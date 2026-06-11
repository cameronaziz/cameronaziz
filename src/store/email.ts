import { proxy } from 'valtio'
import { track } from '../analytics'
import { EXPERIENCES, type Experience } from '../data/experiences'
import { pushToast } from './toast'

const GATEWAY = 'https://gateway.cameronaziz.com'
const HOST_ADDRESS = 'hi@cameronaziz.com'
const REPLIED_KEY = 'email_replied_experiences'

/** Delay between the "Sent!" state and the composer collapsing back out. */
const COLLAPSE_DELAY_MS = 650

export type SendStatus = 'idle' | 'sending' | 'sent' | 'error'

export interface Recipient {
  address: string
  editable: boolean
  isValid: boolean
}

export interface Draft {
  from: { address: string; isValid: boolean }
  to: Recipient[]
  cc: { address: string }[]
  subject: string
  /** Editable message body, greeting through sign-off. */
  body: string
  /** The experience write-up, quoted beneath the reply. Read-only. */
  quoted: string
}

/** Persisted record of a sent reply, surfaced as the post-send confirmation. */
export interface RepliedRecord {
  at: string
  to: string
}

function loadReplied(): Record<string, RepliedRecord> {
  try {
    const raw = localStorage.getItem(REPLIED_KEY)
    return raw ? (JSON.parse(raw) as Record<string, RepliedRecord>) : {}
  } catch {
    return {}
  }
}

function saveReplied(map: Record<string, RepliedRecord>): void {
  try {
    localStorage.setItem(REPLIED_KEY, JSON.stringify(map))
  } catch {
    // best-effort persistence
  }
}

export const emailStore = proxy<{
  isOpen: boolean
  activeId: string | null
  drafts: Record<string, Draft>
  sendStatus: SendStatus
  replied: Record<string, RepliedRecord>
}>({
  isOpen: false,
  activeId: null,
  drafts: {},
  sendStatus: 'idle',
  replied: loadReplied(),
})

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function defaultBody(company: string): string {
  return [
    'Hi Cameron!',
    '',
    `I was exploring your site and I found your work at ${company} very interesting. I would love to speak to you about it. Would you have time to jump on a quick call?`,
    '',
    'Thanks',
  ].join('\n')
}

function ensureDraft(exp: Experience): void {
  if (emailStore.drafts[exp.id]) return
  emailStore.drafts[exp.id] = {
    from: { address: '', isValid: true },
    to: [{ address: HOST_ADDRESS, editable: false, isValid: true }],
    cc: [],
    subject: `Nice work as a ${exp.title}`,
    body: defaultBody(exp.company),
    quoted: exp.body,
  }
}

export function openReply(experienceId: string): void {
  const exp = EXPERIENCES.find((e) => e.id === experienceId)
  if (!exp) return
  ensureDraft(exp)
  emailStore.activeId = experienceId
  if (emailStore.sendStatus !== 'sending') emailStore.sendStatus = 'idle'
  emailStore.isOpen = true
  track('reply_opened', { experience_id: experienceId })
}

export function closeReply(): void {
  const id = emailStore.activeId
  emailStore.isOpen = false
  track('reply_closed', { experience_id: id })
}

export function hasReplied(experienceId: string): boolean {
  return Boolean(emailStore.replied[experienceId])
}

/** Clears the red-border state on the From field once it holds a valid value. */
export function clearFromErrorIfSatisfied(experienceId: string): void {
  const draft = emailStore.drafts[experienceId]
  if (!draft || draft.from.isValid) return
  const address = draft.from.address.trim()
  if (address === '' || EMAIL_RE.test(address)) draft.from.isValid = true
}

export async function sendReply(experienceId: string): Promise<void> {
  const draft = emailStore.drafts[experienceId]
  if (!draft || emailStore.sendStatus === 'sending') return

  const fromAddress = draft.from.address.trim()
  // From is optional, but a non-empty value must be a real address.
  if (fromAddress !== '' && !EMAIL_RE.test(fromAddress)) {
    draft.from.isValid = false
    emailStore.sendStatus = 'error'
    return
  }
  draft.from.isValid = true

  const toAddresses = draft.to.map((r) => r.address)
  const body = draft.quoted ? `${draft.body}\n\n${draft.quoted}` : draft.body
  const payload = {
    from: fromAddress,
    to: toAddresses,
    cc: draft.cc.map((c) => c.address),
    subject: draft.subject,
    body,
    experienceId,
  }

  emailStore.sendStatus = 'sending'
  const startedAt = Date.now()

  try {
    const res = await fetch(`${GATEWAY}/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`Send failed: ${res.status}`)

    emailStore.sendStatus = 'sent'

    const recipient = toAddresses[0] ?? HOST_ADDRESS
    emailStore.replied[experienceId] = { at: new Date().toISOString(), to: recipient }
    saveReplied({ ...emailStore.replied })

    track('email_reply_sent', {
      experience_id: experienceId,
      to_count: toAddresses.length,
      latency_ms: Date.now() - startedAt,
    })

    pushToast(`Successfully sent email to ${recipient}`)

    // Let "Sent!" register, then collapse the composer back out.
    setTimeout(() => {
      if (emailStore.sendStatus === 'sent') {
        emailStore.isOpen = false
        emailStore.sendStatus = 'idle'
      }
    }, COLLAPSE_DELAY_MS)
  } catch (err) {
    emailStore.sendStatus = 'error'
    track('email_reply_error', {
      experience_id: experienceId,
      error: err instanceof Error ? err.message : String(err),
      latency_ms: Date.now() - startedAt,
    })
  }
}
