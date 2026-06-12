import { useCallback, useMemo } from 'react'
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
import { EXPERIENCES } from '../../data/experiences'
import { track } from '../../analytics'
import type { Attachment } from '../../data/experiences'

// ─── Toolbar icon button ──────────────────────────────────────────────────────

interface ToolbarButtonProps {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  onClick?: () => void
  isDisabled?: boolean
  className?: string
}

function ToolbarButton({ icon: Icon, onClick, isDisabled, className }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'p-2 rounded-full transition-colors',
        isDisabled
          ? 'text-gray-300'
          : 'hover:bg-gray-100 text-gray-500 cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Icon size={18} strokeWidth={2} />
    </button>
  )
}

// ─── Attachment icon ──────────────────────────────────────────────────────────

function AttachmentIcon({ type }: { type: Attachment['type'] }) {
  if (type === 'link') return <Link2 size={16} strokeWidth={2.5} />
  if (type === 'video') return <Video size={16} strokeWidth={2.5} />
  return <FileText size={16} strokeWidth={2.5} />
}

// ─── ExperienceDetail ─────────────────────────────────────────────────────────

export function ExperienceDetail({ experienceId }: { experienceId: string }) {
  const [, navigate] = useLocation()

  const exp = EXPERIENCES.find((e) => e.id === experienceId)

  const idx = EXPERIENCES.findIndex((e) => e.id === experienceId)
  const prevId = idx > 0 ? EXPERIENCES[idx - 1]!.id : null
  const nextId = idx < EXPERIENCES.length - 1 ? EXPERIENCES[idx + 1]!.id : null

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
    track('reply_opened', { experience_id: experienceId })
  }, [experienceId])

  const paragraphs = useMemo(
    () => exp?.body.split('\n\n').filter(Boolean) ?? [],
    [exp?.body],
  )

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
      className="flex flex-col h-full w-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative"
    >
      {/* Gmail-style toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white shrink-0">
        {/* Left: back, star, reply */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton icon={ArrowLeft} onClick={handleClose} />
          <ToolbarButton icon={Star} />
          <ToolbarButton icon={Reply} onClick={handleReply} />
          <div className="w-px h-5 bg-gray-200 mx-1.5" />
        </div>
        {/* Right: prev, next, divider, close */}
        <div className="flex items-center gap-0.5 pr-1">
          <ToolbarButton icon={ChevronLeft} onClick={handlePrev} isDisabled={!prevId} />
          <ToolbarButton icon={ChevronRight} onClick={handleNext} isDisabled={!nextId} />
          <div className="w-px h-5 bg-gray-200 mx-1.5" />
          <ToolbarButton icon={X} onClick={handleClose} />
        </div>
      </div>

      {/* Email body */}
      <div className="p-8 pt-4 flex-1 overflow-y-auto">
        {/* Subject line */}
        <h2 className="text-[18px] font-normal tracking-tight text-gray-900">
          {exp.title} at {exp.company}
        </h2>

        {/* Sender block */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#EEF0FE] flex items-center justify-center text-[#1A73E8] font-semibold text-[14px] border border-gray-100 shrink-0">
              CA
            </div>
            <div className="flex flex-col">
              <div className="font-semibold text-gray-900 text-[14px] flex items-center gap-1.5">
                Cameron Aziz{' '}
                <span className="font-normal text-gray-500">{'<hi@cameronaziz.com>'}</span>
                <ChevronDown size={14} className="text-gray-400 mt-0.5" />
              </div>
              <div className="text-[12px] text-gray-500 mt-0.5">to recruiters</div>
            </div>
          </div>
          <div className="text-[13px] text-gray-500 mt-1 shrink-0">{exp.date}</div>
        </div>

        {/* Email paragraphs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-gray-700 leading-relaxed space-y-5 text-[15px]"
        >
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </motion.div>

        {/* Attachments as pills */}
        {exp.attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mt-12 pt-6 border-t border-gray-100"
          >
            <div className="flex gap-3 flex-wrap">
              {exp.attachments.map((att, i) => (
                <div
                  key={i}
                  onClick={() =>
                    track('attachment_clicked', {
                      attachment_name: att.name,
                      experience_id: exp.id,
                    })
                  }
                  className="flex items-center gap-3 bg-white border border-gray-200 rounded-full pl-2 pr-4 py-1.5 hover:bg-gray-50 cursor-pointer w-[260px] group transition-colors"
                >
                  <div
                    className={`p-1.5 rounded-full flex items-center justify-center ${att.color}`}
                  >
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
  )
}
