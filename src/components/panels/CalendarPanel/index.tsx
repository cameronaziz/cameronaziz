import React, { useState } from 'react'
import { useSnapshot } from 'valtio'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ChevronLeft, ChevronRight } from 'lucide-react'
import { calendarStore, sendCalendarInvite } from '../../../store/calendar'
import { track } from '../../../analytics'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa']
const HOURS = Array.from({ length: 16 }, (_, i) => i + 7) // 7–22

function padTwo(n: number) { return String(n).padStart(2, '0') }

function PanelHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mt-1 mb-4 shrink-0">
      <div className="text-[10px] font-bold text-[#5F6368] tracking-widest uppercase">{title}</div>
      <div className="text-[10px] font-normal text-[#9AA0A6] mt-0.5">{subtitle}</div>
    </div>
  )
}

function DatePicker({ onClose }: { onClose: () => void }) {
  const { date } = useSnapshot(calendarStore)
  const viewing = new Date(date.getFullYear(), date.getMonth(), 1)

  const prevMonth = () => {
    const d = new Date(date)
    d.setMonth(d.getMonth() - 1)
    calendarStore.date = d
  }
  const nextMonth = () => {
    const d = new Date(date)
    d.setMonth(d.getMonth() + 1)
    calendarStore.date = d
  }

  const firstDow = new Date(viewing.getFullYear(), viewing.getMonth(), 1).getDay()
  const daysInMonth = new Date(viewing.getFullYear(), viewing.getMonth() + 1, 0).getDate()
  const today = new Date()

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 w-[260px]"
    >
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-lg">
          <ChevronLeft size={16} />
        </button>
        <span className="text-[13px] font-semibold text-[#1F1F1F]">
          {MONTHS[date.getMonth()]} {date.getFullYear()}
        </span>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-lg">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-[10px] text-center font-medium text-[#9AA0A6]">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const isSelected =
            date.getDate() === day &&
            date.getMonth() === viewing.getMonth() &&
            date.getFullYear() === viewing.getFullYear()
          const isToday =
            today.getDate() === day &&
            today.getMonth() === viewing.getMonth() &&
            today.getFullYear() === viewing.getFullYear()
          return (
            <button
              key={day}
              onClick={() => {
                const d = new Date(date)
                d.setFullYear(viewing.getFullYear())
                d.setMonth(viewing.getMonth())
                d.setDate(day)
                calendarStore.date = d
                track('calendar_date_selected', {
                  date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
                })
                onClose()
              }}
              className={[
                'w-8 h-8 rounded-full text-[12px] font-medium transition-colors',
                isSelected
                  ? 'bg-[#1A73E8] text-white'
                  : isToday
                  ? 'bg-blue-50 text-[#1A73E8]'
                  : 'hover:bg-gray-100 text-[#1F1F1F]',
              ].join(' ')}
            >
              {day}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

function TimePicker({ mode, onClose }: { mode: 'start' | 'end'; onClose: () => void }) {
  const { startHour, startMinute } = useSnapshot(calendarStore)
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 w-[160px] max-h-[240px] overflow-y-auto"
    >
      {HOURS.flatMap((h) => [0, 30]).map((m, idx) => {
        const h = HOURS[Math.floor(idx / 2)]!
        const isSelected = h === startHour && m === startMinute
        return (
          <button
            key={`${h}:${m}`}
            onClick={() => {
              calendarStore.startHour = h
              calendarStore.startMinute = m
              track('calendar_time_selected', { hour: h, minute: m })
              onClose()
            }}
            className={[
              'w-full text-left px-3 py-1.5 rounded-lg text-[13px] transition-colors',
              isSelected ? 'bg-[#1A73E8] text-white' : 'hover:bg-gray-100 text-[#1F1F1F]',
            ].join(' ')}
          >
            {padTwo(h)}:{padTwo(m)} {h < 12 ? 'AM' : 'PM'}
          </button>
        )
      })}
    </motion.div>
  )
}

function SendButton() {
  const { sendStatus, guests } = useSnapshot(calendarStore)
  const validGuests = guests.filter((g) => g.isValid)

  if (sendStatus === 'sent') {
    return (
      <div className="flex items-center gap-2 text-[#34A853] text-[13px] font-medium">
        <span>✓</span> Invite sent!
      </div>
    )
  }

  return (
    <button
      onClick={() => {
        track('calendar_invite_attempted', { guest_count: validGuests.length })
        sendCalendarInvite()
      }}
      disabled={sendStatus === 'sending' || validGuests.length === 0}
      className={[
        'flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-colors',
        sendStatus === 'sending' || validGuests.length === 0
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-[#1A73E8] text-white hover:bg-blue-600 cursor-pointer',
      ].join(' ')}
    >
      <Send size={14} />
      {sendStatus === 'sending' ? 'Sending…' : sendStatus === 'error' ? 'Try again' : 'Send invite'}
    </button>
  )
}

function GuestInput() {
  const { guests } = useSnapshot(calendarStore)
  return (
    <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border border-gray-200 rounded-xl min-h-[40px]">
      {guests.map((g, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] bg-blue-50 text-blue-700"
        >
          {g.address}
          {g.editable && (
            <button
              onClick={() => {
                track('calendar_guest_removed')
                calendarStore.guests.splice(i, 1)
              }}
              className="ml-1 text-blue-400 hover:text-blue-600"
            >
              ×
            </button>
          )}
        </span>
      ))}
      <input
        type="email"
        placeholder="Add guest email…"
        className="flex-1 min-w-[140px] bg-transparent text-[13px] outline-none text-[#1F1F1F] placeholder:text-gray-400"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            const val = (e.target as HTMLInputElement).value.trim()
            if (val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
              calendarStore.guests.push({ address: val, editable: true, isValid: true })
              track('calendar_guest_added', { guest_count: calendarStore.guests.length })
              ;(e.target as HTMLInputElement).value = ''
            }
          }
        }}
      />
    </div>
  )
}

export function CalendarPanel() {
  const { date, startHour, startMinute } = useSnapshot(calendarStore)
  const [activePicker, setActivePicker] = useState<null | 'date' | 'start'>(null)

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Header */}
      <PanelHeader title="Schedule a call" subtitle="30 minutes with Cameron" />

      {/* Body card */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-white rounded-[24px]">
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

          {/* Date / time row */}
          <div className="flex gap-3">
            <button
              onClick={() => setActivePicker(activePicker === 'date' ? null : 'date')}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-left text-[#1F1F1F] hover:border-blue-300 transition-colors"
            >
              {MONTHS[date.getMonth()]} {date.getDate()}, {date.getFullYear()}
            </button>
            <button
              onClick={() => setActivePicker(activePicker === 'start' ? null : 'start')}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-[#1F1F1F] hover:border-blue-300 transition-colors"
            >
              {padTwo(startHour)}:{padTwo(startMinute)}
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="text-[10px] font-bold text-[#9AA0A6] uppercase tracking-wider mb-1 block">Title</label>
            <input
              type="text"
              value={calendarStore.title}
              onChange={(e) => { calendarStore.title = e.target.value }}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-[#1F1F1F] outline-none focus:border-blue-300"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-bold text-[#9AA0A6] uppercase tracking-wider mb-1 block">Description</label>
            <textarea
              value={calendarStore.description}
              onChange={(e) => { calendarStore.description = e.target.value }}
              rows={2}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-[#1F1F1F] outline-none focus:border-blue-300 resize-none"
            />
          </div>

          {/* Guests */}
          <div>
            <label className="text-[10px] font-bold text-[#9AA0A6] uppercase tracking-wider mb-1 block">Guests</label>
            <GuestInput />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 shrink-0 border-t border-dusk-100 flex justify-end">
        <SendButton />
      </div>

      {/* Floating pickers */}
      <AnimatePresence mode="wait">
        {activePicker === 'date' && (
          <div key="date-picker" className="absolute z-50" style={{ top: 80, left: 0 }}>
            <DatePicker onClose={() => setActivePicker(null)} />
          </div>
        )}
        {activePicker === 'start' && (
          <div key="time-picker" className="absolute z-50" style={{ top: 80, right: 0 }}>
            <TimePicker mode="start" onClose={() => setActivePicker(null)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
