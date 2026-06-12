import { useCallback, useMemo } from 'react'
import { useSnapshot } from 'valtio'
import { motion } from 'framer-motion'
import { ArrowLeft, Star, Reply, ChevronLeft, ChevronRight, X, FileText, Link2, Video } from 'lucide-react'
import { useLocation } from 'wouter'
import { experienceStore } from '../../store/app'
import { track } from '../../analytics'
import { openReply } from '../../store/email'
import type { Attachment } from '../../data/experiences'

function AttachmentIcon({ type }: { type: Attachment['type'] }) {
  if (type === 'link') return <Link2 size={14} />
  if (type === 'video') return <Video size={14} />
  return <FileText size={14} />
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
        isDisabled
          ? 'text-gray-300 cursor-default'
          : 'hover:bg-gray-100 text-gray-500 cursor-pointer',
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

  return (
    <motion.div
      key={`exp-${experienceId}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.2, 0.9, 0.2, 1] }}
      className="flex flex-col h-full w-full relative bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
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

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
        <p className="text-[14px] text-[#3C4043] leading-relaxed whitespace-pre-wrap">{exp.body}</p>

        {exp.attachments.length > 0 && (
          <div className="mt-4">
            <div className="text-[11px] font-semibold text-[#5F6368] uppercase tracking-wider mb-2">
              Attachments
            </div>
            <div className="flex flex-col gap-2">
              {exp.attachments.map((att) => (
                <div
                  key={att.name}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] ${att.color}`}
                >
                  <AttachmentIcon type={att.type} />
                  <span className="truncate flex-1 text-[#1F1F1F]">{att.name}</span>
                  <span className="text-[11px] text-gray-400">{att.size}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
