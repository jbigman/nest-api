import type { IDay } from './ILodge.js'

export interface IGetLodge {
  name: string
  description: string
  address: string
  admins: string[]
  calendar: IDay[]
  maxDate: number
  holidays: {start: number, end: number}[]
  links: {
    editLodge?: string
    editDay?: string
  }
}

export interface IPostLodge {
  name?: string
  description?: string
  nbLitsDouble?: number
  nbLitsSimple?: number
  prixDraps?: number
  prixLinges?: number
  year?: number
  days?: IDay[]
  maxDate?: string
  holidays?: {start: number, end: number}[]
}

export interface IPostNewLodge {
  name: string
  description: string
  address: string
  year: number
  days: IDay[]
}
export interface IGetPrice {
  name?: string
  from?: number
  to?: number
  price?: number
  taxe?: number
  total?: number
  options: {
    menage?: boolean
    nbLitSimple?: number
    nbLitDouble?: number
    nbLinge?: number
    adults?: number
    kids?: number
    babies?: number
    animals?: number
  }
}

export interface IPostDay extends IDay {
  name: string
}
