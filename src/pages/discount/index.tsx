import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import classNames from 'classnames'
import styles from './index.module.scss'
import { useDiscountStore } from '@/store/useDiscountStore'
import CouponCard from '@/components/CouponCard'

const DiscountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'coupons' | 'order'>('calculator')
  const [testPrice, setTestPrice] = useState(500)
  
  const {
    discounts,
    orderConfig,
    selectedDiscountIds,
    toggleDiscount,
    moveDiscountOrder,
    setOrderConfig,
    calculate
  } = useDiscountStore()

  const orderedDiscounts = useMemo(() => {
    return orderConfig.order
      .map(id => discounts.find(d => d.id === id))
      .filter((d): d is typeof discounts[0] => d !== undefined)
  }, [discounts, orderConfig.order])

  const calcResult = useMemo(() => {
    return calculate(testPrice)
  }, [calculate, testPrice, selectedDiscountIds])

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      moveDiscountOrder(index, index - 1)
    }
  }

  const handleMoveDown = (index: number) => {
    if (index < orderedDiscounts.length - 1) {
      moveDiscountOrder(index, index + 1)
    }
  }

  const handleToggleNegative = () => {
    setOrderConfig({ allowNegative: !orderConfig.allowNegative })
  }

  const adjustPrice = (delta: number) => {
    setTestPrice(prev => Math.max(0, prev + delta))
  }

  return (
    <View className={styles.page}>
      <View className={styles.tabs}>
        <View
          className={classNames(styles.tabItem, activeTab === 'calculator' && styles.active)}
          onClick={() => setActiveTab('calculator')}
        >
          优惠计算
        </View>
        <View
          className={classNames(styles.tabItem, activeTab === 'coupons' && styles.active)}
          onClick={() => setActiveTab('coupons')}
        >
          优惠券
        </View>
        <View
          className={classNames(styles.tabItem, activeTab === 'order' && styles.active)}
          onClick={() => setActiveTab('order')}
        >
          优惠顺序
        </View>
      </View>

      <ScrollView className={styles.content} scrollY>
        {activeTab === 'calculator' && (
          <View>
            <View className={styles.calculator}>
              <Text className={styles.calcTitle}>优惠计算器</Text>
              <View className={styles.calcInput}>
                <Text className={styles.label}>原价</Text>
                <Text className={styles.input}>¥{testPrice}</Text>
              </View>
              <View className={styles.inputAdjust}>
                <View className={styles.adjustBtn} onClick={() => adjustPrice(-50)}>-</View>
                <View className={styles.adjustBtn} onClick={() => adjustPrice(50)}>+</View>
              </View>
              <View className={styles.calcResult}>
                <View className={styles.calcResultRow}>
                  <Text>原价</Text>
                  <Text className={styles.calcResultValue}>¥{calcResult.originalPrice.toFixed(2)}</Text>
                </View>
                <View className={styles.calcResultRow}>
                  <Text>优惠金额</Text>
                  <Text className={styles.calcResultValue}>-¥{calcResult.totalDiscount.toFixed(2)}</Text>
                </View>
                <View className={styles.calcResultRow}>
                  <Text>实付金额</Text>
                  <Text className={styles.finalPrice}>¥{calcResult.finalPrice.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            <Text className={styles.sectionTitle}>
              计算步骤
              <Text className={styles.sectionHint}>共 {calcResult.details.length} 步</Text>
            </Text>

            <View className={styles.detailSteps}>
              {calcResult.details.length > 0 ? (
                calcResult.details.map((detail, index) => (
                  <View key={detail.discountId} className={styles.stepItem}>
                    <View className={styles.stepNum}>{index + 1}</View>
                    <View className={styles.stepContent}>
                      <Text className={styles.stepName}>{detail.discountName}</Text>
                      <Text className={styles.stepDiscount}>减免 ¥{detail.discountAmount.toFixed(2)}</Text>
                      <Text className={styles.stepPrice}>剩余 ¥{detail.stepPrice.toFixed(2)}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{ color: '#94a3b8', fontSize: '28rpx', textAlign: 'center', padding: '32rpx 0' }}>
                  暂无优惠，请先选择优惠券
                </Text>
              )}

              {calcResult.hasNegativeProtection && (
                <View className={styles.negativeWarning}>
                  <Text className={styles.negativeWarningIcon}>⚠️</Text>
                  <Text className={styles.negativeWarningText}>
                    触发负值兜底保护，最终价格已设为 0 元
                  </Text>
                </View>
              )}
            </View>

            <Text className={styles.sectionTitle}>
              可选优惠
              <Text className={styles.sectionHint}>点击选择参与计算</Text>
            </Text>
            {discounts.map(discount => (
              <CouponCard
                key={discount.id}
                discount={discount}
                selected={selectedDiscountIds.includes(discount.id)}
                onClick={() => toggleDiscount(discount.id)}
              />
            ))}
          </View>
        )}

        {activeTab === 'coupons' && (
          <View>
            <Text className={styles.sectionTitle}>
              我的优惠券
              <Text className={styles.sectionHint}>共 {discounts.length} 张</Text>
            </Text>
            {discounts.map(discount => (
              <CouponCard
                key={discount.id}
                discount={discount}
                selected={selectedDiscountIds.includes(discount.id)}
                onClick={() => toggleDiscount(discount.id)}
              />
            ))}
          </View>
        )}

        {activeTab === 'order' && (
          <View>
            <View className={styles.orderTip}>
              <Text className={styles.orderTipIcon}>💡</Text>
              <Text className={styles.orderTipText}>
                优惠计算顺序会影响最终价格。一般建议：先折扣券后满减，或先满减后折扣，结果可能不同。
              </Text>
            </View>

            <Text className={styles.sectionTitle}>
              计算顺序
              <Text className={styles.sectionHint}>从上到下依次计算</Text>
            </Text>

            <View className={styles.orderList}>
              {orderedDiscounts.map((discount, index) => (
                <View key={discount.id} className={styles.orderItem}>
                  <View className={styles.orderIndex}>{index + 1}</View>
                  <Text className={styles.orderName}>{discount.name}</Text>
                  <View className={styles.orderActions}>
                    <View
                      className={styles.orderBtn}
                      onClick={() => handleMoveUp(index)}
                    >
                      ↑
                    </View>
                    <View
                      className={styles.orderBtn}
                      onClick={() => handleMoveDown(index)}
                    >
                      ↓
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <Text className={styles.sectionTitle}>负值保护</Text>
            <View className={styles.negativeToggle}>
              <View>
                <Text className={styles.negativeLabel}>不允许最终价格为负</Text>
                <Text className={styles.negativeDesc}>
                  开启后，若优惠叠加后价格为负，将自动归零
                </Text>
              </View>
              <View
                className={classNames(styles.switch, !orderConfig.allowNegative && styles.active)}
                onClick={handleToggleNegative}
              >
                <View className={styles.switchDot} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default DiscountPage
