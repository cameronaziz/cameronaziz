import { proxy } from 'valtio'
import { track } from '../analytics'

const GATEWAY = 'https://gateway.cameronaziz.com'

const MESSAGES_KEY = 'chat_messages'
const SESSION_KEY = 'chat_session_id'

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

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sentAt: Date
}

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Array<Omit<ChatMessage, 'sentAt'> & { sentAt: string }>
    const seen = new Set<string>()
    return parsed
      .map((m) => ({ ...m, sentAt: new Date(m.sentAt) }))
      .filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)))
  } catch {
    return []
  }
}

function saveMessages(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
  } catch {
    // ignore
  }
}

function loadSessionId(): string {
  try {
    return localStorage.getItem(SESSION_KEY) ?? generateId()
  } catch {
    return generateId()
  }
}

const sessionId = loadSessionId()
try {
  localStorage.setItem(SESSION_KEY, sessionId)
} catch {
  // ignore
}

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hey! Ask me anything about Cameron's experience, tech stack, how he works, you name it.",
  sentAt: new Date(),
}

const stored = loadMessages()

export const chatStore = proxy<{
  isLoading: boolean
  messages: ChatMessage[]
  draft: string
  sessionId: string
  distinctId: string
}>({
  isLoading: false,
  messages: stored.length > 0 ? stored : [WELCOME],
  draft: '',
  sessionId,
  distinctId: (typeof localStorage !== 'undefined' ? localStorage.getItem('distinct_id') : null) ?? '',
})

export async function sendMessage(): Promise<void> {
  const draft = chatStore.draft.trim()
  if (!draft || chatStore.isLoading) return

  const priorUserMessages = chatStore.messages.filter((m) => m.role === 'user').length

  const userMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    role: 'user',
    content: draft,
    sentAt: new Date(),
  }

  chatStore.messages.push(userMsg)
  chatStore.draft = ''
  chatStore.isLoading = true

  track('chat_message_sent', {
    length: draft.length,
    message_number: priorUserMessages + 1,
    is_first_message: priorUserMessages === 0,
  })

  const streamId = `streaming-${Date.now()}`
  const assistantMsg: ChatMessage = {
    id: streamId,
    role: 'assistant',
    content: '',
    sentAt: new Date(),
  }
  chatStore.messages.push(assistantMsg)

  const history = chatStore.messages
    .filter((m) => m.role === 'user' || (m.role === 'assistant' && m.content.length > 0))
    .map((m) => ({ role: m.role, content: m.content }))

  const startedAt = Date.now()

  try {
    const response = await fetch(`${GATEWAY}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: history,
        sessionId: chatStore.sessionId,
        distinctId: chatStore.distinctId,
      }),
    })

    if (!response.ok) throw new Error(`Chat error: ${response.status}`)

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data) as { content?: string }
            if (parsed.content) {
              const idx = chatStore.messages.findIndex((m) => m.id === streamId)
              if (idx !== -1) {
                chatStore.messages[idx]!.content += parsed.content
              }
            }
          } catch {
            // Non-JSON line; skip
          }
        }
      }
    }

    track('chat_response_received', {
      latency_ms: Date.now() - startedAt,
      response_length:
        chatStore.messages.find((m) => m.id === streamId)?.content.length ?? 0,
    })
  } catch (err) {
    const idx = chatStore.messages.findIndex((m) => m.id === streamId)
    if (idx !== -1) {
      chatStore.messages[idx]!.content =
        "Something went wrong on my end. Try again in a moment."
    }
    track('chat_response_failed', {
      latency_ms: Date.now() - startedAt,
      error: err instanceof Error ? err.message : String(err),
    })
  } finally {
    chatStore.isLoading = false
    saveMessages(chatStore.messages)
  }
}
