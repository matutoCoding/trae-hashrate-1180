import React from 'react'
import { View, Text } from '@tarojs/components'
import classNames from 'classnames'
import styles from './index.module.scss'
import type { Discount } from '@/types/discount'

interface CouponCardProps {
  discount: Discount
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
}

const CouponCard: React.FC<CouponCardProps> = ({ discount, selected, onClick, disabled }) => {
  const isCoupon = discount.type === 'coupon'
  const isPercentage = isCoupon && discount.discountType === 'percentage'

  const getDiscountValue = () => {
    if (isCoupon) {
      if (isPercentage) {
        return `${100 - discount.value}折`
      }
      return `¥${discount.value}`
    }
    return `¥${discount.reductionAmount}`
  }

  const getCondition = () => {
    if (isCoupon) {
      return discount.minAmount > 0 ? `满${discount.minAmount}元可用` : '无门槛'
    }
    return `满${discount.fullAmount}元减${discount.reductionAmount}元`
  }

  const getTypeLabel = () => {
    if (isCoupon) {
      return isPercentage ? '折扣券' : '满减券'
    }
    return discount.canStack ? '可叠加满减' : '满减活动'
  }

  return (
    <View
      className={classNames(
        styles.card,
        selected && styles.selected,
        disabled && styles.disabled
      )}
      onClick={disabled ? undefined : onClick}
    >
      <View className={styles.leftSection}>
        <Text className={styles.discountValue}>{getDiscountValue()}</Text>
        <Text className={styles.discountLabel}>{getTypeLabel()}</Text>
      </View>
      <View className={styles.divider}>
        <View className={styles.circleTop} />
        <View className={styles.circleBottom} />
      </View>
      <View className={styles.rightSection}>
        <Text className={styles.name}>{discount.name}</Text>
        <Text className={styles.condition}>{getCondition()}</Text>
        <Text className={styles.desc}>{discount.description}</Text>
        {isCoupon && discount.maxDiscount && (
          <Text className={styles.limit}>最高减免 ¥{discount.maxDiscount}</Text>
        )}
      </View>
      {selected && (
        <View className={styles.selectedBadge}>
          <Text className={styles.selectedText}>✓</Text>
        </View>
      )}
    </View>
  )
}

export default CouponCard
