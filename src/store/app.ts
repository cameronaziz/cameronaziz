import { proxy } from 'valtio'
import { EXPERIENCES } from '../data/experiences'

/** Top-level view state for the right panel. */
export const appStore = proxy<{
  view: 'DEFAULT' | 'VIEW_MORE'
  scale: number
}>({
  view: 'DEFAULT',
  scale: 1,
})

/** Experience panel state. */
export const experienceStore = proxy<{
  experiences: typeof EXPERIENCES
  tabs: string[]
  activeTab: string
  current: string | null
}>({
  experiences: EXPERIENCES,
  tabs: ['All', 'AI/ML', 'Platform', 'DX'],
  activeTab: 'All',
  current: null,
})
