import { Module, forwardRef } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { MongooseModule } from '@nestjs/mongoose'
import { ORM_INTERFACE_TOKEN } from '../../tokens/orm-token.js'
import { AuthModule } from '../auth/auth.module.js'
import { IsAdminGuard } from './isAdmin.guard.js'
import { MissionController } from './mission.controller.js'
import { Mission, MissionSchema } from './mission.model.js'
import { MissionService } from './mission.service.js'
import { MissionDbService } from './orm/mission.db.service.js'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Mission.name, schema: MissionSchema }]),
    forwardRef(() => AuthModule),
  ],
  controllers: [MissionController],
  providers: [
    IsAdminGuard,
    MissionDbService,
    {
      provide: ORM_INTERFACE_TOKEN, // Use the custom Symbol token for injection
      useClass: MissionDbService, // Provide the concrete service for the token
    },
    MissionService,
    Reflector,
  ],
  exports: [MissionService, MissionDbService, ORM_INTERFACE_TOKEN],
})
export class MissionModule {}
