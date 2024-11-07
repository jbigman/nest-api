import type { EMetier } from '../enum/EMetier.js'

export interface IRestPostMission {
  metier: EMetier
  debut: number
  fin: number
}
