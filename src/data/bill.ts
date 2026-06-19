import type { Bill } from '@/types/bill'
import { formatDate, addDays } from '@/utils/date'

const today = formatDate(new Date(), 'YYYY-MM-DD')

export const mockBills: Bill[] = [
  {
    id: 'bill-001',
    bookingId: 'bk-001',
    bookingInfo: {
      rinkName: '训练冰场 C 区',
      date: today,
      timeSlotLabel: '10:00-12:00',
      skaterName: '李明'
    },
    originalAmount: 180,
    discountResult: {
      originalPrice: 180,
      finalPrice: 150,
      totalDiscount: 30,
      details: [
        { discountId: 'coupon-3', discountName: '满 100 减 30 券', discountAmount: 30, stepPrice: 150 }
      ],
      hasNegativeProtection: false
    },
    skateRentalFee: 30,
    totalAmount: 150,
    status: 'paid',
    payTime: '2024-01-15 10:35:00',
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 'bill-002',
    bookingId: 'bk-004',
    bookingInfo: {
      rinkName: 'VIP 冰场 B 区',
      date: addDays(today, 2),
      timeSlotLabel: '15:00-17:00',
      skaterName: '刘强'
    },
    originalAmount: 350,
    discountResult: {
      originalPrice: 350,
      finalPrice: 265,
      totalDiscount: 85,
      details: [
        { discountId: 'full-1', discountName: '满 200 减 50', discountAmount: 50, stepPrice: 300 },
        { discountId: 'coupon-2', discountName: 'VIP 专属 9 折券', discountAmount: 30, stepPrice: 270 }
      ],
      hasNegativeProtection: false
    },
    skateRentalFee: 50,
    totalAmount: 265,
    status: 'unpaid',
    createTime: '2024-01-14 16:45:00'
  },
  {
    id: 'bill-003',
    bookingId: 'bk-005',
    bookingInfo: {
      rinkName: '主冰场 A 区',
      date: addDays(today, -1),
      timeSlotLabel: '13:00-15:00',
      skaterName: '陈静'
    },
    originalAmount: 100,
    discountResult: {
      originalPrice: 100,
      finalPrice: 100,
      totalDiscount: 0,
      details: [],
      hasNegativeProtection: false
    },
    skateRentalFee: 0,
    totalAmount: 100,
    status: 'paid',
    payTime: '2024-01-16 13:05:00',
    createTime: '2024-01-12 11:30:00'
  }
]
