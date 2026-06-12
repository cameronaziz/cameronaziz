import { useSnapshot } from 'valtio'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, Check, Reply } from 'lucide-react'
import {
  emailStore,
  openReply,
  closeReply,
  sendReply,
  clearFromErrorIfSatisfied,
  type SendStatus,
} from '../../store/email'

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
    <div className="flex flex-col h-full">

      {/* Header: editable subject + close button, then From / To / CC rows */}
      <div className="px-4 pt-3 pb-2 border-b border-gray-100 shrink-0">

        {/* Subject row */}
        <div className="flex items-center justify-between mb-3">
          <input
            type="text"
            value={draft.subject}
            onChange={(e) => { emailStore.drafts[experienceId]!.subject = e.target.value }}
            className="text-[14px] font-bold text-gray-700 bg-transparent outline-none flex-1 pr-4"
          />
          <button
            type="button"
            onClick={closeReply}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* From / To / CC */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 min-h-6">
            <span className="text-[12px] text-gray-400 w-8 shrink-0">From</span>
            <input
              type="email"
              value={draft.from.address}
              placeholder="email@example.com"
              onChange={(e) => {
                emailStore.drafts[experienceId]!.from.address = e.target.value
                clearFromErrorIfSatisfied(experienceId)
              }}
              className="flex-1 outline-none min-w-0 text-[13px] bg-transparent placeholder:text-gray-300 text-gray-700"
            />
          </div>
          <div className="flex items-center gap-2 min-h-6">
            <span className="text-[12px] text-gray-400 w-8 shrink-0">To</span>
            <div className="flex-1 text-[13px]">
              <span className="inline rounded-full px-2 py-0.5 text-[12px] mx-0.5 bg-blue-50 text-blue-700 shadow-[inset_0_0_0_0.5px_#60a5fa]">
                {to}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 min-h-6">
            <span className="text-[12px] text-gray-400 w-8 shrink-0">CC</span>
            <input
              type="email"
              placeholder="email@example.com"
              className="flex-1 outline-none min-w-0 text-[13px] bg-transparent placeholder:text-gray-300 text-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Body: plain editable area + quoted text */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col text-[14px] text-gray-700 leading-relaxed">
        <textarea
          value={draft.body}
          onChange={(e) => { emailStore.drafts[experienceId]!.body = e.target.value }}
          className="flex-1 w-full outline-none resize-none bg-transparent text-[14px] text-gray-700 leading-relaxed"
        />
        {draft.quoted && (
          <div className="border-l-2 border-gray-200 pl-3 text-[13px] text-gray-400 leading-relaxed whitespace-pre-wrap mt-3 shrink-0">
            {draft.quoted}
          </div>
        )}
      </div>

      {/* Footer: Send only */}
      <div className="px-4 py-3 border-t border-gray-100 shrink-0 flex items-center justify-between">
        <span />
        <button
          type="button"
          onClick={() => sendReply(experienceId)}
          disabled={sending}
          className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-medium px-4 py-2 rounded-full transition-colors cursor-pointer"
        >
          {sent ? <Check size={13} strokeWidth={2.5} /> : <Send size={13} strokeWidth={2.5} />}
          {sent ? 'Sent!' : sending ? 'Sending…' : 'Send'}
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
 * Inline reply section — used in non-overlay contexts only.
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
