import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classNames from 'classnames'
import styles from './index.module.scss'
import { mockSkateSizes, mockChildSkateSizes } from '@/data/skate'
import type { SkateSize } from '@/types/skate'

const SkateRentalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'adult' | 'child'>('adult')
  const [selectedSize, setSelectedSize] = useState<SkateSize | null>(null)

  const sizes = useMemo(() => {
    return activeTab === 'adult' ? mockSkateSizes : mockChildSkateSizes
  }, [activeTab])

  const handleSelectSize = (size: SkateSize) => {
    if (size.stock > 0) {
      setSelectedSize(size)
    }
  }

  const handleRent = () => {
    if (!selectedSize) {
      Taro.showToast({ title: '请选择尺码', icon: 'none' })
      return
    }
    Taro.showToast({ title: '租借成功', icon: 'success' })
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  }

  return (
    <View className={styles.page}>
      <View className={styles.tabs}>
        <View
          className={classNames(styles.tabItem, activeTab === 'adult' && styles.active)}
          onClick={() => {
            setActiveTab('adult')
            setSelectedSize(null)
          }}
        >
          成人冰刀
        </View>
        <View
          className={classNames(styles.tabItem, activeTab === 'child' && styles.active)}
          onClick={() => {
            setActiveTab('child')
            setSelectedSize(null)
          }}
        >
          儿童冰刀
        </View>
      </View>

      <ScrollView scrollY>
        <View className={styles.content}>
          <View className={styles.sizeGuide}>
            <Text className={styles.guideTitle}>尺码选择指南</Text>
            <Text className={styles.guideDesc}>
              建议选择比平时鞋子大 0.5-1 码的冰刀鞋，穿着厚袜子更舒适。如有疑问，可到场试穿后确定。
            </Text>
          </View>

          {selectedSize && (
            <View className={styles.selectedCard}>
              <View className={styles.selectedRow}>
                <Text className={styles.selectedLabel}>已选尺码</Text>
                <Text className={styles.selectedValue}>
                  {selectedSize.size}码 (EU {selectedSize.euSize})
                </Text>
              </View>
              <View className={styles.selectedRow}>
                <Text className={styles.selectedLabel}>脚长参考</Text>
                <Text className={styles.selectedValue}>{selectedSize.length}mm</Text>
              </View>
              <View className={styles.selectedRow}>
                <Text className={styles.selectedLabel}>租借费用</Text>
                <Text className={styles.selectedPrice}>¥{selectedSize.rentalPrice}/次</Text>
              </View>
            </View>
          )}

          <Text className={styles.sectionTitle}>选择尺码</Text>
          <View className={styles.sizeGrid}>
            {sizes.map(size => (
              <View
                key={size.size}
                className={classNames(
                  styles.sizeItem,
                  selectedSize?.size === size.size && styles.active,
                  size.stock === 0 && styles.disabled
                )}
                onClick={() => handleSelectSize(size)}
              >
                <Text className={styles.sizeValue}>{size.size}</Text>
                <Text className={styles.sizeUnit}>码</Text>
                <Text className={styles.sizeStock}>
                  {size.stock > 0 ? `剩${size.stock}双` : '已租完'}
                </Text>
              </View>
            ))}
          </View>

          <View className={styles.rentalInfo}>
            <Text className={styles.infoTitle}>租借须知</Text>
            <View className={styles.infoList}>
              <View className={styles.infoItem}>
                <Text className={styles.infoIcon}>•</Text>
                <Text>冰刀鞋租借仅限本次滑冰时段使用</Text>
              </View>
              <View className={styles.infoItem}>
                <Text className={styles.infoIcon}>•</Text>
                <Text>请妥善保管冰刀鞋，如有损坏需照价赔偿</Text>
              </View>
              <View className={styles.infoItem}>
                <Text className={styles.infoIcon}>•</Text>
                <Text>建议穿戴厚袜子，避免磨脚</Text>
              </View>
              <View className={styles.infoItem}>
                <Text className={styles.infoIcon}>•</Text>
                <Text>归还时请在前台办理退还手续</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className={styles.footer}>
        <View className={styles.priceInfo}>
          <Text className={styles.priceLabel}>
            {selectedSize ? '租借费用' : '请选择尺码'}
          </Text>
          <Text className={styles.priceValue}>
            ¥{selectedSize ? selectedSize.rentalPrice : 0}
          </Text>
        </View>
        <View
          className={classNames(styles.rentBtn, !selectedSize && styles.disabled)}
          onClick={handleRent}
        >
          立即租借
        </View>
      </View>
    </View>
  )
}

export default SkateRentalPage
