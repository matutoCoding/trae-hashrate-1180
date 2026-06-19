import { create } from 'zustand'
import type { Booking, CycleRule } from '@/types/booking'
import { mockBookings, mockCycleRules } from '@/data/booking'
import { generateDatesByWeekday, formatDate } from '@/utils/date'
import { mockRinks } from '@/data/rink'

interface BookingState {
  bookings: Booking[]
  cycleRules: CycleRule[]
  addBooking: (booking: Booking) => void
  updateBooking: (id: string, updates: Partial<Booking>) => void
  deleteBooking: (id: string) => void
  addCycleRule: (rule: CycleRule) => Booking[]
  generateBookingsFromCycle: (rule: CycleRule) => Booking[]
  getBookingsByDate: (date: string) => Booking[]
  getBookingsByCycle: (cycleId: string) => Booking[]
  getBookingById: (id: string) => Booking | undefined
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: mockBookings,
  cycleRules: mockCycleRules,
  
  addBooking: (booking: Booking) => {
    set(state => ({ bookings: [...state.bookings, booking] }))
  },
  
  updateBooking: (id: string, updates: Partial<Booking>) => {
    set(state => ({
      bookings: state.bookings.map(b => 
        b.id === id ? { ...b, ...updates } : b
      )
    }))
  },
  
  deleteBooking: (id: string) => {
    set(state => ({
      bookings: state.bookings.filter(b => b.id !== id)
    }))
  },
  
  addCycleRule: (rule: CycleRule) => {
    set(state => ({ cycleRules: [...state.cycleRules, rule] }))
    return get().generateBookingsFromCycle(rule)
  },
  
  generateBookingsFromCycle: (rule: CycleRule) => {
    const dates = generateDatesByWeekday(rule.startDate, rule.endDate, rule.dayOfWeek)
    const rink = mockRinks.find(r => r.id === rule.rinkId)
    const timeSlot = rink?.timeSlots.find(s => s.id === rule.timeSlotId)
    
    const newBookings: Booking[] = dates.map((date, index) => ({
      id: `bk-${rule.id}-${index + 1}`,
      cycleRuleId: rule.id,
      rinkId: rule.rinkId,
      rinkName: rink?.name || '冰场',
      timeSlotId: rule.timeSlotId,
      timeSlotLabel: timeSlot ? `${timeSlot.startTime}-${timeSlot.endTime}` : '',
      date,
      startTime: timeSlot?.startTime || '',
      endTime: timeSlot?.endTime || '',
      originalPrice: timeSlot?.price || 0,
      finalPrice: timeSlot?.price || 0,
      skaterName: rule.skaterName,
      skaterPhone: rule.skaterPhone,
      status: 'confirmed' as const,
      note: rule.note,
      createdAt: formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
    }))
    
    set(state => ({
      bookings: [...state.bookings, ...newBookings]
    }))
    
    console.log('[Booking] 批量生成预约', { rule: rule.name, count: newBookings.length })
    return newBookings
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
