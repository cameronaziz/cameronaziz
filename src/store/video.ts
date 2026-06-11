import { proxy } from 'valtio'

export const videoStore = proxy<{
  playing: boolean
  muted: boolean
  progress: number
  duration: number
}>({
  playing: false,
  muted: false,
  progress: 0,
  duration: 0,
})

export const VIDEO_SRC = '/assets/cameron_aziz.mp4'
