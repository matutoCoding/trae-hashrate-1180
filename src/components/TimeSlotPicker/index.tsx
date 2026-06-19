import React from 'react'
import { View, Text } from '@tarojs/components'
import classNames from 'classnames'
import styles from './index.module.scss'
import type { TimeSlot } from '@/types/rink'

interface TimeSlotPickerProps {
  slots: TimeSlot[]
  selectedId?: string
  onSelect?: (slot: TimeSlot) => void
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ slots, selectedId, onSelect }) => {
  const typeLabel: Record<string, string> = {
    peak: '高峰',
    normal: '常规',
    'off-peak': '平峰'
  }

  const typeClass: Record<string, string> = {
    peak: styles.peak,
    normal: styles.normal,
    'off-peak': styles.offPeak
  }

  return (
    <View className={styles.container}>
      <Text className={styles.title}>选择时段</Text>
      <View className={styles.slotList}>
        {slots.map(slot => (
          <View
            key={slot.id}
            className={classNames(
              styles.slotItem,
              selectedId === slot.id && styles.selected
            )}
            onClick={() => onSelect?.(slot)}
          >
            <View className={styles.slotTime}>
              <Text className={styles.startTime}>{slot.startTime}</Text>
              <Text className={styles.dash}>-</Text>
              <Text className={styles.endTime}>{slot.endTime}</Text>
            </View>
            <View className={styles.slotInfo}>
              <Text className={classNames(styles.typeTag, typeClass[slot.type])}>
                {typeLabel[slot.type]}
              </Text>
              <Text className={styles.price}>¥{slot.price}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

export default TimeSlotPicker
