import { useSnapshot } from 'valtio'
import { motion, AnimatePresence } from 'framer-motion'
import { appStore } from '../../store/app'
import { ExperiencePanel } from '../ExperiencePanel'
import { ExperienceDetail } from '../ExperiencePanel/ExperienceDetail'
import { useRoute } from 'wouter'

export function EmailPanel() {
  const { view } = useSnapshot(appStore)
  const [matchExp, params] = useRoute('/experience/:experienceId')

  return (
    <div className="h-full relative w-full">
      <motion.div
        layout
        animate={{ y: matchExp ? -12 : 0, scale: matchExp ? 0.95 : 1 }}
        transition={{ duration: 0.5, ease: [0.2, 0.9, 0.2, 1] }}
        className={[
          'h-full flex flex-col relative w-full',
          matchExp ? 'bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden' : '',
        ].join(' ')}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {matchExp && params?.experienceId ? (
            <ExperienceDetail key={`exp-${params.experienceId}`} experienceId={params.experienceId} />
          ) : (
            <ExperiencePanel key="panel" />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
