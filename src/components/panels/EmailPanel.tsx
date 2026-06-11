import { motion, AnimatePresence } from 'framer-motion'
import { ExperiencePanel } from '../ExperiencePanel'
import { ExperienceDetail } from '../ExperiencePanel/ExperienceDetail'
import { useLocation } from 'wouter'

export function EmailPanel() {
  const [location] = useLocation()

  // Detect /experience/:id pattern
  const expMatch = location.match(/^\/experience\/([^/]+)/)
  const experienceId = expMatch?.[1] ?? null

  return (
    <div className="h-full relative w-full">
      <motion.div
        layout
        animate={{ y: experienceId ? -12 : 0, scale: experienceId ? 0.95 : 1 }}
        transition={{ duration: 0.5, ease: [0.2, 0.9, 0.2, 1] }}
        className="h-full flex flex-col relative w-full"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {experienceId ? (
            <ExperienceDetail key={`exp-${experienceId}`} experienceId={experienceId} />
          ) : (
            <ExperiencePanel key="panel" />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
