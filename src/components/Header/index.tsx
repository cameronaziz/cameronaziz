import { Mail, Calendar, MessageSquare, Video } from 'lucide-react'
import { ActionButton } from './ActionButton'
import profileImg from '/cameron_aziz.png'

export function Header() {
  return (
    <div className="flex items-start gap-8 p-8 pb-6 shrink-0">
      <div className="w-32 h-32 bg-indigo-400 rounded-2xl overflow-hidden shrink-0">
        <img
          src={profileImg}
          alt="Cameron Aziz"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col flex-1">
        <h1 className="text-[48px] font-bold text-[#1F1F1F] tracking-tight leading-none mb-2 mt-1">
          Cameron Aziz
        </h1>
        <p className="text-[18px] text-[#5F6368] font-normal mb-8">
          Staff Engineer. React. AI/ML. GraphQL.
        </p>

        <div className="flex gap-4">
          <ActionButton icon={Mail} label="Email" screen="email" />
          <ActionButton icon={Calendar} label="Schedule" screen="calendar" />
          <ActionButton icon={MessageSquare} label="Chat" screen="chat" />
          <ActionButton icon={Video} label="Video" screen="video" />
        </div>
      </div>
    </div>
  )
}
