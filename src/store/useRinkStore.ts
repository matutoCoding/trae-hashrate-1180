import { create } from 'zustand'
import type { Rink, TimeSlot } from '@/types/rink'
import { mockRinks } from '@/data/rink'

interface RinkState {
  rinks: Rink[]
  selectedRinkId: string | null
  setSelectedRink: (id: string) => void
  getRinkById: (id: string) => Rink | undefined
  getTimeSlotById: (rinkId: string, slotId: string) => TimeSlot | undefined
}

export const useRinkStore = create<RinkState>((set, get) => ({
  rinks: mockRinks,
  selectedRinkId: null,
  
  setSelectedRink: (id: string) => {
    set({ selectedRinkId: id })
  },
  
  getRinkById: (id: string) => {
    return get().rinks.find(r => r.id === id)
  },
  
  getTimeSlotById: (rinkId: string, slotId: string) => {
    const rink = get().getRinkById(rinkId)
    return rink?.timeSlots.find(s => s.id === slotId)
  }
}))
