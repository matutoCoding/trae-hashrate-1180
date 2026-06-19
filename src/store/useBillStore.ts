import { create } from 'zustand'
import type { Bill } from '@/types/bill'
import { mockBills } from '@/data/bill'

interface BillState {
  bills: Bill[]
  getBillById: (id: string) => Bill | undefined
  getBillsByStatus: (status: Bill['status']) => Bill[]
  addBill: (bill: Bill) => void
  payBill: (id: string) => void
}

export const useBillStore = create<BillState>((set, get) => ({
  bills: mockBills,
  
  getBillById: (id: string) => {
    return get().bills.find(b => b.id === id)
  },
  
  getBillsByStatus: (status: Bill['status']) => {
    return get().bills.filter(b => b.status === status)
  },
  
  addBill: (bill: Bill) => {
    set(state => ({ bills: [...state.bills, bill] }))
  },
  
  payBill: (id: string) => {
    set(state => ({
      bills: state.bills.map(b => 
        b.id === id 
          ? { ...b, status: 'paid' as const, payTime: new Date().toISOString() }
          : b
      )
    }))
  }
}))
