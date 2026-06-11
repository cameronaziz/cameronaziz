import { forwardRef, type ComponentType } from 'react'
import { useLocation } from 'wouter'
import { track } from '../../analytics'

type Screen = 'email' | 'calendar' | 'chat' | 'video'

const SCREEN_PATHS: Record<Screen, string> = {
  email: '/',
  calendar: '/calendar',
  chat: '/chat',
  video: '/video',
}

function currentScreen(path: string): Screen {
  if (path.startsWith('/calendar')) return 'calendar'
  if (path.startsWith('/chat')) return 'chat'
  if (path.startsWith('/video')) return 'video'
  return 'email'
}

interface ActionButtonProps {
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  screen: Screen
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ icon: Icon, label, screen }, ref) => {
    const [location, navigate] = useLocation()
    const isActive = currentScreen(location) === screen

    return (
      <button
        ref={ref}
        className="flex flex-col items-center gap-1"
        onClick={() => {
          track('screen_viewed', { screen })
          navigate(SCREEN_PATHS[screen])
        }}
      >
        <div
          className={[
            'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
            isActive
              ? 'bg-prussian-300 text-dusk-100'
              : 'bg-prussian-100 text-dusk-900 hover:bg-prussian-200 cursor-pointer',
          ].join(' ')}
        >
          <Icon size={20} strokeWidth={2} />
        </div>
        <span
          className={[
            'text-[8px] font-medium uppercase text-dusk-900 tracking-wider',
            isActive ? '' : 'cursor-pointer',
          ].join(' ')}
        >
          {label}
        </span>
      </button>
    )
  },
)

ActionButton.displayName = 'ActionButton'
