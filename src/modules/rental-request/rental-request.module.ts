import { Module, forwardRef } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthModule } from '../auth/auth.module.js'
import { Lodge, LodgeSchema } from '../lodge/lodge.model.js'
import { LodgeService } from '../lodge/lodge.service.js'
import { RentalRequestController } from './rental-request.controller.js'
import { RentalRequest, RentalRequestSchema } from './rental-request.model.js'
import { RentalRequestService } from './rental-request.service.js'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RentalRequest.name, schema: RentalRequestSchema },
      { name: Lodge.name, schema: LodgeSchema },
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [RentalRequestController],
  providers: [RentalRequestService, ConfigService, LodgeService],
  exports: [RentalRequestService],
})
export class RentalRequestModule {}
