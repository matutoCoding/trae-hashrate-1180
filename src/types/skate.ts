export interface SkateSize {
  size: string
  euSize: string
  usSize: string
  length: number
  stock: number
  rentalPrice: number
}

export interface SkateRentalRecord {
  id: string
  bookingId: string
  size: string
  rentalPrice: number
  status: 'rented' | 'returned'
  rentTime: string
  returnTime?: string
}
