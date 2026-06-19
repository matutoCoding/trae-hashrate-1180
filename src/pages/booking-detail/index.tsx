import React, { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classNames from 'classnames'
import styles from './index.module.scss'
import { useBookingStore } from '@/store/useBookingStore'
import { getDateDayName } from '@/utils/date'

const BookingDetailPage: React.FC = () => {
  const router = useRouter()
  const { getBookingById, updateBooking } = useBookingStore()
  const bookingId = router.params.id as string
  
  const booking = useMemo(() => getBookingById(bookingId), [getBookingById, bookingId])

  const statusMap: Record<string, { icon: string; text: string; desc: string }> = {
    pending: { icon: '⏳', text: '待确认', desc: '预约正在等待确认' },
    confirmed: { icon: '✅', text: '已确认', desc: '预约已确认，请准时到场' },
    cancelled: { icon: '❌', text: '已取消', desc: '预约已取消' },
    completed: { icon: '🎉', text: '已完成', desc: '本次滑冰已完成' }
  }

  const handleCancel = () => {
    Taro.showModal({
      title: '取消预约',
      content: '确定要取消这个预约吗？',
      success: (res) => {
        if (res.confirm) {
          updateBooking(bookingId, { status: 'cancelled' })
          Taro.showToast({ title: '已取消', icon: 'success' })
        }
      }
    })
  }

  const handleModify = () => {
    Taro.showToast({ title: '修改功能开发中', icon: 'none' })
  }

  const handlePay = () => {
    Taro.showToast({ title: '支付功能开发中', icon: 'none' })
  }

  if (!booking) {
    return (
      <View className={styles.page}>
        <Text>预约不存在</Text>
      </View>
    )
  }

  const status = statusMap[booking.status]

  return (
    <View className={styles.page}>
      <ScrollView scrollY>
        <View className={styles.content}>
          <View className={styles.statusBanner}>
            <Text className={styles.statusIcon}>{status.icon}</Text>
            <Text className={styles.statusText}>{status.text}</Text>
            <Text className={styles.statusDesc}>{status.desc}</Text>
          </View>

          <View className={styles.infoCard}>
            <Text className={styles.cardTitle}>预约信息</Text>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>冰场</Text>
              <Text className={styles.infoValue}>{booking.rinkName}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>日期</Text>
              <Text className={styles.infoValue}>
                {booking.date} {getDateDayName(booking.date)}
              </Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>时段</Text>
              <Text className={styles.infoValue}>{booking.timeSlotLabel}</Text>
            </View>
            {booking.skateRental && (
              <View className={styles.skateInfo}>
                <Text className={styles.skateLabel}>冰刀租借</Text>
                <Text className={styles.skateSize}>
                  {booking.skateRental.size}码 · ¥{booking.skateRental.price}
                </Text>
              </View>
            )}
          </View>

          <View className={styles.infoCard}>
            <Text className={styles.cardTitle}>滑客信息</Text>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>姓名</Text>
              <Text className={styles.infoValue}>{booking.skaterName}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>电话</Text>
              <Text className={styles.infoValue}>{booking.skaterPhone}</Text>
            </View>
          </View>

          <View className={styles.infoCard}>
            <Text className={styles.cardTitle}>费用信息</Text>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>原价</Text>
              <Text className={styles.infoValue}>¥{booking.originalPrice.toFixed(2)}</Text>
            </View>
            {booking.originalPrice !== booking.finalPrice && (
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>优惠</Text>
                <Text className={styles.infoValue} style={{ color: '#ef4444' }}>
                  -¥{(booking.originalPrice - booking.finalPrice).toFixed(2)}
                </Text>
              </View>
            )}
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>实付</Text>
              <Text className={classNames(styles.infoValue, styles.infoValueHighlight)}>
                ¥{booking.finalPrice.toFixed(2)}
              </Text>
            </View>
          </View>

          {booking.note && (
            <View className={styles.infoCard}>
              <Text className={styles.cardTitle}>备注</Text>
              <Text className={styles.note}>{booking.note}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className={styles.footer}>
        {booking.status === 'confirmed' && (
          <>
            <View className={classNames(styles.btn, styles.danger)} onClick={handleCancel}>
              取消预约
            </View>
            <View className={classNames(styles.btn, styles.primary)} onClick={handleModify}>
              修改预约
            </View>
          </>
        )}
        {booking.status === 'pending' && (
          <>
            <View className={classNames(styles.btn, styles.secondary)} onClick={handleCancel}>
              取消
            </View>
            <View className={classNames(styles.btn, styles.primary)} onClick={handlePay}>
              去支付
            </View>
          </>
        )}
        {(booking.status === 'cancelled' || booking.status === 'completed') && (
          <View className={classNames(styles.btn, styles.primary)} onClick={() => Taro.navigateBack()}>
            返回
          </View>
        )}
      </View>
    </View>
  )
}

export default BookingDetailPage
