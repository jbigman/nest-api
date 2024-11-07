import { Module, forwardRef } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthModule } from '../auth/auth.module.js'
import { IsAdminGuard } from './isAdmin.guard.js'
import { MissionController } from './mission.controller.js'
import { Mission, MissionSchema } from './mission.model.js'
import { MissionService } from './mission.service.js'
import { MissionOrm } from './orm/mission.orm.js'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Mission.name, schema: MissionSchema }]),
    forwardRef(() => AuthModule),
  ],
  controllers: [MissionController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: IsAdminGuard,
    },
    MissionOrm,
    MissionService,
  ],
  exports: [MissionService, MissionOrm],
})
export class MissionModule {}
