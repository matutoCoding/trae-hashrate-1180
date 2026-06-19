import type { DiscountCalculationResult } from './discount'

export interface CycleRule {
  id: string
  name: string
  rinkId: string
  timeSlotId: string
  dayOfWeek: number
  startDate: string
  endDate: string
  skaterName: string
  skaterPhone: string
  note?: string
}

export interface Booking {
  id: string
  cycleRuleId?: string
  rinkId: string
  rinkName: string
  timeSlotId: string
  timeSlotLabel: string
  date: string
  startTime: string
  endTime: string
  originalPrice: number
  finalPrice: number
  discountResult?: DiscountCalculationResult
  skaterName: string
  skaterPhone: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  skateRental?: {
    size: string
    price: number
  }
  note?: string
  createdAt: string
}

export type BookingStatus = Booking['status']
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6
