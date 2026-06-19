export type DiscountType = 'coupon' | 'full-reduction'

export interface DiscountBase {
  id: string
  name: string
  type: DiscountType
  description: string
}

export interface CouponDiscount extends DiscountBase {
  type: 'coupon'
  discountType: 'percentage' | 'fixed'
  value: number
  minAmount: number
  maxDiscount?: number
}

export interface FullReductionDiscount extends DiscountBase {
  type: 'full-reduction'
  fullAmount: number
  reductionAmount: number
  canStack: boolean
}

export type Discount = CouponDiscount | FullReductionDiscount

export interface DiscountOrderConfig {
  order: string[]
  allowNegative: boolean
}

export interface DiscountCalculationResult {
  originalPrice: number
  finalPrice: number
  totalDiscount: number
  details: {
    discountId: string
    discountName: string
    discountAmount: number
    stepPrice: number
  }[]
  hasNegativeProtection: boolean
}
