import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Inject,
  NotImplementedException,
  Post,
  UnauthorizedException,
  UseGuards,
  forwardRef,
} from '@nestjs/common'

import { AuthService } from '../auth/auth.service.js'
import type { UserDocument } from '../user/user.model.js'
import { IsAdmin } from './isAdmin.decorator.js'
import { IsAdminGuard } from './isAdmin.guard.js'
import { MissionService } from './mission.service.js'
import type { IRestPostMission } from './rest-interfaces/IRestPostMission.js'

@Controller('mission')
export class MissionController {
  constructor(
    @Inject(forwardRef(() => MissionService))
    private readonly missionService: MissionService,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) {}

  @Post('/create')
  // IsAdmin guard : Verifie que l'utilisateur est bel et bien un admin.
  // Implementé juste pour l'exemple,
  // parceque ca fait doublon avec l'appel necessaire pour generer les liens restfull.
  @IsAdmin()
  @UseGuards(IsAdminGuard) // Apply guard to this specific route
  async createMission(
    // Validation du payload d'entré par les global validator pipes => Badrequest
    @Body() body: IRestPostMission,
    @Headers('authorization') token: string
  ) {
    const requester: UserDocument | null = await this.authService.getUser(token)
    // Doublon avec @IsAdmin.
    if (requester && !requester.isAdmin) {
      throw new UnauthorizedException()
    }
    const document = await this.missionService.createMission(
      body.metier,
      body.debut,
      body.fin
    )

    if (document) {
      // Constrruction du modèle de retour en fonction des droits de l'utilisateur, donc déporté.
      return this.missionService.docToRest(document, requester)
    }
    throw new BadRequestException()
  }

  @Post('/edit')
  @IsAdmin()
  async editMission(
    @Body() body: IRestPostMission,
    @Headers('authorization') token: string
  ) {
    throw new NotImplementedException()
  }
}
