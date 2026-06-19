import Taro from '@tarojs/taro'

const PREFIX = 'ice_rink_'

export function loadPersisted<T>(key: string, fallback: T): T {
  try {
    const raw = Taro.getStorageSync(`${PREFIX}${key}`)
    if (raw) {
      return JSON.parse(raw) as T
    }
  } catch (e) {
    console.error('[Persist] 加载失败', key, e)
  }
  return fallback
}

export function persistData<T>(key: string, data: T): void {
  try {
    Taro.setStorageSync(`${PREFIX}${key}`, JSON.stringify(data))
  } catch (e) {
    console.error('[Persist] 保存失败', key, e)
  }
}
