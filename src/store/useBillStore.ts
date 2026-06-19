import { create } from 'zustand'
import type { Bill } from '@/types/bill'
import type { DiscountCalculationResult } from '@/types/discount'
import { mockBills } from '@/data/bill'
import { formatDate } from '@/utils/date'
import type { Booking } from '@/types/booking'
import { loadPersisted, persistData } from '@/utils/persist'

interface BillState {
  bills: Bill[]
  addBill: (bill: Bill) => void
  createBillForBooking: (booking: Booking, discountResult: DiscountCalculationResult) => Bill
  payBill: (id: string) => void
  updateBillByBookingId: (bookingId: string, updates: Partial<Bill>) => void
  suspendBillByBookingId: (bookingId: string) => void
  resumeBillByBookingId: (bookingId: string) => void
}

export const useBillStore = create<BillState>((set, get) => ({
  bills: loadPersisted<Bill[]>('bills', mockBills),

  addBill: (bill: Bill) => {
    set(state => {
      const next = [...state.bills, bill]
      persistData('bills', next)
      return { bills: next }
    })
  },

  createBillForBooking: (booking: Booking, discountResult: DiscountCalculationResult) => {
    const skateRentalFee = booking.skateRental?.price || 0
    const originalAmount = booking.originalPrice + skateRentalFee
    const totalAmount = discountResult.finalPrice + skateRentalFee

    const bill: Bill = {
      id: `bill-${booking.id}`,
      bookingId: booking.id,
      bookingInfo: {
        rinkName: booking.rinkName,
        date: booking.date,
        timeSlotLabel: booking.timeSlotLabel,
        skaterName: booking.skaterName
      },
      originalAmount,
      discountResult,
      skateRentalFee,
      totalAmount: Math.max(0, Number(totalAmount.toFixed(2))),
      status: 'unpaid',
      createTime: formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
    }

    set(state => {
      const next = [...state.bills, bill]
      persistData('bills', next)
      return { bills: next }
    })

    return bill
  },

  payBill: (id: string) => {
    set(state => {
      const next = state.bills.map(b =>
        b.id === id
          ? { ...b, status: 'paid' as const, payTime: formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss') }
          : b
      )
      persistData('bills', next)
      return { bills: next }
    })
  },

  updateBillByBookingId: (bookingId: string, updates: Partial<Bill>) => {
    set(state => {
      const next = state.bills.map(b =>
        b.bookingId === bookingId ? { ...b, ...updates } : b
      )
      persistData('bills', next)
      return { bills: next }
    })
  },

  suspendBillByBookingId: (bookingId: string) => {
    set(state => {
      const next = state.bills.map(b =>
        b.bookingId === bookingId && b.status === 'unpaid'
          ? { ...b, status: 'suspended' as const }
          : b
      )
      persistData('bills', next)
      return { bills: next }
    })
  },

  resumeBillByBookingId: (bookingId: string) => {
    set(state => {
      const next = state.bills.map(b =>
        b.bookingId === bookingId && b.status === 'suspended'
          ? { ...b, status: 'unpaid' as const }
          : b
      )
      persistData('bills', next)
      return { bills: next }
    })
  }
}))
