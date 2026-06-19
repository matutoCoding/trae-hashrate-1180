import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classNames from 'classnames'
import styles from './index.module.scss'
import { useBookingStore } from '@/store/useBookingStore'
import { useRinkStore } from '@/store/useRinkStore'
import { useBillStore } from '@/store/useBillStore'
import { getDateDayName } from '@/utils/date'
import TimeSlotPicker from '@/components/TimeSlotPicker'
import { mockSkateSizes } from '@/data/skate'
import type { TimeSlot } from '@/types/rink'

const BookingDetailPage: React.FC = () => {
  const router = useRouter()
  const bookings = useBookingStore(state => state.bookings)
  const updateBooking = useBookingStore(state => state.updateBooking)
  const rinks = useRinkStore(state => state.rinks)
  const bills = useBillStore(state => state.bills)
  const updateBillByBookingId = useBillStore(state => state.updateBillByBookingId)
  const bookingId = router.params.id as string

  const booking = useMemo(() => bookings.find(b => b.id === bookingId), [bookings, bookingId])
  const bill = useMemo(() => bills.find(b => b.bookingId === bookingId), [bills, bookingId])

  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({
    date: '',
    rinkId: '',
    timeSlotId: '',
    skaterPhone: '',
    skateSize: '',
    skatePrice: 0
  })

  const startEdit = () => {
    if (!booking) return
    setEditData({
      date: booking.date,
      rinkId: booking.rinkId,
      timeSlotId: booking.timeSlotId,
      skaterPhone: booking.skaterPhone,
      skateSize: booking.skateRental?.size || '',
      skatePrice: booking.skateRental?.price || 0
    })
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
  }

  const saveEdit = () => {
    if (!booking) return
    const rink = rinks.find(r => r.id === editData.rinkId)
    const slot = rink?.timeSlots.find(s => s.id === editData.timeSlotId)
    if (!slot) {
      Taro.showToast({ title: '请选择有效时段', icon: 'none' })
      return
    }
    const updates: Partial<typeof booking> = {
      date: editData.date,
      rinkId: editData.rinkId,
      rinkName: rink?.name || booking.rinkName,
      timeSlotId: editData.timeSlotId,
      timeSlotLabel: `${slot.startTime}-${slot.endTime}`,
      startTime: slot.startTime,
      endTime: slot.endTime,
      originalPrice: slot.price,
      finalPrice: slot.price,
      skaterPhone: editData.skaterPhone
    }
    if (editData.skateSize) {
      const sizeInfo = mockSkateSizes.find(s => s.size === editData.skateSize)
      updates.skateRental = {
        size: editData.skateSize,
        price: sizeInfo?.rentalPrice || 30
      }
    } else {
      updates.skateRental = undefined
    }
    updateBooking(bookingId, updates)
    const updatedBooking = { ...booking, ...updates }
    const newSkateRentalFee = updatedBooking.skateRental?.price || 0
    const newOriginalAmount = (updatedBooking.originalPrice || 0) + newSkateRentalFee
    const newTotalAmount = (updatedBooking.finalPrice || 0) + newSkateRentalFee
    updateBillByBookingId(bookingId, {
      bookingInfo: {
        rinkName: updatedBooking.rinkName,
        date: updatedBooking.date,
        timeSlotLabel: updatedBooking.timeSlotLabel,
        skaterName: updatedBooking.skaterName
      },
      originalAmount: newOriginalAmount,
      skateRentalFee: newSkateRentalFee,
      totalAmount: Math.max(0, Number(newTotalAmount.toFixed(2)))
    })
    setEditing(false)
    Taro.showToast({ title: '修改成功', icon: 'success' })
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

  const handlePay = () => {
    Taro.navigateTo({ url: `/pages/bill-detail/index?bookingId=${bookingId}` })
  }

  if (!booking) {
    return (
      <View className={styles.page}>
        <Text>预约不存在</Text>
      </View>
    )
  }

  const statusMap: Record<string, { icon: string; text: string; desc: string }> = {
    pending: { icon: '💰', text: '待支付', desc: '请尽快完成支付以确认预约' },
    confirmed: { icon: '✅', text: '已确认', desc: '预约已确认，请准时到场' },
    cancelled: { icon: '❌', text: '已取消', desc: '预约已取消' },
    completed: { icon: '🎉', text: '已完成', desc: '本次滑冰已完成' }
  }
  const status = statusMap[booking.status]

  const billStatusMap: Record<string, { icon: string; text: string }> = {
    unpaid: { icon: '⏳', text: '待支付' },
    paid: { icon: '✅', text: '已支付' },
    refunded: { icon: '↩️', text: '已退款' }
  }

  const editRink = rinks.find(r => r.id === editData.rinkId)

  if (editing) {
    return (
      <View className={styles.page}>
        <ScrollView scrollY>
          <View className={styles.content}>
            <View className={styles.infoCard}>
              <Text className={styles.cardTitle}>修改预约</Text>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>日期</Text>
                <Input
                  className={styles.formInput}
                  type="text"
                  placeholder="YYYY-MM-DD"
                  value={editData.date}
                  onInput={e => setEditData(prev => ({ ...prev, date: e.detail.value }))}
                />
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>选择冰场</Text>
                <View className={styles.rinkList}>
                  {rinks.map(rink => (
                    <View
                      key={rink.id}
                      className={classNames(styles.rinkOption, editData.rinkId === rink.id && styles.rinkOptionActive)}
                      onClick={() => setEditData(prev => ({ ...prev, rinkId: rink.id, timeSlotId: '' }))}
                    >
                      <Text className={styles.rinkOptionName}>{rink.name}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {editRink && (
                <View className={styles.formItem}>
                  <Text className={styles.formLabel}>选择时段</Text>
                  <TimeSlotPicker
                    slots={editRink.timeSlots}
                    selectedId={editData.timeSlotId}
                    onSelect={(slot: TimeSlot) => setEditData(prev => ({ ...prev, timeSlotId: slot.id }))}
                  />
                </View>
              )}

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>联系电话</Text>
                <Input
                  className={styles.formInput}
                  type="text"
                  placeholder="请输入手机号"
                  value={editData.skaterPhone}
                  onInput={e => setEditData(prev => ({ ...prev, skaterPhone: e.detail.value }))}
                />
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>冰刀租借尺码（留空则不租借）</Text>
                <View className={styles.sizeGrid}>
                  <View
                    className={classNames(styles.sizeChip, editData.skateSize === '' && styles.sizeChipActive)}
                    onClick={() => setEditData(prev => ({ ...prev, skateSize: '' }))}
                  >
                    不租借
                  </View>
                  {mockSkateSizes.map(s => (
                    <View
                      key={s.size}
                      className={classNames(styles.sizeChip, editData.skateSize === s.size && styles.sizeChipActive)}
                      onClick={() => setEditData(prev => ({ ...prev, skateSize: s.size, skatePrice: s.rentalPrice }))}
                    >
                      {s.size}
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <View className={styles.footer}>
          <View className={classNames(styles.btn, styles.secondary)} onClick={cancelEdit}>取消</View>
          <View className={classNames(styles.btn, styles.primary)} onClick={saveEdit}>保存</View>
        </View>
      </View>
    )
  }

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

          {bill && (
            <View className={styles.infoCard}>
              <Text className={styles.cardTitle}>账单信息</Text>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>支付状态</Text>
                <Text className={styles.infoValue}>
                  {billStatusMap[bill.status].icon} {billStatusMap[bill.status].text}
                </Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>应付金额</Text>
                <Text className={classNames(styles.infoValue, styles.infoValueHighlight)}>
                  ¥{bill.totalAmount.toFixed(2)}
                </Text>
              </View>
              <View
                className={styles.linkBtn}
                onClick={() => Taro.navigateTo({ url: `/pages/bill-detail/index?bookingId=${bookingId}` })}
              >
                查看账单详情 →
              </View>
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
            <View className={classNames(styles.btn, styles.primary)} onClick={startEdit}>
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
