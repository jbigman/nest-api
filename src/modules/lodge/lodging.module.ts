import { Module, forwardRef } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthModule } from '../auth/auth.module.js'
import { LodgeController } from './lodge.controller.js'
import { Lodge, LodgeSchema } from './lodge.model.js'
import { LodgeService } from './lodge.service.js'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lodge.name, schema: LodgeSchema }]),
    forwardRef(() => AuthModule),
  ],
  controllers: [LodgeController],
  providers: [LodgeService],
  exports: [LodgeService],
})
export class LodgeModule {}
