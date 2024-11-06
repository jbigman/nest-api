export interface IGetRentalRequest {
  email: string
  firstName: string
  lastName: string
  phone?: string
  message: string
  address: string
  from: number
  to: number
  taxe: number
  price: number
  menage: boolean
  nbLitSimple: number
  nbLitDouble: number
  nbLinge: number
  adults: number
  kids: number
  babies: number
  animals: number
  requestDate: number
  paymentStatus: string,
  links: {
    delete?: string
  }
}

export interface IPostRentalRequestBilling {
  custom: {
    email: string
    message: string
  }
  billing: {
    firstName: string
    lastName: string
    phone?: string
    address: {
      line1: string
      line2: string | null
      city: string
      state: string
      postal_code: string
      country: string
    }
  }
}
export interface IPostQuestion {
  email: string
  firstName: string
  lastName: string
  phone: string
  message: string
}
