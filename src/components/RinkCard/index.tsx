import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classNames from 'classnames'
import styles from './index.module.scss'
import type { Rink } from '@/types/rink'

interface RinkCardProps {
  rink: Rink
  onClick?: () => void
}

const RinkCard: React.FC<RinkCardProps> = ({ rink, onClick }) => {
  const typeLabel: Record<string, string> = {
    standard: '标准冰场',
    vip: 'VIP 冰场',
    training: '训练冰场'
  }

  const typeClass: Record<string, string> = {
    standard: styles.typeStandard,
    vip: styles.typeVip,
    training: styles.typeTraining
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      Taro.navigateTo({
        url: `/pages/rink-detail/index?id=${rink.id}`
      })
    }
  }

  return (
    <View className={styles.card} onClick={handleClick}>
      <Image className={styles.image} src={rink.image} mode="aspectFill" />
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.name}>{rink.name}</Text>
          <Text className={classNames(styles.typeTag, typeClass[rink.type])}>
            {typeLabel[rink.type]}
          </Text>
        </View>
        <Text className={styles.desc}>{rink.description}</Text>
        <View className={styles.footer}>
          <View className={styles.price}>
            <Text className={styles.priceLabel}>起</Text>
            <Text className={styles.priceValue}>
              ¥{Math.min(...rink.timeSlots.map(s => s.price))}
            </Text>
          </View>
          <View className={styles.info}>
            <Text className={styles.infoItem}>容量 {rink.capacity}人</Text>
            <Text className={styles.infoItem}>{rink.iceArea}㎡</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default RinkCard
