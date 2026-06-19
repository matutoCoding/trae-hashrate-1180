import { create } from 'zustand'
import type { Booking, CycleRule } from '@/types/booking'
import { mockBookings, mockCycleRules } from '@/data/booking'
import { generateDatesByWeekday, formatDate } from '@/utils/date'
import { mockRinks } from '@/data/rink'
import { calculateDiscount } from '@/utils/discount'
import { loadPersisted, persistData } from '@/utils/persist'
import { useDiscountStore } from './useDiscountStore'

export interface CycleGenerateResult {
  bookings: Booking[]
  skippedDates: string[]
  skipReason: string
}

export interface CyclePreviewResult {
  generatedDates: string[]
  skippedDates: string[]
  skippedReasons: Record<string, string>
}

export function previewCycleRule(rule: CycleRule, existingBookings: Booking[]): CyclePreviewResult {
  const dates = generateDatesByWeekday(rule.startDate, rule.endDate, rule.dayOfWeek)
  const generatedDates: string[] = []
  const skippedDates: string[] = []
  const skippedReasons: Record<string, string> = {}

  dates.forEach(date => {
    const occupied = existingBookings.some(b =>
      b.rinkId === rule.rinkId &&
      b.date === date &&
      b.timeSlotId === rule.timeSlotId &&
      (b.status === 'confirmed' || b.status === 'pending')
    )
    if (occupied) {
      skippedDates.push(date)
      skippedReasons[date] = '时段已被占用'
    } else {
      generatedDates.push(date)
    }
  })

  return { generatedDates, skippedDates, skippedReasons }
}

function computeBookingsFromCycle(rule: CycleRule, existingBookings: Booking[]) {
  const dates = generateDatesByWeekday(rule.startDate, rule.endDate, rule.dayOfWeek)
  const rink = mockRinks.find(r => r.id === rule.rinkId)
  const timeSlot = rink?.timeSlots.find(s => s.id === rule.timeSlotId)

  const discountState = useDiscountStore.getState()
  const { order, allowNegative } = discountState.orderConfig
  const availableDiscounts = discountState.discounts

  const computedBookings: Booking[] = []
  const skippedDates: string[] = []

  dates.forEach((date, index) => {
    const isOccupied = existingBookings.some(b =>
      b.rinkId === rule.rinkId &&
      b.date === date &&
      b.timeSlotId === rule.timeSlotId &&
      (b.status === 'confirmed' || b.status === 'pending')
    ) || computedBookings.some(b => b.date === date)

    if (isOccupied) {
      skippedDates.push(date)
      return
    }

    const originalPrice = timeSlot?.price || 0
    const discountResult = calculateDiscount(
      originalPrice,
      availableDiscounts,
      order,
      allowNegative
    )

    computedBookings.push({
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
      discountResult,
      skaterName: rule.skaterName,
      skaterPhone: rule.skaterPhone,
      status: 'pending' as const,
      note: rule.note,
      createdAt: formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
    })
  })

  return { bookings: computedBookings, skippedDates, computedBookings }
}

interface BookingState {
  bookings: Booking[]
  cycleRules: CycleRule[]
  addBooking: (booking: Booking) => void
  updateBooking: (id: string, updates: Partial<Booking>) => void
  deleteBooking: (id: string) => void
  addCycleRule: (rule: CycleRule) => CycleGenerateResult
  suspendBooking: (id: string) => void
  resumeBooking: (id: string) => void
  generateBookingsFromCycle: (rule: CycleRule) => CycleGenerateResult
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
    const { bookings, skippedDates, computedBookings } = computeBookingsFromCycle(
      rule,
      get().bookings
    )

    if (bookings.length === 0 && skippedDates.length === 0) {
      return { bookings: [], skippedDates: [], skipReason: '' }
    }

    set(state => {
      const next = {
        bookings: [...state.bookings, ...computedBookings],
        cycleRules: [...state.cycleRules, rule]
      }
      persist(next)
      return next
    })

    const skipReason = skippedDates.length > 0
      ? `${skippedDates.length} 个日期因时段已被占用而跳过`
      : ''

    return { bookings, skippedDates, skipReason }
  },

  suspendBooking: (id: string) => {
    set(state => {
      const booking = state.bookings.find(b => b.id === id)
      if (!booking || booking.status === 'suspended' || booking.status === 'cancelled') return state

      const next = {
        bookings: state.bookings.map(b =>
          b.id === id
            ? { ...b, status: 'suspended' as const, suspendedFromStatus: booking.status as 'pending' | 'confirmed' }
            : b
        ),
        cycleRules: state.cycleRules
      }
      persist(next)
      return next
    })
  },

  resumeBooking: (id: string) => {
    set(state => {
      const booking = state.bookings.find(b => b.id === id)
      if (!booking || booking.status !== 'suspended') return state

      const restoreStatus = booking.suspendedFromStatus || 'pending'
      const next = {
        bookings: state.bookings.map(b =>
          b.id === id
            ? { ...b, status: restoreStatus, suspendedFromStatus: undefined }
            : b
        ),
        cycleRules: state.cycleRules
      }
      persist(next)
      return next
    })
  },

  generateBookingsFromCycle: (rule: CycleRule) => {
    const { bookings, skippedDates, computedBookings } = computeBookingsFromCycle(
      rule,
      get().bookings
    )

    if (bookings.length === 0 && skippedDates.length === 0) {
      return { bookings: [], skippedDates: [], skipReason: '' }
    }

    set(state => {
      const next = {
        bookings: [...state.bookings, ...computedBookings],
        cycleRules: state.cycleRules
      }
      persist(next)
      return next
    })

    const skipReason = skippedDates.length > 0
      ? `${skippedDates.length} 个日期因时段已被占用而跳过`
      : ''

    return { bookings, skippedDates, skipReason }
  }
}))
