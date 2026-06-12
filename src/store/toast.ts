import { proxy } from 'valtio'

export type ToastKind = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  kind: ToastKind
  /** Optional bold line above the message. */
  title: string | null
  content: string
  /** ms before auto-dismiss. null keeps it until dismissed. */
  duration: number | null
}

export const toastStore = proxy<{ toasts: Toast[] }>({ toasts: [] })

const DEFAULT_DURATION = 4000

function uid(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`
  }
}

type ToastInput = string | (Partial<Omit<Toast, 'content'>> & { content: string })

/** Queue a toast. Pass a string for a default success toast, or an object to customize. */
export function pushToast(input: ToastInput): string {
  const base: Partial<Omit<Toast, 'content'>> & { content: string } =
    typeof input === 'string' ? { content: input } : input
  const toast: Toast = {
    id: base.id ?? uid(),
    kind: base.kind ?? 'success',
    title: base.title ?? null,
    content: base.content,
    duration: base.duration === undefined ? DEFAULT_DURATION : base.duration,
  }
  toastStore.toasts.push(toast)
  return toast.id
}

export function dismissToast(id: string): void {
  const idx = toastStore.toasts.findIndex((t) => t.id === id)
  if (idx !== -1) toastStore.toasts.splice(idx, 1)
}
