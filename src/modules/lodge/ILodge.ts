export interface IDay {
  year: number
  month: number
  day: number
  disabled?: boolean
  price: number
}
export interface IHoliday {
  start: number
  end: number
}

export interface ILodge {
  name: string
  description: string
  address: string
  admins: string[]
  calendar: IDay[]
  params: ILodgeParams
}

export interface ILodgeParams {
  arrivalTime: number
  departureTime: number
  prixDraps: number
  nbDouble: number
  nbSimple: number
  prixLinges: number
  holidays: IHoliday[]
  maxDate: number
}
