export interface IRentalRequest {
  accepted?: boolean
  refused?: boolean
  requestDate: number
  email: string
  firstName: string
  lastName: string
  address: string
  phone?: string
  message: string
  from: number
  to: number
  menage: boolean
  price: number
  optionsPrice: number
  taxe: number
  nbLitSimple: number
  nbLitDouble: number
  nbLinge: number
  adults: number
  kids: number
  babies: number
  animals: number
  paymentStatus: string
  clientSecret: string
}

export interface IPostNewRentalRequest {
  from: number
  to: number
  price: number
  taxe: number
  total: number
  options: {
    menage: boolean
    nbLitSimple: number
    nbLitDouble: number
    nbLinge: number
    adults: number
    kids: number
    babies: number
    animals: number
  }
}
