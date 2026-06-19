import type { Booking, CycleRule } from '@/types/booking'
import { formatDate, addDays } from '@/utils/date'

const today = formatDate(new Date(), 'YYYY-MM-DD')

export const mockCycleRules: CycleRule[] = [
  {
    id: 'cycle-1',
    name: '每周六上午训练',
    rinkId: 'rink-3',
    timeSlotId: 'slot-3-2',
    dayOfWeek: 6,
    startDate: today,
    endDate: addDays(today, 60),
    skaterName: '李明',
    skaterPhone: '138****1234',
    note: '花样滑冰专业训练'
  },
  {
    id: 'cycle-2',
    name: '每周三晚亲子滑',
    rinkId: 'rink-4',
    timeSlotId: 'slot-4-4',
    dayOfWeek: 3,
    startDate: today,
    endDate: addDays(today, 90),
    skaterName: '王芳',
    skaterPhone: '139****5678',
    note: '带孩子一起滑冰'
  }
]

export const mockBookings: Booking[] = [
  {
    id: 'bk-001',
    cycleRuleId: 'cycle-1',
    rinkId: 'rink-3',
    rinkName: '训练冰场 C 区',
    timeSlotId: 'slot-3-2',
    timeSlotLabel: '10:00-12:00',
    date: today,
    startTime: '10:00',
    endTime: '12:00',
    originalPrice: 150,
    finalPrice: 120,
    skaterName: '李明',
    skaterPhone: '138****1234',
    status: 'confirmed',
    skateRental: {
      size: '42',
      price: 30
    },
    note: '花样滑冰专业训练',
    createdAt: '2024-01-15 10:30:00'
  },
  {
    id: 'bk-002',
    rinkId: 'rink-1',
    rinkName: '主冰场 A 区',
    timeSlotId: 'slot-1-5',
    timeSlotLabel: '17:00-19:00',
    date: today,
    startTime: '17:00',
    endTime: '19:00',
    originalPrice: 150,
    finalPrice: 150,
    skaterName: '张华',
    skaterPhone: '137****9012',
    status: 'pending',
    createdAt: '2024-01-16 14:20:00'
  },
  {
    id: 'bk-003',
    cycleRuleId: 'cycle-2',
    rinkId: 'rink-4',
    rinkName: '亲子冰场 D 区',
    timeSlotId: 'slot-4-4',
    timeSlotLabel: '17:00-19:00',
    date: addDays(today, 1),
    startTime: '17:00',
    endTime: '19:00',
    originalPrice: 100,
    finalPrice: 85,
    skaterName: '王芳',
    skaterPhone: '139****5678',
    status: 'confirmed',
    note: '带孩子一起滑冰',
    createdAt: '2024-01-10 09:00:00'
  },
  {
    id: 'bk-004',
    rinkId: 'rink-2',
    rinkName: 'VIP 冰场 B 区',
    timeSlotId: 'slot-2-4',
    timeSlotLabel: '15:00-17:00',
    date: addDays(today, 2),
    startTime: '15:00',
    endTime: '17:00',
    originalPrice: 300,
    finalPrice: 240,
    skaterName: '刘强',
    skaterPhone: '136****3456',
    status: 'confirmed',
    skateRental: {
      size: '41',
      price: 50
    },
    createdAt: '2024-01-14 16:45:00'
  },
  {
    id: 'bk-005',
    rinkId: 'rink-1',
    rinkName: '主冰场 A 区',
    timeSlotId: 'slot-1-3',
    timeSlotLabel: '13:00-15:00',
    date: addDays(today, -1),
    startTime: '13:00',
    endTime: '15:00',
    originalPrice: 100,
    finalPrice: 100,
    skaterName: '陈静',
    skaterPhone: '135****7890',
    status: 'completed',
    createdAt: '2024-01-12 11:30:00'
  },
  {
    id: 'bk-006',
    rinkId: 'rink-3',
    rinkName: '训练冰场 C 区',
    timeSlotId: 'slot-3-1',
    timeSlotLabel: '08:00-10:00',
    date: addDays(today, -2),
    startTime: '08:00',
    endTime: '10:00',
    originalPrice: 120,
    finalPrice: 96,
    skaterName: '赵磊',
    skaterPhone: '133****2345',
    status: 'cancelled',
    note: '临时有事取消',
    createdAt: '2024-01-11 08:15:00'
  }
]
