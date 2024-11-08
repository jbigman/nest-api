import { Module, forwardRef } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthModule } from '../auth/auth.module.js'
import { MissionController } from './mission.controller.js'
import { Mission, MissionSchema } from './mission.model.js'
import { MissionService } from './mission.service.js'
import { MissionOrm } from './orm/mission.orm.js'
import { IsAdminGuard } from './isAdmin.guard.js'
import { Reflector } from '@nestjs/core'
import { ORM_INTERFACE_TOKEN } from './orm/orm-token.js'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Mission.name, schema: MissionSchema }]),
    forwardRef(() => AuthModule),
  ],
  controllers: [MissionController],
  providers: [
    IsAdminGuard,
    MissionOrm,
    {
      provide: ORM_INTERFACE_TOKEN,  // Use the custom Symbol token for injection
      useClass: MissionOrm,  // Provide the concrete service for the token
    },
    MissionService,
    Reflector, 
  ],
  exports: [MissionService, MissionOrm, ORM_INTERFACE_TOKEN],
})
export class MissionModule {}
