import { useCallback, useMemo } from 'react'
import { useSnapshot } from 'valtio'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Star,
  Reply,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  FileText,
  Link2,
  Video,
} from 'lucide-react'
import { useLocation } from 'wouter'
import { experienceStore } from '../../store/app'
import { track } from '../../analytics'
import { openReply } from '../../store/email'
import type { Attachment } from '../../data/experiences'

function AttachmentIcon({ type }: { type: Attachment['type'] }) {
  if (type === 'link') return <Link2 size={16} strokeWidth={2.5} />
  if (type === 'video') return <Video size={16} strokeWidth={2.5} />
  return <FileText size={16} strokeWidth={2.5} />
}

interface HeaderButtonProps {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  onClick?: () => void
  isDisabled?: boolean
}

function HeaderButton({ icon: Icon, onClick, isDisabled = false }: HeaderButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={[
        'p-2 rounded-full transition-colors',
        isDisabled ? 'text-gray-300' : 'hover:bg-gray-100 text-gray-500 cursor-pointer',
      ].join(' ')}
    >
      <Icon size={18} strokeWidth={2} />
    </button>
  )
}

export function ExperienceDetail({ experienceId }: { experienceId: string }) {
  const { experiences } = useSnapshot(experienceStore)
  const [, navigate] = useLocation()

  const exp = experiences.find((e) => e.id === experienceId)

  const { prevId, nextId } = useMemo(() => {
    const idx = experiences.findIndex((e) => e.id === experienceId)
    return {
      prevId: idx > 0 ? experiences[idx - 1]!.id : null,
      nextId: idx !== -1 && idx < experiences.length - 1 ? experiences[idx + 1]!.id : null,
    }
  }, [experiences, experienceId])

  const handleClose = useCallback(() => {
    track('experience_detail_closed', { experience_id: experienceId })
    navigate('/')
  }, [navigate, experienceId])

  const handlePrev = useCallback(() => {
    if (!prevId) return
    track('experience_navigation', { direction: 'previous', experience_id: experienceId })
    navigate(`/experience/${prevId}`)
  }, [navigate, prevId, experienceId])

  const handleNext = useCallback(() => {
    if (!nextId) return
    track('experience_navigation', { direction: 'next', experience_id: experienceId })
    navigate(`/experience/${nextId}`)
  }, [navigate, nextId, experienceId])

  const handleReply = useCallback(() => {
    openReply(experienceId)
  }, [experienceId])

  if (!exp) {
    navigate('/')
    return null
  }

  const paragraphs = exp.body.split('\n\n').filter(Boolean)

  return (
    <motion.div
      key={`exp-${experienceId}`}
      initial={{ y: 15 }}
      animate={{ y: 0 }}
      exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.2, 0.9, 0.2, 1] }}
      className="h-full flex flex-col relative w-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.2, 0.9, 0.2, 1] }}
        className="flex flex-col h-full w-full relative"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-0.5">
            <HeaderButton icon={ArrowLeft} onClick={handleClose} />
            <HeaderButton icon={Star} />
            <HeaderButton icon={Reply} onClick={handleReply} />
            <div className="w-px h-5 bg-gray-200 mx-1.5" />
          </div>
          <div className="flex items-center gap-0.5 pr-1">
            <HeaderButton icon={ChevronLeft} onClick={handlePrev} isDisabled={!prevId} />
            <HeaderButton icon={ChevronRight} onClick={handleNext} isDisabled={!nextId} />
            <div className="w-px h-5 bg-gray-200 mx-1.5" />
            <HeaderButton icon={X} onClick={handleClose} />
          </div>
        </div>

        {/* Scrollable body */}
        <div className="p-8 pt-4 flex-1 overflow-y-auto">
          {/* Subject */}
          <h2 className="text-[18px] font-normal tracking-tight text-gray-900">
            {exp.title} at {exp.company}
          </h2>

          {/* Sender row */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9.5 h-9.5 rounded-full bg-[#EEF0FE] flex items-center justify-center text-[#1A73E8] font-semibold text-[14px] border border-gray-100">
                CA
              </div>
              <div className="flex flex-col">
                <div className="font-semibold text-gray-900 text-[14px] flex items-center gap-1.5">
                  Cameron Aziz{' '}
                  <span className="font-normal text-gray-500">&lt;hi@cameronaziz.com&gt;</span>
                  <ChevronDown size={14} className="text-gray-400 mt-0.5" aria-hidden="true" />
                </div>
                <div className="text-[12px] text-gray-500 mt-0.5">to recruiters</div>
              </div>
            </div>
            <div className="text-[13px] text-gray-500 mt-1">{exp.startDate} to {exp.endDate}</div>
          </div>

          {/* Body paragraphs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-gray-700 leading-relaxed space-y-5 text-[15px]"
          >
            {paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </motion.div>

          {/* Attachments */}
          {exp.attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-12 pt-6 border-t border-gray-100"
            >
              <div className="flex gap-3 flex-wrap">
                {exp.attachments.map((att) => (
                  <div
                    key={att.name}
                    className="flex items-center gap-3 bg-white border border-gray-200 rounded-full pl-2 pr-4 py-1.5 hover:bg-gray-50 cursor-pointer w-[260px] group transition-colors"
                  >
                    <div className={`p-1.5 rounded-full flex items-center justify-center ${att.color}`}>
                      <AttachmentIcon type={att.type} />
                    </div>
                    <div className="flex flex-col min-w-0 justify-center">
                      <span className="text-[13px] font-medium text-gray-900 truncate group-hover:text-[#1A73E8] transition-colors">
                        {att.name}
                      </span>
                      <span className="text-[11px] text-gray-400">{att.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
