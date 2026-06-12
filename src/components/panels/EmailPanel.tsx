import { motion, AnimatePresence } from 'framer-motion'
import { useSnapshot } from 'valtio'
import { ExperiencePanel } from '../ExperiencePanel'
import { ExperienceDetail } from '../ExperiencePanel/ExperienceDetail'
import { ReplyComposer } from '../ExperiencePanel/ReplyComposer'
import { emailStore } from '../../store/email'
import { useLocation } from 'wouter'

export function EmailPanel() {
  const [location] = useLocation()
  const snap = useSnapshot(emailStore)

  // Detect /experience/:id pattern
  const expMatch = location.match(/^\/experience\/([^/]+)/)
  const experienceId = expMatch?.[1] ?? null

  const isComposing = snap.isOpen && snap.activeId === experienceId

  return (
    <div className="h-full relative w-full">
      {experienceId ? (
        <AnimatePresence mode="popLayout" initial={false}>
          <ExperienceDetail key={`exp-${experienceId}`} experienceId={experienceId} />
        </AnimatePresence>
      ) : (
        <motion.div
          layout
          animate={{ y: isComposing ? -12 : 0, scale: isComposing ? 0.95 : 1 }}
          transition={{ duration: 0.5, ease: [0.2, 0.9, 0.2, 1] }}
          className="h-full flex flex-col relative w-full"
        >
          <ExperiencePanel />
        </motion.div>
      )}

      <AnimatePresence>
        {isComposing && experienceId && (
          <motion.div
            key="reply-overlay"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.45, ease: [0.2, 0.9, 0.2, 1] }}
            className="absolute inset-0 bg-white border-t border-gray-200 shadow-lg flex flex-col rounded-3xl overflow-hidden z-10"
          >
            <ReplyComposer experienceId={experienceId} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
