import { useSnapshot } from 'valtio'
import { motion, AnimatePresence } from 'framer-motion'
import { Reply, Send, X, Check } from 'lucide-react'
import {
  emailStore,
  openReply,
  closeReply,
  sendReply,
  clearFromErrorIfSatisfied,
  type SendStatus,
} from '../../store/email'

const SEND_LABEL: Record<SendStatus, string> = {
  idle: 'Send',
  sending: 'Sending…',
  sent: 'Sent!',
  error: 'Try again',
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Date.now() - then
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return days === 1 ? 'yesterday' : `${days}d ago`
}

export function ReplyComposer({ experienceId }: { experienceId: string }) {
  const snap = useSnapshot(emailStore)
  const draft = snap.drafts[experienceId]
  const status = snap.sendStatus
  if (!draft) return null

  const to = draft.to[0]?.address ?? 'hi@cameronaziz.com'
  const sending = status === 'sending'
  const sent = status === 'sent'

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {/* Composer header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#F8F9FA] border-b border-gray-100">
        <div className="flex items-center gap-2 text-[#5F6368]">
          <Reply size={14} />
          <span className="text-[12px] font-semibold tracking-wide uppercase">Reply</span>
        </div>
        <button
          type="button"
          onClick={closeReply}
          aria-label="Close reply"
          className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      <div className="px-4 py-3 flex flex-col gap-3">
        {/* To (fixed host address) */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#9AA0A6] uppercase tracking-wider w-14 shrink-0">To</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] bg-blue-50 text-blue-700">
            {to}
          </span>
        </div>

        {/* From (visitor email, optional) */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-[#9AA0A6] uppercase tracking-wider w-14 shrink-0" htmlFor="reply-from">
            From
          </label>
          <input
            id="reply-from"
            type="email"
            value={draft.from.address}
            placeholder="you@example.com (optional)"
            onChange={(e) => {
              emailStore.drafts[experienceId]!.from.address = e.target.value
              clearFromErrorIfSatisfied(experienceId)
            }}
            className={[
              'flex-1 px-3 py-1.5 bg-gray-50 border rounded-xl text-[13px] text-[#1F1F1F] outline-none transition-colors',
              draft.from.isValid ? 'border-gray-200 focus:border-blue-300' : 'border-red-400 focus:border-red-400',
            ].join(' ')}
          />
        </div>

        {/* Subject */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-[#9AA0A6] uppercase tracking-wider w-14 shrink-0" htmlFor="reply-subject">
            Subject
          </label>
          <input
            id="reply-subject"
            type="text"
            value={draft.subject}
            onChange={(e) => {
              emailStore.drafts[experienceId]!.subject = e.target.value
            }}
            className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-[#1F1F1F] outline-none focus:border-blue-300 transition-colors"
          />
        </div>

        {/* Message */}
        <textarea
          value={draft.body}
          rows={6}
          onChange={(e) => {
            emailStore.drafts[experienceId]!.body = e.target.value
          }}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-[#1F1F1F] leading-relaxed outline-none focus:border-blue-300 resize-none transition-colors"
        />

        {/* Quoted experience body */}
        {draft.quoted && (
          <div className="border-l-2 border-gray-200 pl-3 ml-0.5">
            <div className="text-[11px] text-[#9AA0A6] mb-1">Quoting this email</div>
            <p className="text-[12px] text-[#9AA0A6] leading-snug line-clamp-3 whitespace-pre-wrap">{draft.quoted}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-gray-100">
        <button
          type="button"
          onClick={closeReply}
          className="px-3 py-1.5 rounded-xl text-[13px] font-medium text-[#5F6368] hover:bg-gray-100 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => sendReply(experienceId)}
          disabled={sending}
          className={[
            'flex items-center gap-2 px-4 py-1.5 rounded-xl text-[13px] font-medium transition-colors',
            sent
              ? 'bg-[#34A853] text-white'
              : sending
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-[#1A73E8] text-white hover:bg-blue-600 cursor-pointer',
          ].join(' ')}
        >
          {sent ? <Check size={14} /> : <Send size={14} />}
          {SEND_LABEL[status]}
        </button>
      </div>
    </div>
  )
}

function RepliedConfirmation({ experienceId }: { experienceId: string }) {
  const snap = useSnapshot(emailStore)
  const record = snap.replied[experienceId]
  if (!record) return null

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-[#34A853]/30 bg-[#34A853]/5">
      <div className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#34A853] text-white">
        <Check size={15} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-[#1F1F1F]">Reply sent</div>
        <div className="text-[12px] text-[#5F6368] truncate">
          To {record.to} · {relativeTime(record.at)}
        </div>
      </div>
      <button
        type="button"
        onClick={() => openReply(experienceId)}
        className="shrink-0 text-[#1A73E8] text-[13px] font-medium hover:underline cursor-pointer"
      >
        Reply again
      </button>
    </div>
  )
}

/**
 * Switches between the Reply button, the open composer, and the persisted
 * post-send confirmation. The composer expands and collapses in place.
 */
export function ReplySection({ experienceId }: { experienceId: string }) {
  const snap = useSnapshot(emailStore)
  const isComposing = snap.isOpen && snap.activeId === experienceId
  const replied = Boolean(snap.replied[experienceId])

  return (
    <div className="mt-5">
      <AnimatePresence mode="wait" initial={false}>
        {isComposing ? (
          <motion.div
            key="composer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.2, 0.9, 0.2, 1] }}
            className="overflow-hidden"
          >
            <ReplyComposer experienceId={experienceId} />
          </motion.div>
        ) : replied ? (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <RepliedConfirmation experienceId={experienceId} />
          </motion.div>
        ) : (
          <motion.div
            key="trigger"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              onClick={() => openReply(experienceId)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium bg-[#1A73E8] text-white hover:bg-blue-600 transition-colors cursor-pointer"
            >
              <Reply size={14} />
              Reply
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
