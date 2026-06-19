import type { Rink } from '@/types/rink'

export const mockRinks: Rink[] = [
  {
    id: 'rink-1',
    name: '主冰场 A 区',
    description: '标准奥运规格冰面，适合自由滑和冰球运动',
    type: 'standard',
    capacity: 100,
    iceArea: 1800,
    facilities: ['冰球装备', '护具租赁', '休息区', '储物柜'],
    image: 'https://picsum.photos/id/1018/750/400',
    timeSlots: [
      { id: 'slot-1-1', startTime: '09:00', endTime: '11:00', price: 80, type: 'off-peak' },
      { id: 'slot-1-2', startTime: '11:00', endTime: '13:00', price: 100, type: 'normal' },
      { id: 'slot-1-3', startTime: '13:00', endTime: '15:00', price: 100, type: 'normal' },
      { id: 'slot-1-4', startTime: '15:00', endTime: '17:00', price: 120, type: 'peak' },
      { id: 'slot-1-5', startTime: '17:00', endTime: '19:00', price: 150, type: 'peak' },
      { id: 'slot-1-6', startTime: '19:00', endTime: '21:00', price: 120, type: 'normal' }
    ],
    status: 'open'
  },
  {
    id: 'rink-2',
    name: 'VIP 冰场 B 区',
    description: '高端专属冰面，人少环境好，配备专业教练',
    type: 'vip',
    capacity: 30,
    iceArea: 1200,
    facilities: ['VIP 休息室', '专业教练', '高档护具', '免费饮品'],
    image: 'https://picsum.photos/id/1015/750/400',
    timeSlots: [
      { id: 'slot-2-1', startTime: '09:00', endTime: '11:00', price: 200, type: 'off-peak' },
      { id: 'slot-2-2', startTime: '11:00', endTime: '13:00', price: 250, type: 'normal' },
      { id: 'slot-2-3', startTime: '13:00', endTime: '15:00', price: 250, type: 'normal' },
      { id: 'slot-2-4', startTime: '15:00', endTime: '17:00', price: 300, type: 'peak' },
      { id: 'slot-2-5', startTime: '17:00', endTime: '19:00', price: 350, type: 'peak' },
      { id: 'slot-2-6', startTime: '19:00', endTime: '21:00', price: 280, type: 'normal' }
    ],
    status: 'open'
  },
  {
    id: 'rink-3',
    name: '训练冰场 C 区',
    description: '专业训练冰面，适合花样滑冰和冰球训练',
    type: 'training',
    capacity: 50,
    iceArea: 1500,
    facilities: ['训练器材', '教练指导', '镜子墙', '体能区'],
    image: 'https://picsum.photos/id/1036/750/400',
    timeSlots: [
      { id: 'slot-3-1', startTime: '08:00', endTime: '10:00', price: 120, type: 'off-peak' },
      { id: 'slot-3-2', startTime: '10:00', endTime: '12:00', price: 150, type: 'normal' },
      { id: 'slot-3-3', startTime: '14:00', endTime: '16:00', price: 150, type: 'normal' },
      { id: 'slot-3-4', startTime: '16:00', endTime: '18:00', price: 180, type: 'peak' },
      { id: 'slot-3-5', startTime: '19:00', endTime: '21:00', price: 160, type: 'normal' }
    ],
    status: 'open'
  },
  {
    id: 'rink-4',
    name: '亲子冰场 D 区',
    description: '专门为家庭亲子打造，冰层较薄更安全',
    type: 'standard',
    capacity: 60,
    iceArea: 1000,
    facilities: ['小企鹅助手', '亲子休息区', '儿童护具', '玩具区'],
    image: 'https://picsum.photos/id/1039/750/400',
    timeSlots: [
      { id: 'slot-4-1', startTime: '10:00', endTime: '12:00', price: 60, type: 'off-peak' },
      { id: 'slot-4-2', startTime: '13:00', endTime: '15:00', price: 80, type: 'normal' },
      { id: 'slot-4-3', startTime: '15:00', endTime: '17:00', price: 90, type: 'peak' },
      { id: 'slot-4-4', startTime: '17:00', endTime: '19:00', price: 100, type: 'peak' }
    ],
    status: 'open'
  }
]
