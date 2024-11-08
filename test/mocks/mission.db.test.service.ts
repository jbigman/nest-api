import { Injectable } from '@nestjs/common'

import type { IOrmInterface } from '../../src/modules/mission/orm/IOrmInterface.ts';
import type { IMission } from '../../src/modules/mission/IMission.ts';
import type { EMetier } from '../../src/modules/mission/enum/EMetier.ts';

@Injectable()
export class MissionDbTestService implements IOrmInterface {
  createMission = async (
    metier: EMetier,
    debut: number,
    fin: number
  ): Promise<IMission> => {
    console.log("Je passe dans le service de base de donnée injectée pour le test.")
    return {
      metier,
      debut,
      fin,
    }
  }
}
