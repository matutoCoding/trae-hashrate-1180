import type { Discount, DiscountOrderConfig } from '@/types/discount'

export const mockDiscounts: Discount[] = [
  {
    id: 'coupon-1',
    name: '新用户 8 折券',
    type: 'coupon',
    description: '新用户首单专享 8 折优惠',
    discountType: 'percentage',
    value: 20,
    minAmount: 0,
    maxDiscount: 50
  },
  {
    id: 'coupon-2',
    name: 'VIP 专属 9 折券',
    type: 'coupon',
    description: 'VIP 用户专属 9 折优惠',
    discountType: 'percentage',
    value: 10,
    minAmount: 100,
    maxDiscount: 100
  },
  {
    id: 'coupon-3',
    name: '满 100 减 30 券',
    type: 'coupon',
    description: '满 100 元减 30 元',
    discountType: 'fixed',
    value: 30,
    minAmount: 100
  },
  {
    id: 'full-1',
    name: '满 200 减 50',
    type: 'full-reduction',
    description: '每满 200 元减 50 元，可叠加',
    fullAmount: 200,
    reductionAmount: 50,
    canStack: true
  },
  {
    id: 'full-2',
    name: '满 500 减 150',
    type: 'full-reduction',
    description: '满 500 元减 150 元',
    fullAmount: 500,
    reductionAmount: 150,
    canStack: false
  }
]

export const mockDiscountOrderConfig: DiscountOrderConfig = {
  order: ['coupon-1', 'coupon-2', 'coupon-3', 'full-1', 'full-2'],
  allowNegative: false
}
