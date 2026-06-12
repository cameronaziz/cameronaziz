import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react'
import { useSnapshot } from 'valtio'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, AlignLeft, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  calendarStore,
  sendCalendarInvite,
  clearContactErrorsIfSatisfied,
  type Guest,
} from '../../../store/calendar'
import { track } from '../../../analytics'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cx(...args: (string | false | null | undefined)[]): string {
  return args.filter(Boolean).join(' ')
}

function formatTime(hour: number, minute: number): string {
  const period = hour < 12 ? 'am' : 'pm'
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h}:${String(minute).padStart(2, '0')}${period}`
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const PST_OFFSET_MS = -480 * 60 * 1000
const LOOKAHEAD_MS = 10800 * 1000

function nowPST(): Date {
  return new Date(Date.now() + PST_OFFSET_MS + new Date().getTimezoneOffset() * 60_000)
}

// ─── Panel layout ─────────────────────────────────────────────────────────────

function PanelTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-bold text-[#5F6368] tracking-widest uppercase">{children}</div>
}
function PanelSubtitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-normal text-[#9AA0A6] mt-0.5">{children}</div>
}
function PanelHeaderComp({ children }: { children: React.ReactNode }) {
  return <div className="mt-1 mb-4 shrink-0">{children}</div>
}
PanelHeaderComp.Title = PanelTitle
PanelHeaderComp.Subtitle = PanelSubtitle

function PanelBody({ children, isCard }: { children: React.ReactNode; isCard?: boolean }) {
  return (
    <div className={cx('flex-1 min-h-0 flex flex-col overflow-hidden', isCard ? 'bg-white rounded-[24px]' : undefined)}>
      {children}
    </div>
  )
}

function PanelFooter({ children, isBordered }: { children: React.ReactNode; isBordered?: boolean }) {
  return (
    <div className={cx('pt-3 shrink-0', isBordered ? 'border-t border-dusk-100' : undefined)}>
      {children}
    </div>
  )
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="w-full h-full flex flex-col">{children}</div>
}
Panel.Header = PanelHeaderComp
Panel.Body = PanelBody
Panel.Footer = PanelFooter

// ─── Chip email field ─────────────────────────────────────────────────────────
//
// The email input is a contentEditable div that holds email addresses as
// inline chip-spans. This matches the deployed implementation.

// Re-use the same Guest shape from the store (same fields).
type ChipData = Guest

type ChipState = 'static' | 'selected' | 'editing'

const CHIP_BASE =
  'inline-flex items-center px-1.5 py-0.5 rounded text-[12px] mx-0.5 align-middle select-none'

function chipClass(state: ChipState, invalid = false): string {
  if (state === 'static') return cx(CHIP_BASE, 'bg-blue-50 text-blue-700 shadow-[inset_0_0_0_0.5px_#60a5fa]')
  if (state === 'selected') return cx(CHIP_BASE, 'bg-blue-200 text-blue-900')
  return cx(
    CHIP_BASE,
    invalid
      ? 'bg-gray-50 border border-red-400 text-red-600 outline-none'
      : 'bg-gray-50 border border-blue-400 text-blue-700 outline-none',
  )
}

function makeChip(address: string, state: ChipState = 'static', invalid = false): HTMLSpanElement {
  const s = document.createElement('span')
  s.setAttribute('data-chip', '')
  s.setAttribute('data-chip-state', state)
  s.contentEditable = state === 'editing' ? 'true' : 'false'
  s.className = chipClass(state, invalid)
  s.textContent = address
  return s
}

function getChips(div: HTMLElement): HTMLSpanElement[] {
  return Array.from(div.querySelectorAll<HTMLSpanElement>('[data-chip]'))
}

function chipState(span: HTMLElement | null): ChipState {
  return (span?.getAttribute('data-chip-state') as ChipState) ?? 'static'
}

function setChipState(span: HTMLElement, state: ChipState, invalid = false): void {
  span.setAttribute('data-chip-state', state)
  span.contentEditable = state === 'editing' ? 'true' : 'false'
  span.className = chipClass(state, invalid)
}

function setCaret(node: Text | null, offset: number): void {
  if (!node) return
  const clamped = Math.max(0, Math.min(offset, node.length))
  const range = document.createRange()
  range.setStart(node, clamped)
  range.collapse(true)
  const sel = window.getSelection()
  if (sel) { sel.removeAllRanges(); sel.addRange(range) }
}

function caretAtStart(span: HTMLElement): void {
  const first = span.firstChild instanceof Text ? span.firstChild : null
  setCaret(first, 0)
}

function caretAtEnd(span: HTMLElement): void {
  const last = span.firstChild instanceof Text ? span.firstChild : null
  if (last) setCaret(last, last.length)
}

function trailingText(div: HTMLElement): Text {
  if (!(div.lastChild instanceof Text)) div.appendChild(document.createTextNode(''))
  return div.lastChild as Text
}

function getCaret(): { node: Node; offset: number } | null {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return null
  const r = sel.getRangeAt(0)
  return r.collapsed ? { node: r.startContainer, offset: r.startOffset } : null
}

// Convert email-shaped text nodes inside the div into chip spans and return
// the number of chips created.
function scanAndCommit(div: HTMLElement): number {
  let count = 0
  for (const node of Array.from(div.childNodes)) {
    if (!(node instanceof Text)) continue
    const text = node.textContent ?? ''
    if (!text.split(/\s+/).some((t) => EMAIL_RE.test(t.trim()))) continue
    const frag = document.createDocumentFragment()
    const re = /[^\s@]+@[^\s@]+\.[^\s@]+/g
    let last = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      const addr = m[0]
      if (!EMAIL_RE.test(addr)) continue
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)))
      frag.appendChild(makeChip(addr, 'static'))
      count++
      last = m.index + addr.length
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)))
    div.replaceChild(frag, node)
  }
  return count
}

// Reconcile DOM chips → store (called after DOM mutations).
function reconcile(
  div: HTMLElement,
  onAdd: (c: ChipData) => void,
  onRemove: (i: number) => void,
  chips: readonly ChipData[],
): void {
  const domAddrs = getChips(div)
    .filter((s) => chipState(s) !== 'editing')
    .map((s) => s.textContent ?? '')
  const storeAddrs = chips.map((c) => c.address)

  // Chips removed from DOM → remove from store (reverse to preserve indices)
  for (let i = storeAddrs.length - 1; i >= 0; i--) {
    if (!domAddrs.includes(storeAddrs[i]!)) onRemove(i)
  }
  // Chips added in DOM → add to store
  const known = new Set(storeAddrs)
  for (const addr of domAddrs) {
    if (!known.has(addr)) onAdd({ address: addr, editable: true, isValid: true })
  }
}

interface UseChipFieldOptions {
  chips: readonly ChipData[]
  onAdd: (chip: ChipData) => void
  onRemove: (index: number) => void
  onFocused?: () => void
}

function useChipField({ chips, onAdd, onRemove, onFocused }: UseChipFieldOptions) {
  const ref = useRef<HTMLDivElement>(null)
  const [isInvalid, setIsInvalid] = useState(false)
  const savedText = useRef('')

  // Populate DOM from chips on first mount.
  useEffect(() => {
    const div = ref.current
    if (!div || div.childNodes.length > 0) return
    for (const chip of chips) div.appendChild(makeChip(chip.address, 'static'))
    div.appendChild(document.createTextNode(''))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync chips prop → DOM when store changes externally.
  useEffect(() => {
    const div = ref.current
    if (!div) return
    const domAddrs = new Set(getChips(div).map((s) => s.textContent ?? ''))
    for (const chip of chips) {
      if (!domAddrs.has(chip.address)) {
        div.insertBefore(makeChip(chip.address, 'static'), trailingText(div))
      }
    }
  }, [chips])

  useEffect(() => {
    const div = ref.current
    if (!div) return

    const commitChip = (span: HTMLElement): boolean => {
      const text = (span.textContent ?? '').trim()
      if (EMAIL_RE.test(text)) {
        span.textContent = text
        setChipState(span, 'static')
        setIsInvalid(false)
        return true
      }
      setIsInvalid(true)
      setChipState(span, 'editing', true)
      return false
    }

    const revertChip = (span: HTMLElement): void => {
      span.textContent = savedText.current
      setChipState(span, 'static')
      setIsInvalid(false)
    }

    const startEditing = (span: HTMLElement, dir: 'left' | 'right'): void => {
      savedText.current = span.textContent ?? ''
      setChipState(span, 'editing')
      setIsInvalid(false)
      span.focus()
      dir === 'left' ? caretAtStart(span) : caretAtEnd(span)
    }

    const onKeydown = (e: KeyboardEvent) => {
      const editing = div.querySelector<HTMLSpanElement>('[data-chip-state="editing"]')
      const selected = div.querySelector<HTMLSpanElement>('[data-chip-state="selected"]')
      const caret = getCaret()

      if (editing) {
        if (e.key === 'Escape') { e.preventDefault(); revertChip(editing); div.focus() }
        else if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault()
          if (commitChip(editing)) {
            trailingText(div); div.focus()
            setTimeout(() => reconcile(div, onAdd, onRemove, chips), 0)
          }
        }
        return
      }

      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        const committed = scanAndCommit(div)
        if (committed > 0) {
          trailingText(div)
          setTimeout(() => { reconcile(div, onAdd, onRemove, chips); setIsInvalid(false) }, 0)
        } else if (caret?.node instanceof Text) {
          const val = (caret.node.textContent ?? '').trim()
          if (EMAIL_RE.test(val)) {
            const chip = makeChip(val, 'static')
            caret.node.textContent = ''
            div.insertBefore(chip, caret.node)
            trailingText(div)
            onAdd({ address: val, editable: true, isValid: true })
            setIsInvalid(false)
          } else if (val.length > 0) {
            setIsInvalid(true)
          }
        }
      } else if (e.key === 'Backspace') {
        if (selected) {
          e.preventDefault()
          const idx = getChips(div).indexOf(selected)
          selected.remove()
          if (idx >= 0) onRemove(idx)
          setIsInvalid(false)
        } else if (caret && caret.offset === 0) {
          const prev = caret.node.previousSibling
          if (prev instanceof HTMLElement && prev.hasAttribute('data-chip')) {
            e.preventDefault()
            // Deselect all, then select this chip
            getChips(div).forEach((s) => setChipState(s, 'static'))
            setChipState(prev, 'selected')
          }
        }
      } else if (e.key === 'Delete') {
        if (selected) {
          e.preventDefault()
          const idx = getChips(div).indexOf(selected)
          selected.remove()
          if (idx >= 0) onRemove(idx)
        }
      } else if (e.key === 'ArrowLeft') {
        if (selected) {
          e.preventDefault()
          const all = getChips(div)
          const idx = all.indexOf(selected)
          setChipState(selected, 'static')
          if (idx > 0) setChipState(all[idx - 1]!, 'selected')
        } else if (caret && caret.offset === 0) {
          const prev = caret.node.previousSibling
          if (prev instanceof HTMLElement && prev.hasAttribute('data-chip')) {
            e.preventDefault()
            startEditing(prev, 'left')
          }
        }
      } else if (e.key === 'ArrowRight') {
        if (selected) {
          e.preventDefault()
          const all = getChips(div)
          const idx = all.indexOf(selected)
          setChipState(selected, 'static')
          if (idx < all.length - 1) setChipState(all[idx + 1]!, 'selected')
          else { const t = trailingText(div); setCaret(t, 0) }
        }
      } else if (e.key.length === 1 && selected) {
        e.preventDefault()
        startEditing(selected, 'right')
        selected.textContent = (selected.textContent ?? '') + e.key
      }
    }

    const onClick = (e: MouseEvent) => {
      const chip = (e.target as HTMLElement).closest<HTMLSpanElement>('[data-chip]')
      if (chip && chipState(chip) !== 'editing') {
        getChips(div).forEach((s) => { if (s !== chip) setChipState(s, 'static') })
        setChipState(chip, 'selected')
        return
      }
      if (!chip) getChips(div).forEach((s) => { if (chipState(s) === 'selected') setChipState(s, 'static') })
    }

    const onBlur = (e: FocusEvent) => {
      if (div.contains(e.relatedTarget as Node)) return
      const editing = div.querySelector<HTMLSpanElement>('[data-chip-state="editing"]')
      if (editing) commitChip(editing)
      getChips(div).forEach((s) => { if (chipState(s) !== 'editing') setChipState(s, 'static') })
      setIsInvalid(false)
    }

    const onInput = () => {
      const editing = div.querySelector<HTMLSpanElement>('[data-chip-state="editing"]')
      if (!editing) setIsInvalid(false)
    }

    div.addEventListener('keydown', onKeydown)
    div.addEventListener('click', onClick)
    div.addEventListener('blur', onBlur, true)
    div.addEventListener('input', onInput)

    return () => {
      div.removeEventListener('keydown', onKeydown)
      div.removeEventListener('click', onClick)
      div.removeEventListener('blur', onBlur, true)
      div.removeEventListener('input', onInput)
    }
  }, [chips, onAdd, onRemove])

  const focusField = useCallback(() => {
    const div = ref.current
    if (!div) return
    div.focus()
    const t = trailingText(div)
    setCaret(t, t.length)
  }, [])

  return { ref, isInvalid, focusField }
}

// ─── ChipEmailField ───────────────────────────────────────────────────────────

interface ChipEmailFieldProps {
  chips: readonly ChipData[]
  onAdd: (chip: ChipData) => void
  onRemove: (index: number) => void
  /** Show a red ring when true (phone-or-email validation failed). */
  error: boolean
  /** Called when the field is focused, so the other input can lose its red border. */
  onFocused: () => void
}

function ChipEmailField({ chips, onAdd, onRemove, error, onFocused }: ChipEmailFieldProps) {
  const { ref, isInvalid, focusField } = useChipField({ chips, onAdd, onRemove, onFocused })

  return (
    <div
      className="flex items-center gap-2 min-h-6 cursor-text"
      onClick={focusField}
    >
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={chips.length === 0 ? 'email@example.com' : undefined}
        className={cx(
          'flex-1 outline-none min-w-30 text-[13px] rounded-lg px-2 py-1',
          'empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300',
          error
            ? 'ring-1 ring-red-500 bg-red-50'
            : 'bg-gray-100',
          isInvalid ? 'text-red-500' : 'text-gray-700',
        )}
      />
    </div>
  )
}

// ─── SaveButton ───────────────────────────────────────────────────────────────

const SAVE_LABEL: Record<string, string> = {
  idle: 'Save',
  sending: 'Sending…',
  sent: 'Sent!',
  error: 'Try again',
}

function SaveButton() {
  const { sendStatus } = useSnapshot(calendarStore)
  const handleSave = useCallback(() => {
    track('calendar_invite_attempted')
    sendCalendarInvite()
  }, [])
  return (
    <div className="flex justify-end px-4 pb-1">
      <button
        onClick={handleSave}
        disabled={sendStatus === 'sending' || sendStatus === 'sent'}
        className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-lg transition-colors cursor-pointer"
      >
        {SAVE_LABEL[sendStatus] ?? 'Save'}
      </button>
    </div>
  )
}

// ─── DateCell ─────────────────────────────────────────────────────────────────

interface DateCellData { day: number; month: number; year: number; overflow: boolean }

interface DateCellProps {
  cell: DateCellData
  selectedDate: Date
  todayPST: Date
  earliestDate: Date
  onClick: () => void
}

function DateCell({ cell, selectedDate, todayPST, earliestDate, onClick }: DateCellProps) {
  const cellDate = new Date(cell.year, cell.month, cell.day)
  const disabled = cellDate < earliestDate
  const selected =
    !cell.overflow &&
    selectedDate.getFullYear() === cell.year &&
    selectedDate.getMonth() === cell.month &&
    selectedDate.getDate() === cell.day
  const isToday =
    !cell.overflow &&
    todayPST.getFullYear() === cell.year &&
    todayPST.getMonth() === cell.month &&
    todayPST.getDate() === cell.day

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'text-[13px] h-9 w-9 mx-auto flex items-center justify-center rounded-full transition-colors',
        selected && 'bg-blue-500 text-white font-medium',
        !selected && isToday && 'text-blue-500 font-medium hover:bg-blue-50 cursor-pointer',
        !selected && !isToday && !cell.overflow && !disabled && 'text-[#1F1F1F] hover:bg-blue-50 cursor-pointer',
        !selected && (cell.overflow || disabled) && 'text-gray-300 cursor-default',
      )}
    >
      {cell.day}
    </button>
  )
}

// ─── DatePicker ───────────────────────────────────────────────────────────────

function DatePicker({ onClose }: { onClose: () => void }) {
  const { date, startHour, startMinute } = useSnapshot(calendarStore)
  const todayPST = useMemo(() => nowPST(), [])
  const earliest = useMemo(() => {
    const e = new Date(todayPST.getTime() + LOOKAHEAD_MS)
    return new Date(e.getFullYear(), e.getMonth(), e.getDate())
  }, [todayPST])

  const [viewYear, setViewYear] = useState(date.getFullYear())
  const [viewMonth, setViewMonth] = useState(date.getMonth())

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
    track('calendar_month_navigated', { direction: 'previous' })
  }, [viewMonth])

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
    track('calendar_month_navigated', { direction: 'next' })
  }, [viewMonth])

  const cells = useMemo<DateCellData[]>(() => {
    const firstDow = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const prevDays = new Date(viewYear, viewMonth, 0).getDate()
    const prevMonth_ = viewMonth === 0 ? 11 : viewMonth - 1
    const prevYear_ = viewMonth === 0 ? viewYear - 1 : viewYear
    const nextMonth_ = viewMonth === 11 ? 0 : viewMonth + 1
    const nextYear_ = viewMonth === 11 ? viewYear + 1 : viewYear

    const out: DateCellData[] = []
    for (let i = firstDow - 1; i >= 0; i--)
      out.push({ day: prevDays - i, month: prevMonth_, year: prevYear_, overflow: true })
    for (let d = 1; d <= daysInMonth; d++)
      out.push({ day: d, month: viewMonth, year: viewYear, overflow: false })
    for (let d = 1; out.length < 42; d++)
      out.push({ day: d, month: nextMonth_, year: nextYear_, overflow: true })
    return out
  }, [viewYear, viewMonth])

  const selectDay = useCallback((cell: DateCellData) => {
    const picked = new Date(cell.year, cell.month, cell.day)
    if (picked < earliest) return
    calendarStore.date = picked
    // If selected is the earliest day, ensure start time is after the cutoff
    if (
      picked.getFullYear() === earliest.getFullYear() &&
      picked.getMonth() === earliest.getMonth() &&
      picked.getDate() === earliest.getDate()
    ) {
      const e = new Date(todayPST.getTime() + LOOKAHEAD_MS)
      const cutoffH = e.getMinutes() < 30 ? e.getHours() : e.getHours() + 1
      const cutoffM = e.getMinutes() < 30 ? 30 : 0
      if (startHour * 60 + startMinute < cutoffH * 60 + cutoffM) {
        calendarStore.startHour = cutoffH < 7 ? 7 : cutoffH
        calendarStore.startMinute = cutoffH < 7 ? 0 : cutoffM
      }
    }
    track('calendar_date_selected', {
      date: `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`,
    })
    onClose()
  }, [earliest, todayPST, startHour, startMinute, onClose])

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 w-[280px]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[15px] font-semibold text-[#1F1F1F]">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer">
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          <button onClick={nextMonth} className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer">
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map((d, i) => (
          <div key={i} className="text-center text-[12px] text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => (
          <DateCell
            key={i}
            cell={cell}
            selectedDate={date}
            todayPST={todayPST}
            earliestDate={earliest}
            onClick={() => selectDay(cell)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── TimePicker ───────────────────────────────────────────────────────────────

interface TimeSlotData { hour: number; minute: number; label: string }

interface TimeSlotProps {
  slot: TimeSlotData
  selected: boolean
  disabled: boolean
  onClick: () => void
}

function TimeSlot({ slot, selected, disabled, onClick }: TimeSlotProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-selected={selected ? 'true' : 'false'}
      className={cx(
        'w-full text-left px-4 py-2.5 text-[14px] transition-colors',
        selected && 'bg-blue-50 text-[#1F1F1F]',
        !selected && !disabled && 'text-[#1F1F1F] hover:bg-gray-50 cursor-pointer',
        disabled && 'text-gray-300 cursor-default',
      )}
    >
      {slot.label}
    </button>
  )
}

function TimePicker({ mode, onClose }: { mode: 'start' | 'end'; onClose: () => void }) {
  const { date, startHour, startMinute } = useSnapshot(calendarStore)
  const scrollRef = useRef<HTMLDivElement>(null)
  const todayPST = useMemo(() => nowPST(), [])
  const earliest = useMemo(() => new Date(todayPST.getTime() + LOOKAHEAD_MS), [todayPST])
  const isEarliestDay = useMemo(() => {
    const d = new Date(earliest.getFullYear(), earliest.getMonth(), earliest.getDate())
    return (
      date.getFullYear() === d.getFullYear() &&
      date.getMonth() === d.getMonth() &&
      date.getDate() === d.getDate()
    )
  }, [date, earliest])

  // End time is start + 30 min
  const endHour = Math.floor((startHour * 60 + startMinute + 30) / 60)
  const endMinute = (startHour * 60 + startMinute + 30) % 60
  const selHour = mode === 'start' ? startHour : endHour
  const selMinute = mode === 'start' ? startMinute : endMinute

  const slots = useMemo<TimeSlotData[]>(() => {
    const out: TimeSlotData[] = []
    for (let h = 7; h < 22; h++)
      for (const m of [0, 30])
        out.push({ hour: h, minute: m, label: formatTime(h, m) })
    if (mode === 'end') out.push({ hour: 22, minute: 0, label: formatTime(22, 0) })
    return out
  }, [mode])

  // Earliest selectable minute-of-day on the earliest allowed day
  const cutoffMOD = useMemo(() => {
    if (!isEarliestDay) return 0
    return earliest.getMinutes() < 30
      ? earliest.getHours() * 60 + 30
      : (earliest.getHours() + 1) * 60
  }, [isEarliestDay, earliest])

  const isDisabled = useCallback((slot: TimeSlotData) => {
    if (mode === 'start') return isEarliestDay && slot.hour * 60 + slot.minute < cutoffMOD
    const startMOD = slot.hour * 60 + slot.minute - 30
    return startMOD < 420 || (isEarliestDay && startMOD < cutoffMOD)
  }, [mode, isEarliestDay, cutoffMOD])

  const selectSlot = useCallback((slot: TimeSlotData) => {
    track('calendar_time_selected', { mode, time: slot.label })
    if (mode === 'start') {
      calendarStore.startHour = slot.hour
      calendarStore.startMinute = slot.minute
    } else {
      const startMOD = slot.hour * 60 + slot.minute - 30
      calendarStore.startHour = Math.floor(startMOD / 60)
      calendarStore.startMinute = startMOD % 60
    }
    onClose()
  }, [mode, onClose])

  // Scroll to selected slot on open
  useEffect(() => {
    const div = scrollRef.current
    if (!div) return
    const sel = div.querySelector<HTMLButtonElement>('[data-selected="true"]')
    if (sel) div.scrollTop = sel.offsetTop - div.clientHeight / 2 + sel.clientHeight / 2
  }, [])

  return (
    <div ref={scrollRef} className="bg-white rounded-2xl shadow-lg border border-gray-100 w-[160px] max-h-[240px] overflow-y-auto py-1">
      {slots.map((slot, i) => (
        <TimeSlot
          key={i}
          slot={slot}
          selected={slot.hour === selHour && slot.minute === selMinute}
          disabled={isDisabled(slot)}
          onClick={() => selectSlot(slot)}
        />
      ))}
    </div>
  )
}

// ─── CalendarFormBody ─────────────────────────────────────────────────────────
//
// The scrollable form body rendered inside Panel.Body.

type PickerKey = 'date' | 'start' | 'end'

interface CalendarFormBodyProps {
  openPicker: PickerKey | null
  onOpenPicker: (key: PickerKey, leftPx: number) => void
  onClosePicker: () => void
}

function CalendarFormBody({ openPicker, onOpenPicker, onClosePicker }: CalendarFormBodyProps) {
  const { guests, date, startHour, startMinute, emailError, phoneError } =
    useSnapshot(calendarStore)

  const dateRef = useRef<HTMLButtonElement>(null)
  const startRef = useRef<HTMLButtonElement>(null)
  const endRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const endHour = Math.floor((startHour * 60 + startMinute + 30) / 60)
  const endMinute = (startHour * 60 + startMinute + 30) % 60

  const dateLabel = useMemo(() => {
    const today = nowPST()
    if (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    ) {
      return `Today, ${MONTHS[date.getMonth()]} ${date.getDate()}`
    }
    return `${FULL_DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`
  }, [date])

  const openFor = useCallback((key: PickerKey) => {
    if (openPicker === key) { onClosePicker(); return }
    track('calendar_picker_opened', { picker: key })
    const refMap = { date: dateRef, start: startRef, end: endRef }
    const btn = refMap[key].current
    const container = containerRef.current
    if (btn && container) {
      const left = btn.getBoundingClientRect().left - container.getBoundingClientRect().left
      onOpenPicker(key, left)
    } else {
      onOpenPicker(key, 0)
    }
  }, [openPicker, onOpenPicker, onClosePicker])

  const btnClass = (key: PickerKey) =>
    cx(
      'px-2 py-1 rounded text-[13px] font-normal transition-colors cursor-pointer focus:outline-none',
      openPicker === key ? 'bg-gray-100 text-[#1F1F1F]' : 'text-[#1F1F1F] hover:bg-gray-100',
    )

  const onAdd = useCallback((chip: ChipData) => {
    calendarStore.guests.push(chip)
    calendarStore.emailError = false
    calendarStore.phoneError = false
    track('calendar_guest_added', { guest_count: calendarStore.guests.length })
  }, [])

  const onRemove = useCallback((i: number) => {
    // Protect the first (non-editable) guest
    if (i === 0) return
    calendarStore.guests.splice(i, 1)
    track('calendar_guest_removed', { guest_count: calendarStore.guests.length })
  }, [])

  const onEmailFocused = useCallback(() => {
    calendarStore.phoneError = false
  }, [])

  const onPhoneFocus = useCallback(() => {
    calendarStore.emailError = false
  }, [])

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      {/* Date / time row */}
      <div className="flex items-center gap-4 px-6 py-4" data-datetime-row>
        <Calendar size={18} className="text-gray-400 shrink-0" />
        <div className="flex items-center gap-1 flex-wrap">
          <button ref={dateRef} onClick={() => openFor('date')} className={cx(btnClass('date'), '-ml-2')}>
            {dateLabel}
          </button>
          <button ref={startRef} onClick={() => openFor('start')} className={cx(btnClass('start'), 'ml-2')}>
            {formatTime(startHour, startMinute)}
          </button>
          <span className="text-[13px] text-gray-400">–</span>
          <button ref={endRef} onClick={() => openFor('end')} className={btnClass('end')}>
            {formatTime(endHour, endMinute)}
          </button>
        </div>
      </div>

      <div className="mx-6 h-[1px] bg-gray-100" />

      {/* Guests / email row */}
      <div className="flex items-center gap-4 px-6 py-4">
        {/* Material Design "People" icon */}
        <svg focusable="false" width="18" height="18" viewBox="0 0 24 24" className="text-gray-400 shrink-0 fill-gray-400">
          <path d="M15 8c0-1.42-.5-2.73-1.33-3.76.42-.14.86-.24 1.33-.24 2.21 0 4 1.79 4 4s-1.79 4-4 4c-.43 0-.84-.09-1.23-.21-.03-.01-.06-.02-.1-.03A5.98 5.98 0 0 0 15 8zm1.66 5.13C18.03 14.06 19 15.32 19 17v3h4v-3c0-2.18-3.58-3.47-6.34-3.87zM9 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m0 9c-2.7 0-5.8 1.29-6 2.01V18h12v-1c-.2-.71-3.3-2-6-2M9 4c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm0 9c2.67 0 8 1.34 8 4v3H1v-3c0-2.66 5.33-4 8-4z" />
        </svg>
        <div className="flex-1 bg-gray-100 rounded-lg pl-2 pr-8 py-1">
          <ChipEmailField
            chips={guests}
            onAdd={onAdd}
            onRemove={onRemove}
            error={emailError}
            onFocused={onEmailFocused}
          />
        </div>
      </div>

      <div className="mx-6 h-[1px] bg-gray-100" />

      {/* Google Meet row */}
      <div className="flex items-center gap-4 px-6 py-3">
        {/* Google Meet icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 192 192" className="shrink-0">
          <path fill="none" d="M0 0h192v192H0z" />
          <path fill="#00832D" d="M108 96l17.06 19.5L148 130.16l4-34.03-4-33.28-23.38 12.88z" />
          <path fill="#0066DA" d="M9 127v29c0 6.63 5.37 12 12 12h29l6-21.92L50 127l-19.9-6L9 127z" />
          <path fill="#E94235" d="M50 24L9 65l21.1 6L50 65l5.9-18.83z" />
          <path fill="#2684FC" d="M9 65h41v62H9z" />
          <path fill="#00AC47" d="M174.19 41.36L148 62.85v67.31l26.3 21.57c3.94 3.08 9.7.27 9.7-4.73V46c0-5.07-5.89-7.85-9.81-4.64zM108 96v31H50v41h86c6.63 0 12-5.37 12-12v-25.84L108 96z" />
          <path fill="#FFBA00" d="M136 24H50v41h58v31l40-33.15V36c0-6.63-5.37-12-12-12z" />
        </svg>
        <span
          className="text-[13px] text-blue-500 cursor-pointer hover:underline"
          onClick={() => track('calendar_meet_link_clicked')}
        >
          Join with Google Meet
        </span>
      </div>

      <div className="mx-6 h-[1px] bg-gray-100" />

      {/* Phone row */}
      <div className="flex items-center gap-4 px-6 py-3">
        <Phone size={18} className="text-gray-400 shrink-0" />
        <div
          contentEditable
          suppressContentEditableWarning
          onFocus={onPhoneFocus}
          onInput={(e) => {
            calendarStore.phone = e.currentTarget.textContent ?? ''
            clearContactErrorsIfSatisfied()
          }}
          dangerouslySetInnerHTML={{ __html: calendarStore.phone }}
          data-placeholder="Add phone number"
          className={cx(
            'text-[13px] text-gray-700 outline-none flex-1 rounded-lg px-2 py-2',
            'empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400',
            phoneError ? 'bg-red-50 ring-1 ring-red-500' : 'bg-gray-100',
          )}
        />
      </div>

      <div className="mx-6 h-[1px] bg-gray-100" />

      {/* Description row */}
      <div className="flex items-start gap-4 px-6 py-4">
        <AlignLeft size={18} className="text-gray-400 shrink-0 mt-[2px]" />
        <div
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => { calendarStore.description = e.currentTarget.textContent ?? '' }}
          className="text-[13px] text-gray-800 leading-relaxed outline-none flex-1 min-h-[32px] bg-gray-100 rounded-lg px-2 py-2"
          dangerouslySetInnerHTML={{ __html: calendarStore.description }}
        />
      </div>
    </div>
  )
}

// ─── CalendarPanel ────────────────────────────────────────────────────────────

const PICKER_VARIANTS = {
  hidden: { opacity: 0, y: 4, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
}
const PICKER_TRANSITION = { duration: 0.15, ease: [0.2, 0.9, 0.2, 1] as const }

export function CalendarPanel() {
  const [openPicker, setOpenPicker] = useState<PickerKey | null>(null)
  const [pickerLeft, setPickerLeft] = useState(0)
  const datetimeRowBottom = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const onOpenPicker = useCallback((key: PickerKey, leftPx: number) => {
    const container = containerRef.current
    const row = container?.querySelector<HTMLElement>('[data-datetime-row]')
    if (container && row) {
      datetimeRowBottom.current = row.getBoundingClientRect().bottom - container.getBoundingClientRect().top
    }
    setPickerLeft(leftPx)
    setOpenPicker(key)
  }, [])

  const onClosePicker = useCallback(() => setOpenPicker(null), [])

  // Escape closes picker first, then panel
  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (openPicker !== null) setOpenPicker(null)
      else calendarStore.sendStatus  // no-op; outer layout handles panel close
    }
    const onMousedown = (e: MouseEvent) => {
      if (openPicker === null) return
      const container = containerRef.current
      const picker = container?.querySelector<HTMLElement>('[data-picker]')
      const row = container?.querySelector<HTMLElement>('[data-datetime-row]')
      if (
        picker && !picker.contains(e.target as Node) &&
        row && !row.contains(e.target as Node)
      ) {
        setOpenPicker(null)
      }
    }
    document.addEventListener('keydown', onKeydown)
    document.addEventListener('mousedown', onMousedown)
    return () => {
      document.removeEventListener('keydown', onKeydown)
      document.removeEventListener('mousedown', onMousedown)
    }
  }, [openPicker])

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <Panel>
        <Panel.Header>
          <Panel.Header.Title>Schedule a call</Panel.Header.Title>
          <Panel.Header.Subtitle>30 minutes with Cameron</Panel.Header.Subtitle>
        </Panel.Header>

        <Panel.Body isCard>
          <CalendarFormBody
            openPicker={openPicker}
            onOpenPicker={onOpenPicker}
            onClosePicker={onClosePicker}
          />
        </Panel.Body>

        <Panel.Footer isBordered>
          <SaveButton />
        </Panel.Footer>
      </Panel>

      <AnimatePresence mode="wait">
        {openPicker !== null && (
          <motion.div
            key={openPicker}
            data-picker
            variants={PICKER_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={PICKER_TRANSITION}
            className="absolute z-50"
            style={{ top: datetimeRowBottom.current + 4, left: pickerLeft }}
          >
            {openPicker === 'date' && <DatePicker onClose={onClosePicker} />}
            {(openPicker === 'start' || openPicker === 'end') && (
              <TimePicker mode={openPicker} onClose={onClosePicker} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
