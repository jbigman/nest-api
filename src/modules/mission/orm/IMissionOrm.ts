import type { IMission } from '../IMission.js'
import type { EMetier } from '../enum/EMetier.js'

export interface IOrmInterface {
  createMission(metier: EMetier, debut: number, fin: number): Promise<IMission>
}
