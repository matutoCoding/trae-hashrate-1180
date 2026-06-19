import React, { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classNames from 'classnames'
import styles from './index.module.scss'
import { useBillStore } from '@/store/useBillStore'
import { formatDateTime } from '@/utils/date'

const BillDetailPage: React.FC = () => {
  const router = useRouter()
  const { getBillById, payBill } = useBillStore()
  const billId = router.params.id as string
  
  const bill = useMemo(() => getBillById(billId), [getBillById, billId])

  const statusMap: Record<string, { icon: string; text: string }> = {
    unpaid: { icon: '⏳', text: '待支付' },
    paid: { icon: '✅', text: '已支付' },
    refunded: { icon: '↩️', text: '已退款' }
  }

  const handlePay = () => {
    Taro.showModal({
      title: '确认支付',
      content: `确认支付 ¥${bill?.totalAmount.toFixed(2)} 吗？`,
      success: (res) => {
        if (res.confirm) {
          payBill(billId)
          Taro.showToast({ title: '支付成功', icon: 'success' })
        }
      }
    })
  }

  if (!bill) {
    return (
      <View className={styles.page}>
        <Text>账单不存在</Text>
      </View>
    )
  }

  const status = statusMap[bill.status]

  return (
    <View className={styles.page}>
      <ScrollView scrollY>
        <View className={styles.content}>
          <View className={styles.statusHeader}>
            <Text className={styles.statusIcon}>{status.icon}</Text>
            <Text className={styles.statusText}>{status.text}</Text>
            <Text className={styles.amount}>¥{bill.totalAmount.toFixed(2)}</Text>
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
              <Text className={styles.infoLabel}>滑客</Text>
              <Text className={styles.infoValue}>{bill.bookingInfo.skaterName}</Text>
            </View>
          </View>

          <View className={styles.infoCard}>
            <Text className={styles.cardTitle}>
              费用明细
              {bill.discountResult.hasNegativeProtection && (
                <Text style={{ fontSize: '22rpx', color: '#f59e0b', fontWeight: 'normal' }}>
                  已触发负值兜底
                </Text>
              )}
            </Text>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>滑冰费用</Text>
              <Text className={styles.infoValue}>¥{bill.discountResult.originalPrice.toFixed(2)}</Text>
            </View>
            {bill.skateRentalFee > 0 && (
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>冰刀租借</Text>
                <Text className={styles.infoValue}>¥{bill.skateRentalFee.toFixed(2)}</Text>
              </View>
            )}
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>原价合计</Text>
              <Text className={styles.infoValue}>¥{bill.originalAmount.toFixed(2)}</Text>
            </View>

            <View className={styles.discountSection}>
              <View className={styles.infoRow} style={{ marginBottom: '16rpx' }}>
                <Text className={styles.infoLabel}>优惠明细</Text>
                <Text className={styles.infoValue} style={{ color: '#ef4444' }}>
                  -¥{bill.discountResult.totalDiscount.toFixed(2)}
                </Text>
              </View>
              {bill.discountResult.details.map((detail, index) => (
                <View key={detail.discountId} className={styles.discountStep}>
                  <Text className={styles.stepName}>
                    {index + 1}. {detail.discountName}
                  </Text>
                  <Text className={styles.stepAmount}>-¥{detail.discountAmount.toFixed(2)}</Text>
                </View>
              ))}
              {bill.discountResult.details.length === 0 && (
                <View className={styles.discountStep}>
                  <Text className={styles.stepName}>无优惠</Text>
                  <Text className={styles.stepAmount}>-¥0.00</Text>
                </View>
              )}
            </View>

            <View className={styles.totalRow}>
              <Text className={styles.totalLabel}>实付金额</Text>
              <Text className={styles.totalValue}>¥{bill.totalAmount.toFixed(2)}</Text>
            </View>

            {bill.discountResult.hasNegativeProtection && (
              <View className={styles.protectionTip}>
                <Text className={styles.protectionIcon}>⚠️</Text>
                <Text className={styles.protectionText}>
                  优惠叠加后金额为负，已触发负值兜底保护，最终价格设为 0 元
                </Text>
              </View>
            )}
          </View>

          <View className={styles.infoCard}>
            <Text className={styles.cardTitle}>账单信息</Text>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>账单编号</Text>
              <Text className={styles.infoValue}>{bill.id}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>创建时间</Text>
              <Text className={styles.infoValue}>{bill.createTime}</Text>
            </View>
            {bill.payTime && (
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>支付时间</Text>
                <Text className={styles.infoValue}>{bill.payTime}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View className={styles.footer}>
        {bill.status === 'unpaid' && (
          <>
            <View className={classNames(styles.btn, styles.secondary)} onClick={() => Taro.navigateBack()}>
              稍后支付
            </View>
            <View className={classNames(styles.btn, styles.primary)} onClick={handlePay}>
              立即支付
            </View>
          </>
        )}
        {bill.status !== 'unpaid' && (
          <View className={classNames(styles.btn, styles.primary)} onClick={() => Taro.navigateBack()}>
            返回
          </View>
        )}
      </View>
    </View>
  )
}

export default BillDetailPage
