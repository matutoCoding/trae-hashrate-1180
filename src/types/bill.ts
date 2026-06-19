import type { Booking } from './booking'
import type { DiscountCalculationResult } from './discount'

export interface Bill {
  id: string
  bookingId: string
  bookingInfo: Pick<Booking, 'rinkName' | 'date' | 'timeSlotLabel' | 'skaterName'>
  originalAmount: number
  discountResult: DiscountCalculationResult
  skateRentalFee: number
  totalAmount: number
  status: 'unpaid' | 'paid' | 'refunded'
  payTime?: string
  createTime: string
}

export type BillStatus = Bill['status']
