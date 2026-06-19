import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classNames from 'classnames'
import styles from './index.module.scss'
import type { Booking } from '@/types/booking'
import { getDateDayName } from '@/utils/date'

interface BookingCardProps {
  booking: Booking
  onClick?: () => void
  showStatus?: boolean
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onClick, showStatus = true }) => {
  const statusMap: Record<string, { label: string; className: string }> = {
    pending: { label: '待支付', className: styles.statusPending },
    confirmed: { label: '已确认', className: styles.statusConfirmed },
    cancelled: { label: '已取消', className: styles.statusCancelled },
    completed: { label: '已完成', className: styles.statusCompleted }
  }

  const status = statusMap[booking.status]

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      Taro.navigateTo({
        url: `/pages/booking-detail/index?id=${booking.id}`
      })
    }
  }

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <Text className={styles.rinkName}>{booking.rinkName}</Text>
        {showStatus && status && (
          <Text className={classNames(styles.status, status.className)}>
            {status.label}
          </Text>
        )}
      </View>
      <View className={styles.timeSection}>
        <View className={styles.dateBox}>
          <Text className={styles.date}>{booking.date}</Text>
          <Text className={styles.weekday}>{getDateDayName(booking.date)}</Text>
        </View>
        <View className={styles.timeBox}>
          <Text className={styles.time}>{booking.timeSlotLabel}</Text>
          {booking.skateRental && (
            <Text className={styles.skateTag}>含冰刀 {booking.skateRental.size}码</Text>
          )}
        </View>
      </View>
      <View className={styles.footer}>
        <Text className={styles.skater}>{booking.skaterName}</Text>
        <View className={styles.price}>
          {booking.originalPrice !== booking.finalPrice && (
            <Text className={styles.originalPrice}>¥{booking.originalPrice}</Text>
          )}
          <Text className={styles.finalPrice}>¥{booking.finalPrice}</Text>
        </View>
      </View>
    </View>
  )
}

export default BookingCard
