export interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  price: number
  type: 'peak' | 'normal' | 'off-peak'
}

export interface Rink {
  id: string
  name: string
  description: string
  type: 'standard' | 'vip' | 'training'
  capacity: number
  iceArea: number
  facilities: string[]
  image: string
  timeSlots: TimeSlot[]
  status: 'open' | 'closed' | 'maintenance'
}

export type RinkType = Rink['type']
export type TimeSlotType = TimeSlot['type']
