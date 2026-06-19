export function formatPrice(price: number, symbol: string = '¥'): string {
  return `${symbol}${price.toFixed(2)}`
}

export function formatPriceInt(price: number, symbol: string = '¥'): string {
  return `${symbol}${Math.round(price)}`
}

export function roundPrice(price: number): number {
  return Math.round(price * 100) / 100
}

export function addPrices(...prices: number[]): number {
  return roundPrice(prices.reduce((sum, p) => sum + p, 0))
}

export function subtractPrices(minuend: number, ...subtrahends: number[]): number {
  return roundPrice(subtrahends.reduce((result, p) => result - p, minuend))
}
