import { useSnapshot } from 'valtio'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useLocation } from 'wouter'
import { chatStore } from '../../store/chat'
import { track } from '../../analytics'

/**
 * Floating chat re-entry button pinned to the card's top-right corner.
 * Hidden until the visitor has sent at least one prompt, then it fades in.
 * Suppressed while the chat screen is already open.
 */
export function ChatLauncher() {
  const { messages } = useSnapshot(chatStore)
  const [location, navigate] = useLocation()

  const hasUserPrompt = messages.some((m) => m.role === 'user')
  const onChatScreen = location.startsWith('/chat')
  const visible = hasUserPrompt && !onChatScreen

  const handleClick = () => {
    track('chat_launcher_clicked', { from: location })
    navigate('/chat')
  }

  return (
    <motion.button
      type="button"
      aria-label="Open chat with Cameron's AI"
      onClick={handleClick}
      initial={false}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.85 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
      className="absolute top-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-prussian-400 text-white shadow-md transition-colors hover:bg-prussian-500 cursor-pointer"
    >
      <MessageCircle size={18} strokeWidth={2} />
    </motion.button>
  )
}
