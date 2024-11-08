import { Inject, Injectable } from '@nestjs/common'
import type { UserDocument } from '../user/user.model.js'
import type { EMetier } from './enum/EMetier.js'
import { BusinessError } from './exception/BusinessError.js'
import type { MissionOrm } from './orm/mission.orm.js'
import type { IGetMission } from './rest-interfaces/IGetMission.js'
import type { IMission } from './IMission.js'
import { ORM_INTERFACE_TOKEN } from './orm/orm-token.js'

@Injectable()
export class MissionService {
  constructor(
    @Inject(ORM_INTERFACE_TOKEN)
    private readonly missionOrm: MissionOrm
  ) {}

  /**
   * Créé la mission en fonction des parametres saisis
   * En vérifiant que la date de fin est posterieur à la date de début.
   * @param body
   * @returns MissionDocument
   */
  createMission = async (metier: EMetier, debut: number, fin: number) => {
    if (debut > fin) {
      // Rejete une erreur classique qui sera interpretée par le script
      // Dans le cas du controller nest, un globalExceptionFilter va l'intercepter pour retourner
      // La réponse correctement attendu equivalente à new BadRequestException()
      throw new BusinessError(
        'date de debut doit être anterieur à la date de fin'
      )
    }
    // N'appelle pas la couche mongo directement, mais appel createMission dans missionOrm qui
    // implemente l'interface IMissionOrm necessaire pour
    // faire de l'injection et remplacer l'implementation par n'importe quelle DB
    return await this.missionOrm.createMission(metier, debut, fin)
  }

  /**
   * Gateway utilisée par le script avec une durée en param
   */
  scriptCreateMission = async (
    metier: EMetier,
    debut: number,
    durée: number
  ) => {
    const fin = debut + durée * 60 * 1000
    return await this.createMission(metier, debut, fin)
  }

  /**
   * les liens restfull peuvent contenir de la logique métier (ici des liens pour les admins)
   * Donc je prefère laisser ce transformer dans le service.
   *
   * @param doc issu de la DB
   * @param requester l'auteur de l'appel
   * @returns IGetMission
   */
  docToRest = async (
    doc: IMission,
    requester: null | UserDocument
  ): Promise<IGetMission> => {
    const restMission: IGetMission = {
      metier: doc.metier,
      debut: doc.debut,
      fin: doc.fin,
      links: {},
    }

    // Logique metier
    if (requester?.isAdmin) {
      restMission.links.editMission = '/mission/edit'
    }
    return restMission
  }
}
