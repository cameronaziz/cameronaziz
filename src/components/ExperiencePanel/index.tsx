import { useCallback } from 'react'
import { useSnapshot } from 'valtio'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useLocation } from 'wouter'
import { appStore, experienceStore } from '../../store/app'
import { track } from '../../analytics'
import type { Experience } from '../../data/experiences'

// ---- Filter tab ----
function FilterTab({ tab }: { tab: string }) {
  const { activeTab } = useSnapshot(experienceStore)
  return (
    <button
      onClick={() => {
        track('experience_filter_changed', { filter: tab })
        experienceStore.activeTab = tab
      }}
      className={[
        'px-4 py-1.5 rounded-full text-[13px] font-medium cursor-pointer transition-colors',
        activeTab === tab
          ? 'bg-[#1A73E8] border-gray-200 text-white'
          : 'border bg-white border-gray-200 text-gray-600 hover:bg-blue-100',
      ].join(' ')}
    >
      {tab}
    </button>
  )
}

// ---- Single experience row ----
function ExperienceRow({ experience, source = 'more_view' }: { experience: Experience; source?: string }) {
  const [, navigate] = useLocation()

  const handleClick = useCallback(() => {
    track('experience_selected', { experience_id: experience.id, source })
    navigate(`/experience/${experience.id}`)
  }, [navigate, experience.id, source])

  return (
    <motion.button
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleClick}
      className="flex items-center text-left py-3 px-4 cursor-pointer rounded-2xl gap-4 group w-full hover:bg-dusk-100"
    >
      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-100 group-hover:border-gray-300 transition-colors overflow-hidden">
        <img src={experience.logo} alt={experience.company} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between w-full">
          <div className="text-[14px] font-semibold text-[#1F1F1F]">{experience.company}</div>
          <div className="text-[12px] text-[#5F6368] leading-tight mt-0.5">
          {experience.endDate}
        </div>
        </div>
        <div className="text-[12px] text-[#5F6368] leading-tight mt-0.5">
          {experience.title}
        </div>
      </div>
    </motion.button>
  )
}

/** Top-level experience panel — crossfades between DEFAULT and VIEW_MORE with animated height. */
export function ExperiencePanel() {
  const { view } = useSnapshot(appStore)
  const { experiences, tabs, activeTab } = useSnapshot(experienceStore)
  const isMore = view === 'VIEW_MORE'

  const filtered = activeTab === 'All' ? experiences : experiences.filter((e) => e.themes.includes(activeTab))
  const rows = isMore ? filtered : experiences.slice(0, 3)

  const handleMore = useCallback(() => {
    track('more_experiences_clicked')
    appStore.view = 'VIEW_MORE'
  }, [])

  const handleClose = useCallback(() => {
    track('more_view_closed')
    appStore.view = 'DEFAULT'
  }, [])

  return (
    <div className="w-full flex flex-col h-full">
      {/* Header row — fixed height, both elements absolutely positioned inside */}
      <div className="relative h-10 mb-3 shrink-0">
        <AnimatePresence initial={false}>
          {!isMore && (
            <motion.h3
              key="title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.075 } }}
              transition={{ duration: 0.075, delay: 0.09 }}
              className="absolute inset-0 flex items-center text-[10px] font-bold text-[#5F6368] tracking-widest uppercase"
            >
              RECENT INTERACTIONS
            </motion.h3>
          )}
          {isMore && (
            <motion.div
              key="filters"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.075 } }}
              transition={{ duration: 0.2, delay: 0.09 }}
              className="absolute inset-0 flex items-center justify-between"
            >
              <div className="flex gap-2">
                {tabs.map((tab, i) => (
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8, transition: { duration: 0.075 } }}
                    transition={{ duration: 0.2, delay: 0.09 + i * 0.04 }}
                  >
                    <FilterTab tab={tab} />
                  </motion.div>
                ))}
              </div>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.075 } }}
                transition={{ duration: 0.2, delay: 0.09 + tabs.length * 0.04 }}
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-full bg-dusk-100 cursor-pointer"
              >
                <X size={20} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* List — scrollable, fills remaining height */}
      <div className={`bg-[#E8EAED] rounded-[24px] p-2 flex flex-col ${isMore ? 'flex-1 overflow-y-auto min-h-0' : ''}`}>
        <AnimatePresence initial={false}>
          {rows.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ExperienceRow experience={exp} source={isMore ? 'more_view' : 'resting_view'} />
              {i < rows.length - 1 && (
                <div
                  className="h-px mx-2"
                  style={{
                    background: 'linear-gradient(to right, transparent 40px, rgba(0,0,0,0.08) 50px, rgba(0,0,0,0.08) calc(100% - 50px), transparent calc(100% - 40px))',
                  }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* More button */}
      <AnimatePresence initial={false}>
        {!isMore && (
          <motion.div
            key="more-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 flex justify-end px-2"
          >
            <button
              onClick={handleMore}
              className="cursor-pointer text-[#1A73E8] text-[14px] font-semibold hover:underline px-4 py-1"
            >
              More
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
