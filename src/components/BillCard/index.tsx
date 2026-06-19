import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classNames from 'classnames'
import styles from './index.module.scss'
import type { Bill } from '@/types/bill'

interface BillCardProps {
  bill: Bill
  onClick?: () => void
}

const BillCard: React.FC<BillCardProps> = ({ bill, onClick }) => {
  const statusMap: Record<string, { label: string; className: string }> = {
    unpaid: { label: '待支付', className: styles.statusUnpaid },
    paid: { label: '已支付', className: styles.statusPaid },
    refunded: { label: '已退款', className: styles.statusRefunded },
    suspended: { label: '已暂停', className: styles.statusSuspended }
  }

  const status = statusMap[bill.status]

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      Taro.navigateTo({
        url: `/pages/bill-detail/index?id=${bill.id}`
      })
    }
  }

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <Text className={styles.title}>{bill.bookingInfo.rinkName}</Text>
        {status && (
          <Text className={classNames(styles.status, status.className)}>
            {status.label}
          </Text>
        )}
      </View>
      <View className={styles.info}>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>日期</Text>
          <Text className={styles.infoValue}>{bill.bookingInfo.date}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>时段</Text>
          <Text className={styles.infoValue}>{bill.bookingInfo.timeSlotLabel}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>滑客</Text>
          <Text className={styles.infoValue}>{bill.bookingInfo.skaterName}</Text>
        </View>
      </View>
      <View className={styles.footer}>
        <View className={styles.priceInfo}>
          {bill.discountResult.totalDiscount > 0 && (
            <Text className={styles.discount}>已优惠 ¥{bill.discountResult.totalDiscount}</Text>
          )}
          <Text className={styles.total}>
            合计 <Text className={styles.totalPrice}>¥{bill.totalAmount}</Text>
          </Text>
        </View>
        {bill.status === 'unpaid' && (
          <View className={styles.payBtn}>
            <Text className={styles.payText}>去支付</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default BillCard
