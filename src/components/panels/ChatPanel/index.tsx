import { useEffect, useRef, useCallback } from 'react'
import { useSnapshot } from 'valtio'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { chatStore, sendMessage } from '../../../store/chat'

function Message({ role, content }: { role: string; content: string }) {
  const isUser = role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={['flex', isUser ? 'justify-end' : 'justify-start'].join(' ')}
    >
      <div
        className={[
          'max-w-[80%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed',
          isUser
            ? 'bg-prussian-400 text-white rounded-br-sm'
            : 'bg-[#F1F3F4] text-[#1F1F1F] rounded-bl-sm',
        ].join(' ')}
      >
        {content || (
          <span className="flex gap-1 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        )}
      </div>
    </motion.div>
  )
}

export function ChatPanel() {
  const { messages, draft, isLoading } = useSnapshot(chatStore)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, messages[messages.length - 1]?.content.length])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    },
    [],
  )

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="mt-1 mb-4 shrink-0">
        <div className="text-[10px] font-bold text-[#5F6368] tracking-widest uppercase">Chat with Cameron's AI</div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 bg-white rounded-[24px] overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <Message key={msg.id} role={msg.role} content={msg.content} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="pt-3 shrink-0 border-t border-dusk-100">
        <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2">
          <textarea
            value={draft}
            onChange={(e) => { chatStore.draft = e.target.value }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Cameron's work…"
            rows={1}
            className="flex-1 bg-transparent text-[13px] text-[#1F1F1F] placeholder:text-gray-400 outline-none resize-none max-h-[80px]"
          />
          <button
            onClick={sendMessage}
            disabled={!draft.trim() || isLoading}
            className={[
              'p-2 rounded-xl transition-colors shrink-0',
              draft.trim() && !isLoading
                ? 'bg-prussian-400 text-white hover:bg-prussian-500 cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
            ].join(' ')}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
