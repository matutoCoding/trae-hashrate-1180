import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classNames from 'classnames'
import styles from './index.module.scss'
import { useRinkStore } from '@/store/useRinkStore'
import { useBookingStore } from '@/store/useBookingStore'
import BookingCard from '@/components/BookingCard'
import TimeSlotPicker from '@/components/TimeSlotPicker'
import { getDayName, formatDate, addDays } from '@/utils/date'
import type { TimeSlot } from '@/types/rink'
import type { CycleRule } from '@/types/booking'

const BookingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cycle' | 'list'>('cycle')
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('all')
  
  const { rinks } = useRinkStore()
  const { cycleRules, bookings, addCycleRule, generateBookingsFromCycle } = useBookingStore()

  const [formData, setFormData] = useState({
    name: '',
    rinkId: '',
    timeSlotId: '',
    dayOfWeek: 6,
    startDate: formatDate(new Date(), 'YYYY-MM-DD'),
    endDate: addDays(new Date(), 60),
    skaterName: '',
    skaterPhone: '',
    note: ''
  })

  const selectedRink = useMemo(() => 
    rinks.find(r => r.id === formData.rinkId),
    [rinks, formData.rinkId]
  )

  const filteredBookings = useMemo(() => {
    let result = [...bookings]
    if (filter !== 'all') {
      result = result.filter(b => b.status === filter)
    }
    return result.sort((a, b) => b.date.localeCompare(a.date))
  }, [bookings, filter])

  const handleAddCycle = () => {
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleSelectRink = (rinkId: string) => {
    setFormData(prev => ({ ...prev, rinkId, timeSlotId: '' }))
  }

  const handleSelectTimeSlot = (slot: TimeSlot) => {
    setFormData(prev => ({ ...prev, timeSlotId: slot.id }))
  }

  const handleSelectDay = (day: number) => {
    setFormData(prev => ({ ...prev, dayOfWeek: day }))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.rinkId || !formData.timeSlotId || !formData.skaterName) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }

    const newRule: CycleRule = {
      id: `cycle-${Date.now()}`,
      name: formData.name,
      rinkId: formData.rinkId,
      timeSlotId: formData.timeSlotId,
      dayOfWeek: formData.dayOfWeek,
      startDate: formData.startDate,
      endDate: formData.endDate,
      skaterName: formData.skaterName,
      skaterPhone: formData.skaterPhone,
      note: formData.note
    }

    const newBookings = addCycleRule(newRule)
    
    console.log('[Booking] 创建周期规则并生成预约', { rule: newRule.name, count: newBookings.length })
    
    Taro.showToast({ title: `已生成 ${newBookings.length} 条预约`, icon: 'success' })
    setShowModal(false)
    
    setFormData({
      name: '',
      rinkId: '',
      timeSlotId: '',
      dayOfWeek: 6,
      startDate: formatDate(new Date(), 'YYYY-MM-DD'),
      endDate: addDays(new Date(), 60),
      skaterName: '',
      skaterPhone: '',
      note: ''
    })
  }

  const filterOptions = [
    { value: 'all', label: '全部' },
    { value: 'confirmed', label: '已确认' },
    { value: 'pending', label: '待确认' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' }
  ]

  const weekDays = [0, 1, 2, 3, 4, 5, 6]

  return (
    <View className={styles.page}>
      <View className={styles.tabs}>
        <View
          className={classNames(styles.tabItem, activeTab === 'cycle' && styles.active)}
          onClick={() => setActiveTab('cycle')}
        >
          周期规则
        </View>
        <View
          className={classNames(styles.tabItem, activeTab === 'list' && styles.active)}
          onClick={() => setActiveTab('list')}
        >
          预约列表
        </View>
      </View>

      <ScrollView className={styles.content} scrollY>
        {activeTab === 'cycle' ? (
          <View>
            <Text className={styles.sectionTitle}>
              周期规则 ({cycleRules.length})
            </Text>
            {cycleRules.length > 0 ? (
              cycleRules.map(rule => {
                const rink = rinks.find(r => r.id === rule.rinkId)
                const slot = rink?.timeSlots.find(s => s.id === rule.timeSlotId)
                return (
                  <View key={rule.id} className={styles.cycleCard}>
                    <View className={styles.cycleHeader}>
                      <Text className={styles.cycleName}>{rule.name}</Text>
                      <Text className={styles.cycleStatus}>运行中</Text>
                    </View>
                    <View className={styles.cycleInfo}>
                      <View className={styles.cycleInfoItem}>
                        <Text className={styles.cycleInfoLabel}>冰场:</Text>
                        <Text>{rink?.name || '-'}</Text>
                      </View>
                      <View className={styles.cycleInfoItem}>
                        <Text className={styles.cycleInfoLabel}>时段:</Text>
                        <Text>{slot ? `${slot.startTime}-${slot.endTime}` : '-'}</Text>
                      </View>
                      <View className={styles.cycleInfoItem}>
                        <Text className={styles.cycleInfoLabel}>周期:</Text>
                        <Text>每{getDayName(rule.dayOfWeek)}</Text>
                      </View>
                      <View className={styles.cycleInfoItem}>
                        <Text className={styles.cycleInfoLabel}>有效期:</Text>
                        <Text>{rule.startDate} ~ {rule.endDate}</Text>
                      </View>
                      <View className={styles.cycleInfoItem}>
                        <Text className={styles.cycleInfoLabel}>滑客:</Text>
                        <Text>{rule.skaterName}</Text>
                      </View>
                    </View>
                    <View className={styles.cycleFooter}>
                      <View className={classNames(styles.cycleBtn, styles.secondary)}>
                        查看预约
                      </View>
                      <View className={classNames(styles.cycleBtn, styles.primary)}>
                        编辑
                      </View>
                    </View>
                  </View>
                )
              })
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>📅</Text>
                <Text className={styles.emptyText}>暂无周期规则</Text>
                <Text style={{ fontSize: '24rpx', color: '#94a3b8', marginTop: '16rpx' }}>
                  点击右下角按钮创建周期预约
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View>
            <View className={styles.filterBar}>
              {filterOptions.map(opt => (
                <View
                  key={opt.value}
                  className={classNames(styles.filterItem, filter === opt.value && styles.active)}
                  onClick={() => setFilter(opt.value)}
                >
                  {opt.label}
                </View>
              ))}
            </View>
            {filteredBookings.length > 0 ? (
              filteredBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>❄️</Text>
                <Text className={styles.emptyText}>暂无预约记录</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View className={styles.addBtn} onClick={handleAddCycle}>+</View>

      {showModal && (
        <View className={styles.modal} onClick={handleCloseModal}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>创建周期预约</Text>
              <Text className={styles.modalClose} onClick={handleCloseModal}>×</Text>
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>规则名称</Text>
              <Input
                className={styles.formInput}
                placeholder="例如：每周六上午训练"
                value={formData.name}
                onInput={e => handleInputChange('name', e.detail.value)}
              />
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>选择冰场</Text>
              <View className={styles.rinkPicker}>
                {rinks.map(rink => (
                  <View
                    key={rink.id}
                    className={classNames(styles.rinkOption, formData.rinkId === rink.id && styles.active)}
                    onClick={() => handleSelectRink(rink.id)}
                  >
                    <Text className={styles.rinkOptionName}>{rink.name}</Text>
                    <Text className={styles.rinkOptionDesc}>{rink.description}</Text>
                  </View>
                ))}
              </View>
            </View>

            {selectedRink && (
              <View className={styles.formItem}>
                <TimeSlotPicker
                  slots={selectedRink.timeSlots}
                  selectedId={formData.timeSlotId}
                  onSelect={handleSelectTimeSlot}
                />
              </View>
            )}

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>选择星期</Text>
              <View className={styles.weekPicker}>
                {weekDays.map(day => (
                  <View
                    key={day}
                    className={classNames(styles.weekItem, formData.dayOfWeek === day && styles.active)}
                    onClick={() => handleSelectDay(day)}
                  >
                    {getDayName(day)}
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>开始日期</Text>
              <Input
                className={styles.formInput}
                type="text"
                placeholder="YYYY-MM-DD"
                value={formData.startDate}
                onInput={e => handleInputChange('startDate', e.detail.value)}
              />
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>结束日期</Text>
              <Input
                className={styles.formInput}
                type="text"
                placeholder="YYYY-MM-DD"
                value={formData.endDate}
                onInput={e => handleInputChange('endDate', e.detail.value)}
              />
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>滑客姓名</Text>
              <Input
                className={styles.formInput}
                placeholder="请输入姓名"
                value={formData.skaterName}
                onInput={e => handleInputChange('skaterName', e.detail.value)}
              />
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>联系电话</Text>
              <Input
                className={styles.formInput}
                placeholder="请输入手机号"
                value={formData.skaterPhone}
                onInput={e => handleInputChange('skaterPhone', e.detail.value)}
              />
            </View>

            <View className={styles.submitBtn} onClick={handleSubmit}>
              生成周期预约
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default BookingPage
