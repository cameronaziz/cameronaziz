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

// ---- Single experience row in VIEW_MORE ----
function ExperienceRow({ experience, index }: { experience: Experience; index: number }) {
  const [, navigate] = useLocation()

  const handleClick = useCallback(() => {
    track('experience_selected', { experience_id: experience.id, source: 'more_view' })
    navigate(`/experience/${experience.id}`)
  }, [navigate, experience.id])

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.04 }}
      onClick={handleClick}
      className="cursor-pointer w-full flex items-center text-left px-4 py-3 hover:bg-[#F8F9FA] rounded-2xl transition-colors group"
    >
      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center mr-4 shrink-0 border border-gray-200 group-hover:shadow-sm transition-all overflow-hidden">
        <img src={experience.logo} alt={experience.company} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 flex items-center gap-2 min-w-0 pr-4">
        <span className="font-medium text-gray-900 truncate text-[14px]">{experience.company}</span>
        <span className="text-gray-400 shrink-0">—</span>
        <span className="text-gray-500 truncate text-[14px]">{experience.title}</span>
      </div>
      <span className="text-[13px] text-gray-400 whitespace-nowrap">{experience.date}</span>
    </motion.button>
  )
}

// ---- VIEW_MORE panel ----
function MoreView() {
  const { experiences, tabs, activeTab } = useSnapshot(experienceStore)
  const filtered = activeTab === 'All' ? experiences : experiences.filter((e) => e.themes.includes(activeTab))

  const handleClose = useCallback(() => {
    track('more_view_closed')
    appStore.view = 'DEFAULT'
  }, [])

  return (
    <motion.div
      key="more"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex flex-col h-full w-full"
    >
      <div className="flex items-center justify-between px-6 py-3 bg-[#F1F3F4] border-b border-gray-100 mb-2 shrink-0">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <FilterTab key={tab} tab={tab} />
          ))}
        </div>
        <button onClick={handleClose} className="text-gray-400 hover:text-gray-700 p-1">
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4 pt-1">
        {filtered.map((exp, i) => (
          <ExperienceRow key={exp.id} experience={exp} index={i} />
        ))}
      </div>
    </motion.div>
  )
}

// ---- DEFAULT (resting) view ----
function DefaultView() {
  const { experiences } = useSnapshot(experienceStore)
  const [, navigate] = useLocation()

  const handleMore = useCallback(() => {
    track('more_experiences_clicked')
    appStore.view = 'VIEW_MORE'
  }, [])

  return (
    <motion.div
      key="resting"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full w-full"
    >
      <h3 className="text-[10px] font-bold text-[#5F6368] tracking-widest uppercase mb-4 shrink-0 mt-1">
        RECENT INTERACTIONS
      </h3>
      <div className="bg-[#F1F3F4] rounded-[24px] p-2 flex flex-col">
        {experiences.slice(0, 3).map((exp) => (
          <button
            key={exp.id}
            onClick={() => {
              track('experience_selected', { experience_id: exp.id, source: 'resting_view' })
              navigate(`/experience/${exp.id}`)
            }}
            className="flex items-center text-left p-4 hover:bg-white/50 cursor-pointer transition-colors rounded-2xl gap-4 group"
          >
            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-white rounded-lg shadow-sm border border-transparent group-hover:border-gray-200 transition-colors overflow-hidden">
              <img src={exp.logo} alt={exp.company} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-[#1F1F1F]">{exp.company}</div>
              <div className="text-[12px] text-[#5F6368] leading-tight mt-0.5">
                {exp.title} · {exp.date}
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-3 flex justify-end px-2">
        <button
          onClick={handleMore}
          className="cursor-pointer text-[#1A73E8] text-[14px] font-semibold hover:underline px-4 py-1"
        >
          More
        </button>
      </div>
    </motion.div>
  )
}

/** Top-level experience panel — toggles between DEFAULT and VIEW_MORE. */
export function ExperiencePanel() {
  const { view } = useSnapshot(appStore)
  return (
    <AnimatePresence mode="wait" initial={false}>
      {view === 'VIEW_MORE' ? <MoreView /> : <DefaultView />}
    </AnimatePresence>
  )
}
