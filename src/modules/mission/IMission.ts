import type { EMetier } from "./enum/EMetier.js"

export interface IMission {
  metier: EMetier
  debut: number
  fin: number
}

