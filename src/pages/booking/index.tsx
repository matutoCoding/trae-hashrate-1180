import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classNames from 'classnames'
import styles from './index.module.scss'
import { useRinkStore } from '@/store/useRinkStore'
import { useBookingStore, previewCycleRule } from '@/store/useBookingStore'
import type { CycleGenerateResult, CyclePreviewResult } from '@/store/useBookingStore'
import { useBillStore } from '@/store/useBillStore'
import BookingCard from '@/components/BookingCard'
import TimeSlotPicker from '@/components/TimeSlotPicker'
import { getDayName, formatDate, addDays, isValidDateString } from '@/utils/date'
import type { TimeSlot } from '@/types/rink'
import type { CycleRule } from '@/types/booking'

type ModalStep = 'form' | 'preview' | 'result'

const BookingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cycle' | 'list'>('cycle')
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [modalStep, setModalStep] = useState<ModalStep>('form')
  const [lastResult, setLastResult] = useState<CycleGenerateResult | null>(null)
  const [previewResult, setPreviewResult] = useState<CyclePreviewResult | null>(null)
  const [pendingRule, setPendingRule] = useState<CycleRule | null>(null)

  const rinks = useRinkStore(state => state.rinks)
  const cycleRules = useBookingStore(state => state.cycleRules)
  const bookings = useBookingStore(state => state.bookings)
  const addCycleRule = useBookingStore(state => state.addCycleRule)
  const createBillForBooking = useBillStore(state => state.createBillForBooking)

  const [formData, setFormData] = useState({
    name: '',
    rinkId: '',
    timeSlotId: '',
    dayOfWeek: 6,
    startDate: formatDate(new Date(), 'YYYY-MM-DD'),
    endDate: addDays(formatDate(new Date(), 'YYYY-MM-DD'), 60),
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
    setModalStep('form')
    setLastResult(null)
    setPreviewResult(null)
    setPendingRule(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setModalStep('form')
    setLastResult(null)
    setPreviewResult(null)
    setPendingRule(null)
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

  const handlePreview = () => {
    if (!formData.name || !formData.rinkId || !formData.timeSlotId || !formData.skaterName) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }

    if (!isValidDateString(formData.startDate)) {
      Taro.showToast({ title: '开始日期格式不正确，应为 YYYY-MM-DD', icon: 'none', duration: 2500 })
      return
    }

    if (!isValidDateString(formData.endDate)) {
      Taro.showToast({ title: '结束日期格式不正确，应为 YYYY-MM-DD', icon: 'none', duration: 2500 })
      return
    }

    if (formData.startDate > formData.endDate) {
      Taro.showToast({ title: '开始日期不能晚于结束日期', icon: 'none', duration: 2500 })
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

    const preview = previewCycleRule(newRule, bookings)

    if (preview.generatedDates.length === 0 && preview.skippedDates.length === 0) {
      Taro.showToast({ title: '所选周期范围内没有可生成的日期', icon: 'none', duration: 2500 })
      return
    }

    if (preview.generatedDates.length === 0) {
      Taro.showToast({ title: '所有日期均已被占用，无法生成预约', icon: 'none', duration: 2500 })
      return
    }

    setPendingRule(newRule)
    setPreviewResult(preview)
    setModalStep('preview')
  }

  const handleConfirmGenerate = () => {
    if (!pendingRule) return

    const result = addCycleRule(pendingRule)

    result.bookings.forEach(booking => {
      const dr = booking.discountResult || {
        originalPrice: booking.originalPrice,
        finalPrice: booking.finalPrice,
        totalDiscount: booking.originalPrice - booking.finalPrice,
        details: [],
        hasNegativeProtection: false
      }
      createBillForBooking(booking, dr)
    })

    setLastResult(result)
    setModalStep('result')
  }

  const handleBackToForm = () => {
    setModalStep('form')
    setPreviewResult(null)
    setPendingRule(null)
  }

  const handleModalDone = () => {
    setShowModal(false)
    setModalStep('form')
    setLastResult(null)
    setPreviewResult(null)
    setPendingRule(null)
    setFormData({
      name: '',
      rinkId: '',
      timeSlotId: '',
      dayOfWeek: 6,
      startDate: formatDate(new Date(), 'YYYY-MM-DD'),
      endDate: addDays(formatDate(new Date(), 'YYYY-MM-DD'), 60),
      skaterName: '',
      skaterPhone: '',
      note: ''
    })
  }

  const filterOptions = [
    { value: 'all', label: '全部' },
    { value: 'confirmed', label: '已确认' },
    { value: 'pending', label: '待支付' },
    { value: 'suspended', label: '已暂停' },
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
            {modalStep === 'result' && lastResult ? (
              <View>
                <View className={styles.modalHeader}>
                  <Text className={styles.modalTitle}>生成结果</Text>
                  <Text className={styles.modalClose} onClick={handleModalDone}>×</Text>
                </View>
                <View className={styles.resultCard}>
                  <View className={styles.resultRow}>
                    <Text className={styles.resultLabel}>成功生成</Text>
                    <Text className={styles.resultValue}>{lastResult.bookings.length} 条预约</Text>
                  </View>
                  <View className={styles.resultRow}>
                    <Text className={styles.resultLabel}>同步创建</Text>
                    <Text className={styles.resultValue}>{lastResult.bookings.length} 笔账单</Text>
                  </View>
                  {lastResult.skippedDates.length > 0 && (
                    <View className={styles.resultSkip}>
                      <Text className={styles.resultSkipTitle}>
                        跳过 {lastResult.skippedDates.length} 个日期（时段已被占用）:
                      </Text>
                      {lastResult.skippedDates.map(d => (
                        <Text key={d} className={styles.resultSkipDate}>{d}</Text>
                      ))}
                    </View>
                  )}
                </View>
                <View className={classNames(styles.submitBtn)} onClick={handleModalDone}>
                  知道了
                </View>
              </View>
            ) : modalStep === 'preview' && previewResult ? (
              <View>
                <View className={styles.modalHeader}>
                  <Text className={styles.modalTitle}>生成预览</Text>
                  <Text className={styles.modalClose} onClick={handleCloseModal}>×</Text>
                </View>
                <View className={styles.resultCard}>
                  <View className={styles.resultRow}>
                    <Text className={styles.resultLabel}>可生成预约</Text>
                    <Text className={styles.resultValue}>{previewResult.generatedDates.length} 个日期</Text>
                  </View>
                  {previewResult.generatedDates.length > 0 && (
                    <View className={styles.dateList}>
                      {previewResult.generatedDates.map(d => (
                        <Text key={d} className={styles.dateTag}>{d}</Text>
                      ))}
                    </View>
                  )}
                  {previewResult.skippedDates.length > 0 && (
                    <View className={styles.resultSkip}>
                      <Text className={styles.resultSkipTitle}>
                        将跳过 {previewResult.skippedDates.length} 个日期:
                      </Text>
                      {previewResult.skippedDates.map(d => (
                        <Text key={d} className={styles.resultSkipDate}>{d}</Text>
                      ))}
                    </View>
                  )}
                </View>
                <View style={{ display: 'flex', gap: '24rpx' }}>
                  <View className={classNames(styles.submitBtn, styles.secondaryBtn)} onClick={handleBackToForm}>
                    返回修改
                  </View>
                  <View className={classNames(styles.submitBtn)} onClick={handleConfirmGenerate}>
                    确认生成
                  </View>
                </View>
              </View>
            ) : (
              <View>
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

                <View className={styles.submitBtn} onClick={handlePreview}>
                  预览生成结果
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  )
}

export default BookingPage
