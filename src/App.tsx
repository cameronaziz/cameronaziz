import { useEffect } from 'react'
import { useSnapshot } from 'valtio'
import { Router, Route, Switch, useLocation } from 'wouter'
import { AnimatePresence, motion } from 'framer-motion'
import { Header } from './components/Header'
import { ContactPanel } from './components/ContactPanel'
import { EmailPanel } from './components/panels/EmailPanel'
import { CalendarPanel } from './components/panels/CalendarPanel'
import { ChatPanel } from './components/panels/ChatPanel'
import { VideoPanel } from './components/panels/VideoPanel'
import { appStore } from './store/app'
import { track } from './analytics'

/** Returns a stable key for the right-panel tab so AnimatePresence can detect changes */
function useTabKey(location: string): string {
  if (location.startsWith('/calendar')) return 'calendar'
  if (location.startsWith('/chat')) return 'chat'
  if (location.startsWith('/video')) return 'video'
  return 'email'
}

function RightPanel() {
  const [location] = useLocation()
  const tabKey = useTabKey(location)

  return (
    <div className="relative flex-1 h-full">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tabKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.4 } }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          className="absolute inset-0"
        >
          <Switch location={location}>
            <Route path="/video" component={VideoPanel} />
            <Route path="/calendar/:rest*" component={CalendarPanel} />
            <Route path="/chat/:rest*" component={ChatPanel} />
            <Route component={EmailPanel} />
          </Switch>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function useScaleToFit() {
  useEffect(() => {
    function update() {
      const CARD_W = 940
      const CARD_H = 720
      const padding = 40
      const scaleX = (window.innerWidth - padding) / CARD_W
      const scaleY = (window.innerHeight - padding) / CARD_H
      appStore.scale = Math.min(1, scaleX, scaleY)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
}

export function App() {
  const { scale } = useSnapshot(appStore)
  useScaleToFit()

  useEffect(() => {
    track('page_viewed')
  }, [])

  return (
    <Router>
      <div className="h-screen w-screen bg-dusk-100 flex items-center justify-center font-sans overflow-hidden">
        <div
          className="bg-dusk-50 w-[940px] h-[720px] rounded-[32px] shadow-sm border border-gray-100 flex flex-col relative overflow-hidden"
          style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
        >
          <Header />

          {/* Horizontal rule */}
          <div className="px-10 shrink-0">
            <div className="h-[1px] w-full bg-gray-100" />
          </div>

          {/* Main content */}
          <div className="flex-1 flex px-10 pt-2 pb-8 gap-12 overflow-hidden relative">
            <ContactPanel />
            <RightPanel />
          </div>
        </div>
      </div>
    </Router>
  )
}
