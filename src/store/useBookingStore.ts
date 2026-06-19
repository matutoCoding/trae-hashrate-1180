import { create } from 'zustand'
import type { Booking, CycleRule } from '@/types/booking'
import { mockBookings, mockCycleRules } from '@/data/booking'
import { generateDatesByWeekday, formatDate } from '@/utils/date'
import { mockRinks } from '@/data/rink'
import { calculateDiscount } from '@/utils/discount'
import { mockDiscounts, mockDiscountOrderConfig } from '@/data/discount'
import { loadPersisted, persistData } from '@/utils/persist'

export interface CycleGenerateResult {
  bookings: Booking[]
  skippedDates: string[]
  skipReason: string
}

interface BookingState {
  bookings: Booking[]
  cycleRules: CycleRule[]
  addBooking: (booking: Booking) => void
  updateBooking: (id: string, updates: Partial<Booking>) => void
  deleteBooking: (id: string) => void
  addCycleRule: (rule: CycleRule) => CycleGenerateResult
  generateBookingsFromCycle: (rule: CycleRule) => CycleGenerateResult
  getBookingsByDate: (date: string) => Booking[]
  getBookingsByCycle: (cycleId: string) => Booking[]
  getBookingById: (id: string) => Booking | undefined
  isSlotOccupied: (rinkId: string, date: string, timeSlotId: string, excludeId?: string) => boolean
}

function persist(state: { bookings: Booking[]; cycleRules: CycleRule[] }) {
  persistData('bookings', state.bookings)
  persistData('cycleRules', state.cycleRules)
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: loadPersisted<Booking[]>('bookings', mockBookings),
  cycleRules: loadPersisted<CycleRule[]>('cycleRules', mockCycleRules),

  addBooking: (booking: Booking) => {
    set(state => {
      const next = { bookings: [...state.bookings, booking], cycleRules: state.cycleRules }
      persist(next)
      return next
    })
  },

  updateBooking: (id: string, updates: Partial<Booking>) => {
    set(state => {
      const next = {
        bookings: state.bookings.map(b => b.id === id ? { ...b, ...updates } : b),
        cycleRules: state.cycleRules
      }
      persist(next)
      return next
    })
  },

  deleteBooking: (id: string) => {
    set(state => {
      const next = {
        bookings: state.bookings.filter(b => b.id !== id),
        cycleRules: state.cycleRules
      }
      persist(next)
      return next
    })
  },

  isSlotOccupied: (rinkId: string, date: string, timeSlotId: string, excludeId?: string) => {
    return get().bookings.some(b =>
      b.rinkId === rinkId &&
      b.date === date &&
      b.timeSlotId === timeSlotId &&
      (b.status === 'confirmed' || b.status === 'pending') &&
      b.id !== excludeId
    )
  },

  addCycleRule: (rule: CycleRule) => {
    set(state => {
      const nextCycleRules = [...state.cycleRules, rule]
      persist({ bookings: state.bookings, cycleRules: nextCycleRules })
      return { ...state, cycleRules: nextCycleRules }
    })
    return get().generateBookingsFromCycle(rule)
  },

  generateBookingsFromCycle: (rule: CycleRule) => {
    const dates = generateDatesByWeekday(rule.startDate, rule.endDate, rule.dayOfWeek)
    const rink = mockRinks.find(r => r.id === rule.rinkId)
    const timeSlot = rink?.timeSlots.find(s => s.id === rule.timeSlotId)

    const existingBookings = get().bookings
    const newBookings: Booking[] = []
    const skippedDates: string[] = []

    dates.forEach((date, index) => {
      const isOccupied = existingBookings.some(b =>
        b.rinkId === rule.rinkId &&
        b.date === date &&
        b.timeSlotId === rule.timeSlotId &&
        (b.status === 'confirmed' || b.status === 'pending')
      ) || newBookings.some(b => b.date === date)

      if (isOccupied) {
        skippedDates.push(date)
        return
      }

      const originalPrice = timeSlot?.price || 0
      const discountResult = calculateDiscount(
        originalPrice,
        mockDiscounts,
        mockDiscountOrderConfig.order,
        mockDiscountOrderConfig.allowNegative
      )

      newBookings.push({
        id: `bk-${rule.id}-${index + 1}`,
        cycleRuleId: rule.id,
        rinkId: rule.rinkId,
        rinkName: rink?.name || '冰场',
        timeSlotId: rule.timeSlotId,
        timeSlotLabel: timeSlot ? `${timeSlot.startTime}-${timeSlot.endTime}` : '',
        date,
        startTime: timeSlot?.startTime || '',
        endTime: timeSlot?.endTime || '',
        originalPrice,
        finalPrice: discountResult.finalPrice,
        skaterName: rule.skaterName,
        skaterPhone: rule.skaterPhone,
        status: 'confirmed' as const,
        note: rule.note,
        createdAt: formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
      })
    })

    set(state => {
      const next = {
        bookings: [...state.bookings, ...newBookings],
        cycleRules: state.cycleRules
      }
      persist(next)
      return next
    })

    const skipReason = skippedDates.length > 0
      ? `${skippedDates.length} 个日期因时段已被占用而跳过`
      : ''

    console.log('[Booking] 批量生成预约', {
      rule: rule.name,
      generated: newBookings.length,
      skipped: skippedDates.length,
      skippedDates
    })

    return { bookings: newBookings, skippedDates, skipReason }
  },

  getBookingsByDate: (date: string) => {
    return get().bookings.filter(b => b.date === date && b.status !== 'cancelled')
  },

  getBookingsByCycle: (cycleId: string) => {
    return get().bookings.filter(b => b.cycleRuleId === cycleId)
  },

  getBookingById: (id: string) => {
    return get().bookings.find(b => b.id === id)
  }
}))
