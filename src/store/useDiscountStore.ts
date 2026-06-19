import { create } from 'zustand'
import type { Discount, DiscountOrderConfig, DiscountCalculationResult } from '@/types/discount'
import { mockDiscounts, mockDiscountOrderConfig } from '@/data/discount'
import { calculateDiscount as calcDiscount } from '@/utils/discount'
import { loadPersisted, persistData } from '@/utils/persist'

interface DiscountState {
  discounts: Discount[]
  orderConfig: DiscountOrderConfig
  selectedDiscountIds: string[]

  setOrderConfig: (config: Partial<DiscountOrderConfig>) => void
  toggleDiscount: (id: string) => void
  setSelectedDiscounts: (ids: string[]) => void
  moveDiscountOrder: (fromIndex: number, toIndex: number) => void
  calculate: (price: number) => DiscountCalculationResult
  getSelectedDiscounts: () => Discount[]
}

export const useDiscountStore = create<DiscountState>((set, get) => ({
  discounts: mockDiscounts,
  orderConfig: loadPersisted<DiscountOrderConfig>('orderConfig', mockDiscountOrderConfig),
  selectedDiscountIds: [],

  setOrderConfig: (config: Partial<DiscountOrderConfig>) => {
    set(state => {
      const next = { ...state.orderConfig, ...config }
      persistData('orderConfig', next)
      return { orderConfig: next }
    })
  },

  toggleDiscount: (id: string) => {
    set(state => {
      const isSelected = state.selectedDiscountIds.includes(id)
      let newSelected: string[]

      if (isSelected) {
        newSelected = state.selectedDiscountIds.filter(d => d !== id)
      } else {
        newSelected = [...state.selectedDiscountIds, id]
        newSelected.sort((a, b) => {
          const orderA = state.orderConfig.order.indexOf(a)
          const orderB = state.orderConfig.order.indexOf(b)
          return orderA - orderB
        })
      }

      return { selectedDiscountIds: newSelected }
    })
  },

  setSelectedDiscounts: (ids: string[]) => {
    set({ selectedDiscountIds: ids })
  },

  moveDiscountOrder: (fromIndex: number, toIndex: number) => {
    set(state => {
      const newOrder = [...state.orderConfig.order]
      const [removed] = newOrder.splice(fromIndex, 1)
      newOrder.splice(toIndex, 0, removed)
      const next = { ...state.orderConfig, order: newOrder }
      persistData('orderConfig', next)
      return { orderConfig: next }
    })
  },

  calculate: (price: number) => {
    const state = get()
    const selectedDiscounts = state.getSelectedDiscounts()
    const order = state.orderConfig.order.filter(id =>
      state.selectedDiscountIds.includes(id)
    )

    return calcDiscount(price, selectedDiscounts, order, state.orderConfig.allowNegative)
  },

  getSelectedDiscounts: () => {
    const state = get()
    return state.discounts.filter(d => state.selectedDiscountIds.includes(d.id))
  }
}))
