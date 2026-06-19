import React, { useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classNames from 'classnames'
import styles from './index.module.scss'
import useBillStore from '@/store/useBillStore'
import useBookingStore from '@/store/useBookingStore'

const PayResult: React.FC = () => {
  const router = useRouter()
  const bookingId = router.params.bookingId
  const billId = router.params.billId

  const bills = useBillStore(state => state.bills)
  const bookings = useBookingStore(state => state.bookings)

  const bill = useMemo(() => {
    if (billId) return bills.find(b => b.id === billId)
    if (bookingId) return bills.find(b => b.bookingId === bookingId)
    return undefined
  }, [bills, billId, bookingId])

  const booking = useMemo(() => {
    if (!bill) return undefined
    return bookings.find(b => b.id === bill.bookingId)
  }, [bookings, bill])

  if (!bill || !booking) {
    return (
      <View className={styles.page}>
        <View className={styles.content}>
          <View className={styles.emptyPlaceholder}>
            <Text>账单不存在</Text>
          </View>
        </View>
      </View>
    )
  }

  const discountTotal = bill.originalAmount - bill.discountResult.finalPrice

  const handleViewBooking = () => {
    Taro.redirectTo({ url: `/pages/booking-detail/index?id=${bill.bookingId}` })
  }

  const handleBackToBills = () => {
    const pages = Taro.getCurrentPages()
    if (pages.length > 1) {
      Taro.navigateBack()
    } else {
      Taro.switchTab({ url: '/pages/mine/index' })
    }
  }

  return (
    <View className={styles.page}>
      <View className={styles.content}>
        <View className={styles.successHeader}>
          <Text className={styles.successIcon}>✅</Text>
          <Text className={styles.successTitle}>支付成功</Text>
          <Text className={styles.successAmount}>¥{bill.totalAmount.toFixed(2)}</Text>
        </View>

        <View className={styles.infoCard}>
          <Text className={styles.cardTitle}>预约信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>冰场</Text>
            <Text className={styles.infoValue}>{bill.bookingInfo.rinkName}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>日期</Text>
            <Text className={styles.infoValue}>{bill.bookingInfo.date}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>时段</Text>
            <Text className={styles.infoValue}>{bill.bookingInfo.timeSlotLabel}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>滑手</Text>
            <Text className={styles.infoValue}>{bill.bookingInfo.skaterName}</Text>
          </View>
        </View>

        <View className={styles.infoCard}>
          <Text className={styles.cardTitle}>费用明细</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>原价</Text>
            <Text className={styles.infoValue}>¥{bill.originalAmount.toFixed(2)}</Text>
          </View>
          {discountTotal > 0 && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>优惠</Text>
              <Text className={styles.discountValue}>-¥{discountTotal.toFixed(2)}</Text>
            </View>
          )}
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>实付金额</Text>
            <Text className={styles.highlightValue}>¥{bill.totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View className={styles.footer}>
        <View className={classNames(styles.btn, styles.secondary)} onClick={handleBackToBills}>
          <Text>返回账单列表</Text>
        </View>
        <View className={classNames(styles.btn, styles.primary)} onClick={handleViewBooking}>
          <Text>查看预约详情</Text>
        </View>
      </View>
    </View>
  )
}

export default PayResult
