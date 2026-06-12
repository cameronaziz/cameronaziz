import { useCallback } from 'react'
import { useSnapshot } from 'valtio'
import { motion } from 'framer-motion'
import { FileText, Link2, Video } from 'lucide-react'
import { useLocation } from 'wouter'
import { experienceStore } from '../../store/app'
import { track } from '../../analytics'
import type { Attachment } from '../../data/experiences'
import { ReplySection } from './ReplyComposer'

function AttachmentIcon({ type }: { type: Attachment['type'] }) {
  if (type === 'link') return <Link2 size={14} />
  if (type === 'video') return <Video size={14} />
  return <FileText size={14} />
}

export function ExperienceDetail({ experienceId }: { experienceId: string }) {
  const { experiences } = useSnapshot(experienceStore)
  const exp = experiences.find((e) => e.id === experienceId)
  const [, navigate] = useLocation()

  const handleBack = useCallback(() => {
    track('experience_back_clicked', { experience_id: experienceId })
    navigate('/')
  }, [navigate, experienceId])

  if (!exp) {
    navigate('/')
    return null
  }

  return (
    <motion.div
      key={`exp-${experienceId}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full w-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 shrink-0">
        <button
          onClick={handleBack}
          className="text-[#1A73E8] text-[13px] font-medium hover:underline"
        >
          ← Back
        </button>
        <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-100">
          <img src={exp.logo} alt={exp.company} className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="text-[14px] font-semibold text-[#1F1F1F]">{exp.company}</div>
          <div className="text-[12px] text-[#5F6368]">{exp.title} · {exp.date}</div>
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

      {/* Reply footer — pinned, always visible without scrolling */}
      <div className="shrink-0 px-6 pt-3 pb-4 border-t border-dusk-100">
        <ReplySection experienceId={experienceId} />
      </div>
    </motion.div>
  )
}
