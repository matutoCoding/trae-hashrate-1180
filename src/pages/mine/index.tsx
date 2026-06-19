import React, { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { useBookingStore } from '@/store/useBookingStore'
import { useBillStore } from '@/store/useBillStore'
import { useDiscountStore } from '@/store/useDiscountStore'

const MinePage: React.FC = () => {
  const { bookings, cycleRules } = useBookingStore()
  const { bills } = useBillStore()
  const { discounts } = useDiscountStore()

  const stats = useMemo(() => {
    const totalBookings = bookings.filter(b => b.status !== 'cancelled').length
    const pendingBills = bills.filter(b => b.status === 'unpaid').length
    const couponCount = discounts.length
    return { totalBookings, pendingBills, couponCount, cycleCount: cycleRules.length }
  }, [bookings, bills, discounts, cycleRules])

  const menuItems = [
    { icon: '📋', text: '我的账单', desc: `${bills.length} 笔账单`, key: 'bill', iconClass: 'icon1' },
    { icon: '🎟️', text: '我的优惠券', desc: `${discounts.length} 张可用`, key: 'coupon', iconClass: 'icon2' },
    { icon: '⛸️', text: '冰刀租借', desc: '查看尺码和租借记录', key: 'skate', iconClass: 'icon3' },
    { icon: '📅', text: '周期规则', desc: `${cycleRules.length} 个进行中`, key: 'cycle', iconClass: 'icon4' }
  ]

  const settingItems = [
    { icon: '⚙️', text: '设置', key: 'setting', iconClass: 'icon5' },
    { icon: '❓', text: '帮助与反馈', key: 'help', iconClass: 'icon6' }
  ]

  const handleMenuClick = (key: string) => {
    switch (key) {
      case 'bill':
        Taro.navigateTo({ url: '/pages/bill-detail/index?id=bill-001' })
        break
      case 'coupon':
        Taro.switchTab({ url: '/pages/discount/index' })
        break
      case 'skate':
        Taro.navigateTo({ url: '/pages/skate-rental/index' })
        break
      case 'cycle':
        Taro.switchTab({ url: '/pages/booking/index' })
        break
      default:
        Taro.showToast({ title: '功能开发中', icon: 'none' })
    }
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <View className={styles.avatar}>❄️</View>
          <View className={styles.userDetail}>
            <View style={{ display: 'flex', alignItems: 'center' }}>
              <Text className={styles.userName}>冰上飞人</Text>
              <Text className={styles.vipTag}>VIP</Text>
            </View>
            <Text className={styles.userPhone}>138****1234</Text>
          </View>
        </View>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{stats.totalBookings}</Text>
          <Text className={styles.statLabel}>总预约</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{stats.cycleCount}</Text>
          <Text className={styles.statLabel}>周期规则</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{stats.pendingBills}</Text>
          <Text className={styles.statLabel}>待支付</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{stats.couponCount}</Text>
          <Text className={styles.statLabel}>优惠券</Text>
        </View>
      </View>

      <View className={styles.skateSection}>
        <View className={styles.skateHeader}>
          <Text className={styles.skateTitle}>常用冰刀尺码</Text>
          <Text
            className={styles.skateEdit}
            onClick={() => Taro.navigateTo({ url: '/pages/skate-rental/index' })}
          >
            管理
          </Text>
        </View>
        <View className={styles.skateSize}>
          <Text className={styles.skateSizeValue}>42</Text>
          <Text className={styles.skateSizeLabel}>码 (EU)</Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        <Text className={styles.menuTitle}>我的服务</Text>
        {menuItems.map(item => (
          <View
            key={item.key}
            className={styles.menuItem}
            onClick={() => handleMenuClick(item.key)}
          >
            <View className={`${styles.menuIcon} ${styles[item.iconClass]}`}>
              {item.icon}
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuText}>{item.text}</Text>
              {item.desc && <Text className={styles.menuDesc}>{item.desc}</Text>}
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        ))}
      </View>

      <View className={styles.menuSection}>
        <Text className={styles.menuTitle}>其他</Text>
        {settingItems.map(item => (
          <View
            key={item.key}
            className={styles.menuItem}
            onClick={() => handleMenuClick(item.key)}
          >
            <View className={`${styles.menuIcon} ${styles[item.iconClass]}`}>
              {item.icon}
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuText}>{item.text}</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

export default MinePage
