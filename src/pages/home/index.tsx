import React, { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { useRinkStore } from '@/store/useRinkStore'
import { useBookingStore } from '@/store/useBookingStore'
import RinkCard from '@/components/RinkCard'
import BookingCard from '@/components/BookingCard'
import { formatDate } from '@/utils/date'

const HomePage: React.FC = () => {
  const rinks = useRinkStore(state => state.rinks)
  const bookings = useBookingStore(state => state.bookings)

  const today = formatDate(new Date(), 'YYYY-MM-DD')
  const todayBookings = useMemo(
    () => bookings.filter(b => b.date === today && b.status !== 'cancelled'),
    [bookings, today]
  )
  
  const stats = useMemo(() => {
    const confirmed = bookings.filter(b => b.status === 'confirmed').length
    const pending = bookings.filter(b => b.status === 'pending').length
    return { confirmed, pending, total: bookings.length }
  }, [bookings])

  const quickEntries = [
    { icon: '📅', text: '周期预约', key: 'cycle', path: '/pages/booking/index' },
    { icon: '⛸️', text: '冰刀租借', key: 'skate', path: '/pages/skate-rental/index' },
    { icon: '💰', text: '我的账单', key: 'bill', path: '/pages/mine/index' },
    { icon: '🎟️', text: '优惠券', key: 'coupon', path: '/pages/discount/index' }
  ]

  const handleQuickClick = (path: string) => {
    if (path.includes('tabBar')) {
      Taro.switchTab({ url: path })
    } else {
      Taro.navigateTo({ url: path })
    }
  }

  const handleViewAllRinks = () => {
    Taro.switchTab({ url: '/pages/booking/index' })
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.greeting}>你好，冰友</Text>
        <Text className={styles.subtitle}>今天是滑冰的好日子</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.total}</Text>
            <Text className={styles.statLabel}>总预约</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.confirmed}</Text>
            <Text className={styles.statLabel}>已确认</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.pending}</Text>
            <Text className={styles.statLabel}>待支付</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.quickEntry}>
          <Text className={styles.quickTitle}>快捷入口</Text>
          <View className={styles.quickGrid}>
            {quickEntries.map((item, index) => (
              <View
                key={item.key}
                className={styles.quickItem}
                onClick={() => handleQuickClick(item.path)}
              >
                <View className={`${styles.quickIcon} ${styles[`quickIcon${index + 1}`]}`}>
                  {item.icon}
                </View>
                <Text className={styles.quickText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>今日预约</Text>
            <Text className={styles.sectionMore} onClick={() => Taro.switchTab({ url: '/pages/booking/index' })}>
              全部 →
            </Text>
          </View>
          {todayBookings.length > 0 ? (
            todayBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <View className={styles.todayBooking}>
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>❄️</Text>
                <Text>今天还没有预约</Text>
              </View>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>冰场区域</Text>
            <Text className={styles.sectionMore} onClick={handleViewAllRinks}>
              查看全部 →
            </Text>
          </View>
          {rinks.slice(0, 2).map(rink => (
            <RinkCard key={rink.id} rink={rink} />
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

export default HomePage
