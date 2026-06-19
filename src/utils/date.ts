const DAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export function formatDate(date: string | Date, format: string = 'YYYY-MM-DD'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

export function getDayOfWeek(date: string | Date): number {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.getDay()
}

export function getDayName(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek] || ''
}

export function getDateDayName(date: string | Date): string {
  return getDayName(getDayOfWeek(date))
}

export function generateDatesByWeekday(
  startDate: string,
  endDate: string,
  dayOfWeek: number
): string[] {
  const dates: string[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const current = new Date(start)
  while (current.getDay() !== dayOfWeek) {
    current.setDate(current.getDate() + 1)
  }
  
  while (current <= end) {
    dates.push(formatDate(current, 'YYYY-MM-DD'))
    current.setDate(current.getDate() + 7)
  }
  
  console.log('[Date] 生成周期日期', { startDate, endDate, dayOfWeek, count: dates.length })
  return dates
}

export function addDays(date: string, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return formatDate(d, 'YYYY-MM-DD')
}

export function isToday(date: string): boolean {
  const today = formatDate(new Date(), 'YYYY-MM-DD')
  return date === today
}

export function isFuture(date: string): boolean {
  const today = formatDate(new Date(), 'YYYY-MM-DD')
  return date > today
}

export function formatDateTime(date: string): string {
  return formatDate(date, 'MM-DD HH:mm')
}
