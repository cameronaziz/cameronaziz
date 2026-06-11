import { useRef, useCallback } from 'react'
import { useSnapshot } from 'valtio'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { videoStore, VIDEO_SRC } from '../../../store/video'
import { track } from '../../../analytics'

function ProgressBar({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement | null> }) {
  const { progress } = useSnapshot(videoStore)
  const barRef = useRef<HTMLDivElement>(null)

  const seek = useCallback(
    (clientX: number) => {
      const bar = barRef.current
      const video = videoRef.current
      if (!bar || !video) return
      const { left, width } = bar.getBoundingClientRect()
      const p = Math.max(0, Math.min(1, (clientX - left) / width))
      video.currentTime = p * video.duration
      videoStore.progress = p
    },
    [videoRef],
  )

  return (
    <div
      ref={barRef}
      className="w-full h-1 rounded-full bg-dusk-700 cursor-pointer relative group"
      onMouseDown={(e) => {
        seek(e.clientX)
        const onMove = (ev: MouseEvent) => seek(ev.clientX)
        const onUp = () => {
          track('video_scrubbed', { progress: videoStore.progress, duration: videoStore.duration })
          window.removeEventListener('mousemove', onMove)
          window.removeEventListener('mouseup', onUp)
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
      }}
    >
      <div
        className="h-full rounded-full bg-prussian-400 relative"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  )
}

export function VideoPanel() {
  const { playing, muted } = useSnapshot(videoStore)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      videoStore.playing = true
      track('video_played', { progress: videoStore.progress, duration: videoStore.duration })
    } else {
      v.pause()
      videoStore.playing = false
      track('video_paused', { progress: videoStore.progress, duration: videoStore.duration })
    }
  }, [])

  const toggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    videoStore.muted = v.muted
    track(v.muted ? 'video_muted' : 'video_unmuted', { progress: videoStore.progress })
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full rounded-3xl overflow-hidden bg-black flex flex-col"
    >
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        className="flex-1 min-h-0 w-full object-cover cursor-pointer"
        playsInline
        onClick={togglePlay}
        onTimeUpdate={() => {
          const v = videoRef.current
          if (!v) return
          videoStore.progress = v.currentTime / v.duration
        }}
        onLoadedMetadata={() => {
          const v = videoRef.current
          if (!v) return
          videoStore.duration = v.duration
        }}
        onEnded={() => {
          videoStore.playing = false
          videoStore.progress = 1
          track('video_completed', { duration: videoStore.duration })
        }}
      />

      {/* Controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex flex-col gap-2">
        <ProgressBar videoRef={videoRef} />
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="text-white hover:text-prussian-200 transition-colors"
          >
            {playing ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            onClick={toggleMute}
            className="text-white hover:text-prussian-200 transition-colors"
          >
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>

      {/* Big play button when not playing */}
      {!playing && videoStore.progress < 0.99 && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
            <Play size={28} className="text-white ml-1" />
          </div>
        </button>
      )}
    </div>
  )
}
