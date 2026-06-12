import { useEffect } from 'react'
import { useSnapshot } from 'valtio'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, AlertCircle, Info } from 'lucide-react'
import { toastStore, dismissToast, type Toast as ToastData } from '../../store/toast'

function ToastIcon({ kind }: { kind: ToastData['kind'] }) {
  if (kind === 'error') return <AlertCircle size={16} className="text-red-500" />
  if (kind === 'info') return <Info size={16} className="text-prussian-400" />
  return <Check size={16} className="text-copper-500" />
}

function ToastCard({ toast }: { toast: ToastData }) {
  useEffect(() => {
    if (toast.duration == null) return
    const timer = setTimeout(() => dismissToast(toast.id), toast.duration)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.2, 0.9, 0.2, 1] }}
      className="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl shadow-lg border border-gray-200 bg-white min-w-[260px] max-w-[380px]"
    >
      <div className="shrink-0 mt-0.5">
        <ToastIcon kind={toast.kind} />
      </div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className="text-[13px] font-semibold text-ink leading-snug">{toast.title}</div>
        )}
        <div className="text-[13px] text-[#5f5a52] leading-snug break-words">{toast.content}</div>
      </div>
      <button
        type="button"
        onClick={() => dismissToast(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 p-0.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
      >
        <X size={13} strokeWidth={2.5} />
      </button>
    </motion.div>
  )
}

/**
 * Bottom-right toast stack. Mounted once inside the app card so toasts sit in
 * the lower-right corner of the UI. Usually holds a single toast at a time.
 */
export function ToastHost() {
  const { toasts } = useSnapshot(toastStore)

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast as ToastData} />
        ))}
      </AnimatePresence>
    </div>
  )
}
