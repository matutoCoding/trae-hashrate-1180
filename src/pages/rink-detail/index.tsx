import React, { useState, useMemo } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classNames from 'classnames'
import styles from './index.module.scss'
import { useRinkStore } from '@/store/useRinkStore'
import TimeSlotPicker from '@/components/TimeSlotPicker'
import type { TimeSlot } from '@/types/rink'

const RinkDetailPage: React.FC = () => {
  const router = useRouter()
  const { getRinkById } = useRinkStore()
  const rinkId = router.params.id as string
  
  const rink = useMemo(() => getRinkById(rinkId), [getRinkById, rinkId])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)

  const typeMap: Record<string, { label: string; className: string }> = {
    standard: { label: '标准冰场', className: '' },
    vip: { label: 'VIP 冰场', className: styles.vipTag },
    training: { label: '训练冰场', className: styles.trainingTag }
  }

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot)
  }

  const handleBook = () => {
    if (!selectedSlot) {
      Taro.showToast({ title: '请先选择时段', icon: 'none' })
      return
    }
    Taro.showToast({ title: '预约功能开发中', icon: 'none' })
  }

  if (!rink) {
    return (
      <View className={styles.page}>
        <Text>冰场不存在</Text>
      </View>
    )
  }

  const typeInfo = typeMap[rink.type] || typeMap.standard
  const minPrice = Math.min(...rink.timeSlots.map(s => s.price))

  return (
    <View className={styles.page}>
      <Image className={styles.banner} src={rink.image} mode="aspectFill" />
      
      <ScrollView scrollY>
        <View className={styles.content}>
          <View className={styles.header}>
            <Text className={styles.name}>{rink.name}</Text>
            <View className={styles.typeRow}>
              <Text className={classNames(styles.typeTag, typeInfo.className)}>
                {typeInfo.label}
              </Text>
            </View>
            <Text className={styles.desc}>{rink.description}</Text>
          </View>

          <View className={styles.infoCard}>
            <Text className={styles.cardTitle}>基本信息</Text>
            <View className={styles.infoGrid}>
              <View className={styles.infoItem}>
                <Text className={styles.infoIcon}>👥</Text>
                <Text className={styles.infoLabel}>容量</Text>
                <Text className={styles.infoValue}>{rink.capacity}人</Text>
              </View>
              <View className={styles.infoItem}>
                <Text className={styles.infoIcon}>📐</Text>
                <Text className={styles.infoLabel}>面积</Text>
                <Text className={styles.infoValue}>{rink.iceArea}㎡</Text>
              </View>
            </View>
          </View>

          <View className={styles.infoCard}>
            <Text className={styles.cardTitle}>配套设施</Text>
            <View className={styles.facilityList}>
              {rink.facilities.map((facility, index) => (
                <View key={index} className={styles.facilityItem}>
                  {facility}
                </View>
              ))}
            </View>
          </View>

          <View className={styles.slotSection}>
            <TimeSlotPicker
              slots={rink.timeSlots}
              selectedId={selectedSlot?.id}
              onSelect={handleSelectSlot}
            />
          </View>
        </View>
      </ScrollView>

      <View className={styles.footer}>
        <View className={styles.priceInfo}>
          <Text className={styles.priceLabel}>
            {selectedSlot ? '当前选择' : '最低价格'}
          </Text>
          <Text className={styles.priceValue}>
            ¥{selectedSlot ? selectedSlot.price : minPrice}
          </Text>
        </View>
        <View
          className={classNames(styles.bookBtn, !selectedSlot && styles.disabled)}
          onClick={handleBook}
        >
          立即预约
        </View>
      </View>
    </View>
  )
}

export default RinkDetailPage
