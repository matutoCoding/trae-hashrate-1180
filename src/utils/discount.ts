import type { Discount, DiscountCalculationResult, CouponDiscount, FullReductionDiscount } from '@/types/discount'

function calculateCouponDiscount(price: number, coupon: CouponDiscount): number {
  if (price < coupon.minAmount) {
    return 0
  }
  
  let discount = 0
  if (coupon.discountType === 'percentage') {
    discount = price * (coupon.value / 100)
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount
    }
  } else {
    discount = coupon.value
  }
  
  return Math.min(discount, price)
}

function calculateFullReductionDiscount(price: number, fullReduction: FullReductionDiscount): number {
  if (price < fullReduction.fullAmount) {
    return 0
  }
  
  if (fullReduction.canStack) {
    const times = Math.floor(price / fullReduction.fullAmount)
    return times * fullReduction.reductionAmount
  }
  
  return fullReduction.reductionAmount
}

export function calculateDiscount(
  originalPrice: number,
  discounts: Discount[],
  discountOrder: string[],
  allowNegative: boolean = false
): DiscountCalculationResult {
  console.log('[Discount] 计算优惠', { originalPrice, discountCount: discounts.length, discountOrder, allowNegative })
  
  const orderedDiscounts = discountOrder
    .map(id => discounts.find(d => d.id === id))
    .filter((d): d is Discount => d !== undefined)
  
  let currentPrice = originalPrice
  const details: DiscountCalculationResult['details'] = []
  let hasNegativeProtection = false
  
  for (const discount of orderedDiscounts) {
    let discountAmount = 0
    
    if (discount.type === 'coupon') {
      discountAmount = calculateCouponDiscount(currentPrice, discount)
    } else if (discount.type === 'full-reduction') {
      discountAmount = calculateFullReductionDiscount(currentPrice, discount)
    }
    
    const stepPrice = currentPrice - discountAmount
    
    if (stepPrice < 0 && !allowNegative) {
      const adjustedDiscount = currentPrice
      details.push({
        discountId: discount.id,
        discountName: discount.name,
        discountAmount: adjustedDiscount,
        stepPrice: 0
      })
      currentPrice = 0
      hasNegativeProtection = true
      console.log('[Discount] 负值兜底触发', { discount: discount.name, adjustedTo: 0 })
      break
    }
    
    details.push({
      discountId: discount.id,
      discountName: discount.name,
      discountAmount,
      stepPrice
    })
    currentPrice = stepPrice
  }
  
  const totalDiscount = originalPrice - currentPrice
  
  const result: DiscountCalculationResult = {
    originalPrice,
    finalPrice: Math.max(0, Number(currentPrice.toFixed(2))),
    totalDiscount: Number(totalDiscount.toFixed(2)),
    details,
    hasNegativeProtection
  }
  
  console.log('[Discount] 计算结果', result)
  return result
}

export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`
}

export function validateDiscountOrder(discounts: Discount[], order: string[]): boolean {
  const discountIds = discounts.map(d => d.id)
  return order.every(id => discountIds.includes(id))
}
